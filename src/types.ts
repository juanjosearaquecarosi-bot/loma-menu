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
  /** Moneda de toda la categoría si difiere de la del negocio (ej. precios en pesos). */
  moneda?: string
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

/** Paleta de un tema. Los tokens son las variables CSS que consume styles.css. */
export interface Paleta {
  fondo: string
  tinta: string
  oscuro: string
  acento: string
  acento_texto: string
  dorado: string
  verde: string
}

export interface Tema {
  /** Tema CLARO: la rotación semanal alterna entre estos dos temas. */
  claro: Paleta
  /** Tema OSCURO: la rotación semanal alterna entre estos dos temas. */
  oscuro: Paleta
}

/** URLs del logo real del negocio (versión para fondo claro y para fondo oscuro). */
export interface Logos {
  claro: string
  oscuro: string
}

export interface Enlaces {
  /** Solo el número con código de país, sin '+', ej: '584120000000'. */
  whatsapp?: string
  /** Mensaje predefinido que llega por WhatsApp al abrir el chat. */
  whatsapp_mensaje?: string
  instagram?: string
  google_review?: string
  email?: string
  direccion?: string
  /** Red / contraseña del WiFi del local. Se muestra solo si existe: nada inventado. */
  wifi?: { red: string; clave: string }
  pagos?: { metodo: string; detalle: string }[]
}

export interface Negocio {
  slug: string
  nombre: string
  subtitulo: string
  lema: string
  ciudad_frase: string
  /** Moneda de la carta impresa (NO se convierte ni se toca). */
  moneda: string
  /** Moneda de empanadas y pasteles (pesos, definida por el cliente). */
  moneda_pesos?: string
  zona_horaria: string
  /** Logo real del negocio (usa los archivos de /referencias; nunca inventado). */
  logos: Logos
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
