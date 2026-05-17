# Escriba

OCR + traducción para textos físicos. Parte del ecosistema indplaneta.

## Estructura del repo

```
escriba/
├── index.html              ← app completa (free + pro)
├── functions/
│   └── ocr.js              ← Cloudflare Pages Function (Vision + DeepL)
└── README.md
```

## Deploy en Cloudflare Pages

1. Sube esta carpeta a un repo en GitHub
2. Cloudflare Pages → "Create a project" → conecta el repo
3. Build settings: ninguno (sitio estático + functions)
4. Settings → Environment variables:
   - `GOOGLE_VISION_KEY` → tu API key de Google Cloud Vision (`AIza...`)
   - `DEEPL_KEY` → tu Auth Key de DeepL (`xxxxxxxx:fx`)
5. Custom domains → `escriba.indplaneta.com`

## Activar modo Pro (Lemon Squeezy)

En `index.html` reemplaza:
```js
const LS_CHECKOUT_URL = 'LEMON_SQUEEZY_CHECKOUT_URL';
const LS_STORE_ID     = 'LEMON_SQUEEZY_STORE_ID';
```

Flujo post-pago: LS redirige a `escriba.indplaneta.com?activated=true&license=KEY`
→ la app detecta el parámetro y activa Pro automáticamente.

## Obtener API keys

### Google Vision
1. console.cloud.google.com → tu proyecto existente
2. APIs → Cloud Vision API → Activar
3. Credenciales → Crear clave de API (formato `AIza...`)

### DeepL
1. deepl.com/pro-api → plan Free (500K chars/mes gratis)
2. Dashboard → Auth Key (formato `xxxxxxxx:fx`)

## Costos Pro estimados por página
- Google Vision: ~$0.0015
- DeepL: ~$0.00002  
- Cloudflare: $0
- **Total: ~$0.005/pág** — margen amplio con $15/año
