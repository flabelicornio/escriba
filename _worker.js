import { ocrHandler } from './functions/ocr.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route /functions/ocr to the OCR handler
    if (url.pathname === '/functions/ocr') {
      return ocrHandler(request, env);
    }

    // Everything else → static assets (index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
