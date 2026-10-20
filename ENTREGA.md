# Entrega — NFC Menu · Loma Linda

## Verificaciones automáticas (CI en `.github/workflows/ci.yml`)
`tsc --noEmit` · `vitest run` (37 pruebas) · `npm run build` · `npm audit --audit-level=high`.

## Seguridad
- **Cabeceras** (`vercel.json`): CSP estricta (`script-src 'self'`, sin scripts en línea), HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP.
- **Admin**: `noindex` (meta + cabecera), `robots.txt`, sin caché. La autorización real es RLS en Supabase (`002_menu_docs.sql`), no la interfaz.
- **Claves**: solo la `anon` en el frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON`). La `service_role` NUNCA va en Vercel ni en el código. Desactivar el registro público en Supabase Auth.
- **Datos**: el documento del menú se valida (`src/lib/validar.ts`) al leerlo de la nube y antes de publicar; si es inválido se usa la copia del código. Enlaces de WhatsApp/Instagram/reseña solo http(s) o hosts permitidos; el mensaje de WhatsApp sanea saltos de línea; sin `innerHTML`.
- **Resiliencia**: tiempos máximos en llamadas a Supabase, ErrorBoundary, el menú funciona sin red (service worker) y sin Supabase (copia incluida).

## Accesibilidad / móvil
Auditoría axe-core (WCAG 2 A/AA + buenas prácticas) en bienvenida, menú, carrito, pago y panel, temas naranja y negro: 0 violaciones. Probado a 390 px sin scroll horizontal. Texto blanco sobre naranja solo en tamaños grandes (contraste ≈3,5:1); texto pequeño en negro.

## Antes de dar por entregado (lo que NO puede verificar el código)
- [ ] Supabase: SQL ejecutado, usuarios creados, `menu_admins` asignado, registro público desactivado.
- [ ] Vercel: variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON` (tipo Configuración) y redeploy.
- [ ] Primer "Publicar" desde `/admin/loma-linda` y verificar el menú público.
- [ ] Cargar RIF/razón social y Wi-Fi en el panel; confirmar con el cliente moneda de Tequeños, horario de almuerzo y domingo.
- [ ] Probar un pedido real de punta a punta (WhatsApp + comprobante) con el personal.
- [ ] Probar chip NFC / QR `/q/demo-ll` en iPhone y Android.
- [ ] Dominio propio (ej. menu.nfc.com.ve) y respaldo del JSON de `menu_docs` (exportar desde el panel o Supabase).
