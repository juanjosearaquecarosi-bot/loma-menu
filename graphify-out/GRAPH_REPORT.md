# Graph Report - nfc-menu  (2026-10-20)

## Corpus Check
- Corpus is ~40,963 words - fits in a single context window. You may not need a graph.

## Summary
- 310 nodes · 688 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 3% INFERRED · 1% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 235,042 input · 0 output

## Community Hubs (Navigation)
- Componentes UI del Menu
- Datos, Repo y Store
- Dependencias del Paquete
- Seguridad, CI y Entrega
- Carrito y Pedido WhatsApp
- Almuerzo, Horario y Tema
- Referencia de Diseno Bomba
- Logo Claro Loma Linda
- Config TypeScript
- Logo Oscuro Loma Linda
- Identidad de Marca Loma Linda
- Esquema Supabase Inicial
- Carta y Vista de Productos
- Borradores del Panel Admin
- Esquema Menu Docs y RLS
- Config de Vercel

## God Nodes (most connected - your core abstractions)
1. `AdminPage()` - 18 edges
2. `CarritoProvider()` - 16 edges
3. `BienvenidaPage()` - 16 edges
4. `MenuPage()` - 16 edges
5. `Negocio` - 15 edges
6. `react` - 13 edges
7. `waUrl()` - 12 edges
8. `compilerOptions` - 12 edges
9. `armarMensaje()` - 11 edges
10. `precio()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `robots.txt (Disallow /admin, /q/)` --semantically_similar_to--> `Meta robots index, follow`  [INFERRED] [semantically similar]
  public/robots.txt → index.html
- `npm audit --audit-level=high` --conceptually_related_to--> `Cabeceras de seguridad (vercel.json)`  [INFERRED]
  .github/workflows/ci.yml → ENTREGA.md
- `Loma Linda Logo (light background)` --semantically_similar_to--> `Loma Linda Logo (design reference copy)`  [EXTRACTED] [semantically similar]
  public/logo-claro.jpg → referencias/logo.jpeg
- `Wordmark: Loma Linda (retro script)` --semantically_similar_to--> `Wordmark: Loma Linda (retro script)`  [EXTRACTED] [semantically similar]
  public/logo-claro.jpg → referencias/logo.jpeg
- `Lockup text: COFFEE HOUSE SAN CRISTOBAL / EST.2014` --semantically_similar_to--> `Lockup text: COFFEE HOUSE SAN CRISTOBAL / EST.2014`  [EXTRACTED] [semantically similar]
  public/logo-claro.jpg → referencias/logo.jpeg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo NFC/QR hasta el menu** — readme_ruta_q_codigo, readme_ruta_b_slug, readme_ruta_m_slug, readme_contrato_datos_negocio [EXTRACTED 1.00]
- **Postura de seguridad de la entrega** — entrega_cabeceras_seguridad, entrega_rls_supabase, entrega_gestion_claves, entrega_admin_noindex, public_robots_robots_txt [EXTRACTED 1.00]
- **Puerta de verificacion automatica** — _github_workflows_ci_typecheck_step, _github_workflows_ci_vitest_step, _github_workflows_ci_npm_audit_step, entrega_entrega_nfc_menu [EXTRACTED 1.00]
- **Top-level menu category structure** — referencias_menu_referencia_categoria_bomba_signature, referencias_menu_referencia_categoria_milk_based, referencias_menu_referencia_categoria_espresso_bar, referencias_menu_referencia_categoria_classic, referencias_menu_referencia_categoria_premium [EXTRACTED 1.00]
- **Implied menu item data shape** — referencias_menu_referencia_item_row_shape, referencias_menu_referencia_size_columns_r_l, referencias_menu_referencia_currency_usd, referencias_menu_referencia_rationale_price_matrix [INFERRED 0.85]
- **Visual identity system of the reference** — referencias_menu_referencia_palette_cream_orange, referencias_menu_referencia_mascot_illustrations, referencias_menu_referencia_tagline, referencias_menu_referencia_rationale_light_dark_panels [INFERRED 0.75]

## Communities (19 total, 5 thin omitted)

### Community 0 - "Componentes UI del Menu"
Cohesion: 0.12
Nodes (28): react, react-router-dom, Enlaces(), Limite, Emblema(), PieLegal(), Monto(), Copiar() (+20 more)

### Community 1 - "Datos, Repo y Store"
Cohesion: 0.13
Nodes (37): ENLACES, getNegocio(), getNegocioBase(), listarSlugs(), NEGOCIOS, ANON, borrarBorrador(), esNegocioValido() (+29 more)

### Community 2 - "Dependencias del Paquete"
Cohesion: 0.05
Nodes (38): author, dependencies, @fontsource-variable/archivo, qrcode, react, react-dom, react-router-dom, description (+30 more)

### Community 3 - "Seguridad, CI y Entrega"
Cohesion: 0.08
Nodes (22): CI Workflow (verificar job), npm audit --audit-level=high, tsc --noEmit type check, vitest run test step, Auditoria de accesibilidad axe-core WCAG 2 AA, Checklist de verificacion manual previa a entrega, Entrega NFC Menu Loma Linda, App shell index.html (+14 more)

### Community 4 - "Carrito y Pedido WhatsApp"
Cohesion: 0.20
Nodes (24): C, CarritoProvider(), abrirWhatsApp(), continuar(), Ctx, leer(), CarritoPanel(), agregar() (+16 more)

### Community 5 - "Almuerzo, Horario y Tema"
Cohesion: 0.18
Nodes (19): Almuerzo(), ResultadoAlmuerzo, ResultadoCarta, almuerzoDe(), AlmuerzoDelDia, diaActual(), DIAS, fechaEnZona() (+11 more)

### Community 6 - "Referencia de Diseno Bomba"
Cohesion: 0.09
Nodes (19): Menu Design Reference Screenshot, Bomba Coffee Brand Identity, Category: Bomba Signature, Category: Classic, Category: Espresso Bar, Category: Milk Based, Category: Premium, Prices in USD ($5.00-$7.00 range) (+11 more)

### Community 7 - "Logo Claro Loma Linda"
Cohesion: 0.21
Nodes (12): Loma Linda Logo (light background), Artisanal mountain coffee-house brand identity, Circular emblem: hill, sunrise rays, cabin, five stars, Monochrome orange-on-white palette (~#F4511E), Lockup text: COFFEE HOUSE SAN CRISTOBAL / EST.2014, Wordmark: Loma Linda (retro script), Loma Linda Logo (design reference copy), Artisanal mountain coffee-house brand identity (+4 more)

### Community 8 - "Config TypeScript"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 9 - "Logo Oscuro Loma Linda"
Cohesion: 0.27
Nodes (10): Loma Linda Dark Logo Asset (public), Sunrise-over-Hut Circular Emblem with Five Stars, Orange-on-Black Brand Palette, Tagline: COFFEE HOUSE SAN CRISTOBAL / EST.2014, "Loma Linda" Script Wordmark, Loma Linda Dark Logo Asset (referencias), Sunrise-over-Hut Circular Emblem with Five Stars, Orange-on-Black Brand Palette (+2 more)

### Community 10 - "Identidad de Marca Loma Linda"
Cohesion: 0.38
Nodes (6): Loma Linda Logo Asset, Artisanal Latin American Coffee House Positioning, Sunrise Over Thatched Hut Emblem with Five Stars, Orange-on-Black Palette, Coffee House San Cristobal (Est. 2014), "Loma Linda" Script Wordmark

### Community 11 - "Esquema Supabase Inicial"
Cohesion: 0.53
Nodes (4): almuerzo, enlaces, escaneos, suscripciones

### Community 12 - "Carta y Vista de Productos"
Cohesion: 0.73
Nodes (5): useCarrito(), Carta(), Foto(), Lista(), Tamanos()

### Community 13 - "Borradores del Panel Admin"
Cohesion: 0.53
Nodes (4): borrarBorrador(), cargarBorrador(), CLAVE(), guardarBorrador()

## Ambiguous Edges - Review These
- `Loma Linda Logo (light background)` → `Monochrome orange-on-white palette (~#F4511E)`  [AMBIGUOUS]
  public/logo-claro.jpg · relation: references
- `Loma Linda Logo (design reference copy)` → `Monochrome orange-on-white palette (~#F4511E)`  [AMBIGUOUS]
  referencias/logo.jpeg · relation: references
- `Category: Bomba Signature` → `Signature Items: House Bomb, Caramel Blast, Dark Charge, Spice Ember`  [AMBIGUOUS]
  referencias/menu-referencia.png · relation: shares_data_with
- `Category: Milk Based` → `Milk/Espresso Items: Flat Bomb, Milk Bomb, Velvet Milk, Single Shot, Long Fuse, Black Bomb`  [AMBIGUOUS]
  referencias/menu-referencia.png · relation: shares_data_with
- `Category: Espresso Bar` → `Milk/Espresso Items: Flat Bomb, Milk Bomb, Velvet Milk, Single Shot, Long Fuse, Black Bomb`  [AMBIGUOUS]
  referencias/menu-referencia.png · relation: shares_data_with
- `Category: Classic` → `Classic/Premium Items: Butter Bomb, Choco Charge, Almond Blast, Custard Bomb, Sourdough Creamy, Pistachio Bomb, Tiramisu Bomb, Red Velvet Cake, Matcha Bomb`  [AMBIGUOUS]
  referencias/menu-referencia.png · relation: shares_data_with
- `Category: Premium` → `Classic/Premium Items: Butter Bomb, Choco Charge, Almond Blast, Custard Bomb, Sourdough Creamy, Pistachio Bomb, Tiramisu Bomb, Red Velvet Cake, Matcha Bomb`  [AMBIGUOUS]
  referencias/menu-referencia.png · relation: shares_data_with

## Knowledge Gaps
- **16 isolated node(s):** `@types/qrcode`, `@types/react`, `@types/react-dom`, `typescript`, `tsc --noEmit type check` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 84 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Componentes UI del Menu` to `Datos, Repo y Store`, `Dependencias del Paquete`, `Carrito y Pedido WhatsApp`, `Almuerzo, Horario y Tema`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `@types/qrcode`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Componentes UI del Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.12222222222222222 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Componentes UI del Menu` to `Datos, Repo y Store`, `Dependencias del Paquete`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `Datos, Repo y Store` be split into smaller, more focused modules?**
  _Cohesion score 0.12624584717607973 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Loma Linda Logo (light background)` and `Monochrome orange-on-white palette (~#F4511E)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Loma Linda Logo (design reference copy)` and `Monochrome orange-on-white palette (~#F4511E)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._