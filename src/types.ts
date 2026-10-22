// Modelo de datos del menú. Espeja las tablas de Supabase (ver supabase/migrations)
// para que cambiar el repositorio local por Supabase no toque la interfaz.

export type DiaId = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'
export type TemaId = 'naranja' | 'negro'

export interface Item {
  id: string
  nombre: string
  descripcion?: string
  /** Subtítulo dentro de la categoría (ej. "Empanadas" / "Pasteles" en Desayunos). */
  subgrupo?: string
  /** Precio único. null = existe en el menú pero el precio no era legible. */
  precio?: number | null
  /** Precios por columna (tamaños). Una celda ausente significa que no se muestra. */
  precios?: Record<string, number | null>
  /** Opcional. Si no hay foto, el diseño funciona igual (sin placeholders falsos). */
  imagen?: string
  etiquetas?: string[]
  /** Moneda distinta a la del negocio. Normalmente vacía: todo el menú va en €. */
  moneda?: string
}

export interface Columna {
  id: string
  label: string
}

export interface Categoria {
  id: string
  nombre: string
  grupo: 'cafe' | 'comida' | 'desayuno'
  descripcion?: string
  nota?: string
  /** Texto libre, ej. "Todos los días de 7:00 a 10:00". Solo se muestra si existe. */
  horario?: string
  /** Foto genérica de portada de la sección (ruta o URL). Opcional. */
  imagen?: string
  columnas?: Columna[]
  items: Item[]
}

export interface Plato {
  nombre: string
  detalle?: string
}

export interface Almuerzo {
  titulo: string
  incluye: string[]
  /** Los tres platos base: iguales todos los días, con variaciones de preparación. */
  platos_fijos: Plato[]
  /** Cuarto plato: cambia cada SEMANA (no cada día). null = aún sin definir. */
  cuarto_plato: { actual: Plato | null; catalogo: Plato[] }
  /** Plato del día: fijo por día de la semana (cada lunes el mismo, cada martes el mismo...). */
  plato_del_dia: Partial<Record<DiaId, Plato | null>>
  dias_sin_servicio: DiaId[]
}

export interface Tema {
  /** Color de la página. */
  fondo: string
  /** Texto pequeño y detalles de lectura sobre `fondo` (negro en el tema naranja, blanco en el negro). */
  tinta: string
  /** Texto grande de marca sobre `fondo` (títulos, nombres de plato): blanco. */
  titulo: string
  /** Superficies oscuras (pie, plato del día). */
  oscuro: string
  /** Texto sobre superficies oscuras. */
  claro: string
  /** Color de detalle: botones, pestañas activas, precios, líneas gruesas (negro en el naranja, naranja en el negro). */
  acento: string
  /** Texto sobre `acento`. */
  sobre_acento: string
  /** Etiquetas pequeñas sobre `oscuro`. */
  etiqueta: string
}

export interface Enlaces {
  /** Solo dígitos con código de país, ej. 584141234567. */
  whatsapp?: string
  /** Mensaje que se prellena al tocar "Escríbanos por WhatsApp". */
  whatsapp_mensaje?: string
  /** @usuario o URL de instagram.com. */
  instagram?: string
  google_review?: string
  wifi?: { red: string; clave: string; seguridad?: 'WPA' | 'WEP' | 'nopass' }
  pagos?: { metodo: string; detalle?: string; datos?: { etiqueta: string; valor: string }[] }[]
}

export interface Negocio {
  slug: string
  /** ISO de la última edición en el código. Una publicación del panel posterior a esta fecha la reemplaza. */
  actualizado?: string
  nombre: string
  subtitulo: string
  lema: string
  ciudad_frase: string
  moneda: string
  zona_horaria: string
  /** Datos legales y de ubicación (pie de página). Solo se muestra lo que exista. */
  local?: { rif?: string; razon_social?: string; direccion?: string; horario?: { dias: string; horas: string }[] }
  /** URL o ruta del logo del cliente. Si falta se usa el isotipo de la marca. */
  logo?: string
  temas: Record<TemaId, Tema>
  /** 'auto' alterna los dos temas cada semana; o fija uno. */
  tema_modo: 'auto' | TemaId
  /** En modo auto: tema de las semanas ISO pares (la impar usa el otro). */
  tema_par: TemaId
  enlaces: Enlaces
  /** Carrito de pedidos por WhatsApp. Requiere enlaces.whatsapp. */
  pedidos?: { activo: boolean }
  suscripcion: { estado: 'activa' | 'vencida'; vence: string | null }
  almuerzo: Almuerzo
  categorias: Categoria[]
}

export interface EnlaceQR {
  codigo: string
  slug: string
  activo: boolean
}
