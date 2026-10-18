# NFC Menu — MVP del menú público

Menú digital móvil, multi-negocio, accesible por NFC/QR. Primer negocio cargado: **Loma Linda Coffee House San Cristóbal** (transcrito de 18 imágenes).

```bash
npm install
npm run dev        # http://localhost:5173/m/loma-linda
npm test           # 22 pruebas (zona horaria, tema semanal, carrito, búsqueda, integridad de datos)
npm run build      # tsc + vite build -> dist/ (Vercel: vercel.json ya reescribe a index.html)
```

## Rutas
- `/m/:slug` menú público (bienvenida + carta + carrito)
- `/m/:slug/admin` panel de administración local (borrador en `localStorage` + descarga de JSON)
- `/q/:codigo` lo que se graba en el chip NFC y en el QR; resuelve el código a un negocio (hoy `demo-ll`). **Graba siempre `/q/<codigo>`, nunca `/m/<slug>`**: así puedes mover o renombrar el menú sin reprogramar stands.

## Qué incluye esta versión
- **Bienvenida NFC/QR**: logo real del negocio (`public/logo-claro.jpg` / `public/logo-negro.jpg`), acceso al menú, WiFi, métodos de pago, Instagram y WhatsApp con mensaje predefinido. Solo muestra lo configurado.
- **Menú digital**: separación visual entre categorías, títulos en naranja, buscador de productos.
- **Secciones nuevas**: Desayunos (precios por confirmar), Empanadas ($4.000 c/u: carne mechada, pollo, mixta) y Pasteles ($3.000; pollo/maíz/tocineta $4.000). La carta impresa conserva sus precios en € sin convertir.
- **Almuerzos**: 3 platos fijos (pechuga, bistec, chuleta) + rotación semanal de 3 sets + plato del día por día.
- **Carrito**: agregar/quitar cantidades, resumen con nota, totales por moneda y envío del pedido por WhatsApp ordenado.
- **Temas claro/oscuro**: rotación semanal automática (semana ISO par → claro, impar → oscuro) con el logo correspondiente.
- **Admin (`/m/:slug/admin`)**: edita nombre, contacto, WiFi, métodos de pago, platos del día, productos y precios; guarda borrador en el dispositivo y descarga el JSON para publicarlo (reemplazar `src/data/<slug>.json`).

## Datos que faltan por parte del cliente
- Número de WhatsApp, Instagram, correo, dirección, RIF y mensajería de bienvenida oficial.
- Red/clave del WiFi del local.
- Métodos de pago con sus detalles.
- Los precios de los Desayunos se dejaron en `null` (se muestran como "Consultar") hasta que el para presentar el cliente los confirme. No se inventó ningún precio.

## Agregar otro negocio
1. Copia `src/data/loma-linda.json` como `src/data/<slug>.json` y cambia datos y `tema`.
2. Regístralo en `src/lib/repo.ts` y agrega su código en `src/data/enlaces.json`.
3. Con Supabase: reemplaza `getNegocio` y `resolverEnlace` en `src/lib/repo.ts` (ver `supabase/migrations/001_nfc_menu_propuesta.sql`, **no aplicada**).

## Qué no incluye (a propósito)
Panel de administración, extractor foto→menú y pagos: viven en tu V1 / etapas siguientes. Las fotos de platos son opcionales (`imagen` por ítem); no hay fotos de relleno.
