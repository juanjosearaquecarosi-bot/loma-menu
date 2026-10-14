# NFC Menu — MVP del menú público

Menú digital móvil, multi-negocio, accesible por NFC/QR. Primer negocio cargado: **Loma Linda Coffee House San Cristóbal** (transcrito de 18 imágenes).

```bash
npm install
npm run dev        # http://localhost:5173/m/loma-linda
npm test           # 14 pruebas (zona horaria, rotación de almuerzo, búsqueda, integridad de datos)
npm run build      # tsc + vite build -> dist/ (Vercel: vercel.json ya reescribe a index.html)
```

## Rutas
- `/m/:slug` menú público
- `/q/:codigo` lo que se graba en el chip NFC y en el QR; resuelve el código a un negocio (hoy `demo-ll`). **Graba siempre `/q/<codigo>`, nunca `/m/<slug>`**: así puedes mover o renombrar el menú sin reprogramar stands.

## Agregar otro negocio
1. Copia `src/data/loma-linda.json` como `src/data/<slug>.json` y cambia datos y `tema`.
2. Regístralo en `src/lib/repo.ts` y agrega su código en `src/data/enlaces.json`.
3. Con Supabase: reemplaza `getNegocio` y `resolverEnlace` en `src/lib/repo.ts` (ver `supabase/migrations/001_nfc_menu_propuesta.sql`, **no aplicada**).

## Qué no incluye (a propósito)
Panel de administración, extractor foto→menú y pagos: viven en tu V1 / etapas siguientes. Las fotos de platos son opcionales (`imagen` por ítem); no hay fotos de relleno.
