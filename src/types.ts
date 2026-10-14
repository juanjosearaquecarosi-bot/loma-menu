// Modelo de datos del menú. Espeja las tablas de Supabase (ver supabase/migrations)
// para que cambiar el repositorio local por Supabase no toque la interfaz.

export type DiaId = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface Item {
  id: string
  nombre: string
  descripcion?: string
  /** Precio único. null = existe en el menú pero el precio no era legible. */
  precio?: number | null
  /** Precios por columna (tamaños). Una celda ausente significa que no se muestra. */
  precios?: Record<string, number | null>
  /** Opcional. Si no hay foto, el diseño funciona igual (sin placeholders falsos). */
  imagen?: string
  etiquetas?: string[]
  /** Moneda distinta a la del negocio (ej. un ítem impreso con "$"). */
  moneda?: string
}

export interface Columna {
  id: string
  label: string
}

export interface Categoria {
  id: string
  nombre: string
  grupo: 'cafe' | 'comida'
  descripcion?: string
  nota?: string
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
  platos_fijos: Plato[]
  set_activo: string
  /** Rotación semanal: set -> día -> plato (null = el original no lo trae). */
  rotaciones: Record<string, Partial<Record<DiaId, Plato | null>>>
  plato_del_dia: Partial<Record<DiaId, Plato | null>>
  dias_sin_servicio: DiaId[]
}

export interface Tema {
  /** Colores como tokens; el CSS los lee de variables. */
  fondo: string
  tinta: string
  oscuro: string
  acento: string
  acento_texto: string
  dorado: string
  verde: string
}

export interface Enlaces {
  whatsapp?: string
  instagram?: string
  google_review?: string
  wifi?: { red: string; clave: string }
  pagos?: { metodo: string; detalle: string }[]
}

export interface Negocio {
  slug: string
  nombre: string
  subtitulo: string
  lema: string
  ciudad_frase: string
  moneda: string
  zona_horaria: string
  tema: Tema
  enlaces: Enlaces
  suscripcion: { estado: 'activa' | 'vencida'; vence: string | null }
  almuerzo: Almuerzo
  categorias: Categoria[]
}

export interface EnlaceQR {
  codigo: string
  slug: string
  activo: boolean
}
