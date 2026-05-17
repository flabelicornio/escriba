export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { image, targetLang } = await request.json();
    const VISION_KEY = env.GOOGLE_VISION_KEY;
    const DEEPL_KEY = env.DEEPL_KEY;

    // 1. Google Vision OCR
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          }],
        }),
      }
    );
    const visionData = await visionRes.json();
    const rawText = visionData.responses?.[0]?.fullTextAnnotation?.text || "";

    if (!rawText) {
      return new Response(JSON.stringify({ text: "", translated: "" }), { headers: corsHeaders });
    }

    // 2. Limpieza de texto: quitar números de página, saltos mid-sentence, guiones de corte
    const cleanText = cleanOcrText(rawText);

    // 3. DeepL translation (Pro only, optional)
    let translated = "";
    if (targetLang && DEEPL_KEY) {
      const deeplRes = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${DEEPL_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ text: cleanText, target_lang: targetLang }),
      });
      const deeplData = await deeplRes.json();
      translated = deeplData.translations?.[0]?.text || "";
    }

    return new Response(JSON.stringify({ text: cleanText, translated }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ── Text cleanup ──────────────────────────────────────────────
function cleanOcrText(raw) {
  return raw
    // Remove isolated page numbers (line that's just a number)
    .replace(/^\s*\d{1,4}\s*$/gm, "")
    // Remove running headers/footers (short lines under 40 chars repeated — heuristic)
    .replace(/^.{1,40}\n(?=.{1,40}\n)/gm, "")
    // Join hyphenated line breaks (word- \n next → wordnext)
    .replace(/(\w)-\n(\w)/g, "$1$2")
    // Join mid-sentence line breaks (line doesn't end in . ? ! : )
    .replace(/([^.?!:»""])\n([a-záéíóúüñ«""¿¡a-z])/gi, "$1 $2")
    // Collapse multiple blank lines into one paragraph break
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
