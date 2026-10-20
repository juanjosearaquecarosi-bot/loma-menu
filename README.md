# NFC Menu — menú digital multi-negocio (MVP)

Primer negocio cargado: **Loma Linda Coffee House San Cristóbal**.

```bash
npm install
npm run dev        # http://localhost:5173/b/loma-linda
npm test           # 34 pruebas (horario/semana ISO, temas, formato, búsqueda, contacto, carrito, integridad de datos)
npm run build      # tsc + vite build -> dist/ (Vercel: vercel.json ya reescribe a index.html)
```

## Rutas
| Ruta | Qué es |
|---|---|
| `/q/:codigo` | Lo que se graba en el chip NFC y en el QR. Resuelve el código y lleva a `/b/:slug`. **Graba siempre `/q/<codigo>`, nunca `/m/<slug>`**: así puedes mover o renombrar el menú sin reprogramar stands. |
| `/b/:slug` | Pantalla de bienvenida: logo, botón "Ver el menú", WhatsApp, Instagram, reseña, Wi-Fi (con QR para conectarse) y métodos de pago. Solo aparece lo que el negocio tiene configurado. |
| `/m/:slug` | Menú: almuerzo por día, desayunos y carta, con buscador y carrito. |
| `?tema=naranja` / `?tema=negro` | Previsualiza el tema (por defecto alterna cada semana). |

## Datos de un negocio (`src/data/<slug>.json`)
- `temas` + `tema_modo` (`auto` alterna cada semana ISO) + `tema_par` (qué tema usan las semanas pares).
- `logo`: URL o ruta del logo. Si falta se muestra un emblema genérico de relleno.
- `enlaces`: `whatsapp` (solo dígitos con código de país), `whatsapp_mensaje`, `instagram` (`@usuario` o URL), `google_review`, `wifi {red, clave, seguridad}`, `pagos [{metodo, detalle}]`.
- `pedidos: {activo: true}`: activa el carrito. Solo funciona si hay `enlaces.whatsapp`.
- `almuerzo`: `platos_fijos` (3 base), `cuarto_plato.actual` (cambia cada **semana**; `null` = "pregunta por el plato de la semana"), `plato_del_dia` (fijo por día de la semana), `dias_sin_servicio`.
- `categorias[].items[]`: `precio` o `precios` por tamaño; `moneda` por ítem (los desayunos van en `COP`); `subgrupo` para subtítulos dentro de una categoría.

## Negocio de prueba (solo `npm run dev`)
`/b/demo-pruebas` (código `demo-pr`) trae datos **ficticios** de WhatsApp, Instagram, Wi-Fi y pagos para ver todo funcionando. No existe en el build de producción (verificado).

## Agregar otro negocio
1. Copia `src/data/loma-linda.json` como `src/data/<slug>.json` y cambia los datos.
2. Regístralo en `src/lib/repo.ts` y agrega su código en `src/data/enlaces.json`.
3. Con Supabase: reemplaza `getNegocio` y `resolverEnlace` en `src/lib/repo.ts` (ver `supabase/migrations/001_nfc_menu_propuesta.sql`, **no aplicada**).

## Qué NO incluye (a propósito)
Panel de administración (login, edición de precios, plato de la semana, métodos de pago): vive en tu V1. Aquí solo está el lado público y el contrato de datos que ese panel debe escribir.

## Panel admin (/admin/loma-linda)
- Edita precios, títulos, descripciones, almuerzo, enlaces y pagos.
- **Sin Supabase** (por defecto): guarda un borrador en el navegador; "Descargar JSON" y pégalo en `src/data/loma-linda.json` para publicarlo. Vista previa con `?borrador=1`.
- **Con Supabase**: corre `supabase/migrations/002_menu_docs.sql`, crea el usuario del cliente en Authentication, asígnalo con el `insert into menu_admins` del final del SQL y define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON` en Vercel. Entonces el panel pide login y "Publicar" actualiza el menú público al instante. La seguridad la da RLS, no la interfaz.
