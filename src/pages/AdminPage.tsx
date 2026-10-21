import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Categoria, DiaId, Item, Negocio, Plato } from '../types'
import { DIAS } from '../lib/horario'
import { getNegocio, getNegocioBase } from '../lib/repo'
import { borrarBorrador, guardarBorrador, hayNube, iniciarSesion, leerBorrador, publicarNube } from '../lib/store'
import { elegirTema, estiloTema } from '../lib/tema'
import { validarNegocio } from '../lib/validar'

type Upd = (fn: (d: Negocio) => void) => void

const nuevoId = () => Math.random().toString(36).slice(2, 10)
const vacioAUndef = (s: string) => (s.trim() === '' ? undefined : s)

function Campo({ label, value, onChange, tipo = 'text', area = false, ayuda }: { label: string; value?: string; onChange: (v: string) => void; tipo?: string; area?: boolean; ayuda?: string }) {
  return (
    <label className="campo adm-campo">
      {label}
      {area ? <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /> : <input type={tipo} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
      {ayuda && <small className="adm-ayuda">{ayuda}</small>}
    </label>
  )
}

/** Número con coma o punto decimal. Vacío = sin precio (null). Mantiene lo que se escribe mientras se edita. */
function Precio({ label, value, onChange }: { label: string; value?: number | null; onChange: (v: number | null) => void }) {
  const [txt, setTxt] = useState(value == null ? '' : String(value).replace('.', ','))
  return (
    <label className="campo adm-campo adm-precio">
      {label}
      <input
        inputMode="decimal"
        value={txt}
        placeholder="—"
        onChange={(e) => {
          const t = e.target.value
          setTxt(t)
          const v = t.trim() === '' ? null : Number(t.replace(',', '.'))
          if (v === null || (Number.isFinite(v) && v >= 0)) onChange(v)
        }}
      />
    </label>
  )
}

function Boton({ children, onClick, peligro = false, disabled = false }: { children: ReactNode; onClick: () => void; peligro?: boolean; disabled?: boolean }) {
  return (
    <button type="button" className={'chip adm-btn' + (peligro ? ' adm-peligro' : '')} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Bloque({ titulo, children, abierto = false }: { titulo: string; children: ReactNode; abierto?: boolean }) {
  return (
    <details className="hub-card hub-det adm-bloque" open={abierto}>
      <summary>
        <span className="hub-t">{titulo}</span>
      </summary>
      <div className="adm-cuerpo">{children}</div>
    </details>
  )
}

function mover<T>(arr: T[], i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

/* ---------- Información + enlaces ---------- */
function SeccionInfo({ d, upd }: { d: Negocio; upd: Upd }) {
  return (
    <Bloque titulo="Información del negocio" abierto>
      <Campo label="Nombre" value={d.nombre} onChange={(v) => upd((x) => void (x.nombre = v))} />
      <Campo label="Subtítulo (ej. Coffee House San Cristóbal)" value={d.subtitulo} onChange={(v) => upd((x) => void (x.subtitulo = v))} />
      <Campo label="Lema" value={d.lema} onChange={(v) => upd((x) => void (x.lema = v))} />
      <Campo label="Frase del pie" value={d.ciudad_frase} onChange={(v) => upd((x) => void (x.ciudad_frase = v))} />
      <Campo label="Símbolo de moneda por defecto" value={d.moneda} onChange={(v) => upd((x) => void (x.moneda = v))} ayuda="Los precios sin moneda propia usan esta." />
      <Campo label="Logo (ruta o URL)" value={d.logo} onChange={(v) => upd((x) => void (x.logo = vacioAUndef(v)))} />
      <label className="tipo adm-check">
        <input type="checkbox" checked={!!d.pedidos?.activo} onChange={(e) => upd((x) => void (x.pedidos = { activo: e.target.checked }))} />
        Activar carrito de pedidos por WhatsApp
      </label>
      <label className="campo adm-campo">
        Tema
        <select value={d.tema_modo} onChange={(e) => upd((x) => void (x.tema_modo = e.target.value as Negocio['tema_modo']))}>
          <option value="auto">Alternar cada semana</option>
          <option value="naranja">Siempre naranja</option>
          <option value="negro">Siempre negro</option>
        </select>
      </label>
      {d.tema_modo === 'auto' && (
        <label className="campo adm-campo">
          Semanas pares usan
          <select value={d.tema_par} onChange={(e) => upd((x) => void (x.tema_par = e.target.value as Negocio['tema_par']))}>
            <option value="naranja">Naranja (impares: negro)</option>
            <option value="negro">Negro (impares: naranja)</option>
          </select>
        </label>
      )}
    </Bloque>
  )
}

function SeccionEnlaces({ d, upd }: { d: Negocio; upd: Upd }) {
  const e = d.enlaces
  return (
    <Bloque titulo="Enlaces y pagos (pantalla de bienvenida)">
      <Campo label="WhatsApp (con código de país, solo números)" value={e.whatsapp} onChange={(v) => upd((x) => void (x.enlaces.whatsapp = vacioAUndef(v.replace(/[^\d+\s-]/g, ''))))} ayuda="Ej. 584124215818" />
      <Campo label="Mensaje predefinido de WhatsApp" value={e.whatsapp_mensaje} area onChange={(v) => upd((x) => void (x.enlaces.whatsapp_mensaje = vacioAUndef(v)))} ayuda="Vacío = mensaje estándar con el nombre del negocio." />
      <Campo label="Instagram (@usuario)" value={e.instagram} onChange={(v) => upd((x) => void (x.enlaces.instagram = vacioAUndef(v)))} />
      <Campo label="Enlace de reseñas de Google" value={e.google_review} onChange={(v) => upd((x) => void (x.enlaces.google_review = vacioAUndef(v)))} />

      <p className="adm-sub" role="heading" aria-level={2}>Wi-Fi</p>
      <Campo label="Nombre de la red" value={e.wifi?.red} onChange={(v) => upd((x) => void (x.enlaces.wifi = v.trim() || x.enlaces.wifi?.clave ? { seguridad: 'WPA', clave: '', ...x.enlaces.wifi, red: v } : undefined))} />
      <Campo label="Clave" value={e.wifi?.clave} onChange={(v) => upd((x) => void (x.enlaces.wifi = { seguridad: 'WPA', red: '', ...x.enlaces.wifi, clave: v }))} />
      {e.wifi && <Boton peligro onClick={() => upd((x) => void (x.enlaces.wifi = undefined))}>Quitar Wi-Fi</Boton>}

      <p className="adm-sub" role="heading" aria-level={2}>Métodos de pago</p>
      {(e.pagos ?? []).map((p, i) => (
        <fieldset className="adm-grupo" key={i}>
          <Campo label="Método" value={p.metodo} onChange={(v) => upd((x) => void (x.enlaces.pagos![i].metodo = v))} />
          <Campo label="Nota (opcional)" value={p.detalle} onChange={(v) => upd((x) => void (x.enlaces.pagos![i].detalle = vacioAUndef(v)))} />
          {(p.datos ?? []).map((dt, j) => (
            <div className="adm-fila" key={j}>
              <Campo label="Dato" value={dt.etiqueta} onChange={(v) => upd((x) => void (x.enlaces.pagos![i].datos![j].etiqueta = v))} />
              <Campo label="Valor (se copia)" value={dt.valor} onChange={(v) => upd((x) => void (x.enlaces.pagos![i].datos![j].valor = v))} />
              <Boton peligro onClick={() => upd((x) => void x.enlaces.pagos![i].datos!.splice(j, 1))}>Quitar</Boton>
            </div>
          ))}
          <div className="adm-fila">
            <Boton onClick={() => upd((x) => void (x.enlaces.pagos![i].datos = [...(x.enlaces.pagos![i].datos ?? []), { etiqueta: '', valor: '' }]))}>+ Dato</Boton>
            <Boton onClick={() => upd((x) => void mover(x.enlaces.pagos!, i, -1))}>↑</Boton>
            <Boton onClick={() => upd((x) => void mover(x.enlaces.pagos!, i, 1))}>↓</Boton>
            <Boton peligro onClick={() => upd((x) => void x.enlaces.pagos!.splice(i, 1))}>Quitar método</Boton>
          </div>
        </fieldset>
      ))}
      <Boton onClick={() => upd((x) => void (x.enlaces.pagos = [...(x.enlaces.pagos ?? []), { metodo: 'Nuevo método', datos: [{ etiqueta: '', valor: '' }] }]))}>+ Método de pago</Boton>
    </Bloque>
  )
}

function SeccionLocal({ d, upd }: { d: Negocio; upd: Upd }) {
  const l = d.local ?? {}
  const set = (fn: (x: NonNullable<Negocio['local']>) => void) => upd((x) => { x.local = x.local ?? {}; fn(x.local) })
  return (
    <Bloque titulo="Datos legales, dirección y horario (pie de página)">
      <Campo label="Razón social (opcional)" value={l.razon_social} onChange={(v) => set((x) => void (x.razon_social = vacioAUndef(v)))} />
      <Campo label="RIF" value={l.rif} onChange={(v) => set((x) => void (x.rif = vacioAUndef(v)))} ayuda="Ej. J-12345678-9. Si lo dejas vacío no se muestra." />
      <Campo label="Dirección" area value={l.direccion} onChange={(v) => set((x) => void (x.direccion = vacioAUndef(v)))} />
      <p className="adm-sub" role="heading" aria-level={2}>Horario</p>
      {(l.horario ?? []).map((h, i) => (
        <div className="adm-fila" key={i}>
          <Campo label="Días" value={h.dias} onChange={(v) => set((x) => void (x.horario![i].dias = v))} />
          <Campo label="Horas" value={h.horas} onChange={(v) => set((x) => void (x.horario![i].horas = v))} />
          <Boton peligro onClick={() => set((x) => void x.horario!.splice(i, 1))}>Quitar</Boton>
        </div>
      ))}
      <Boton onClick={() => set((x) => void (x.horario = [...(x.horario ?? []), { dias: '', horas: '' }]))}>+ Línea de horario</Boton>
    </Bloque>
  )
}

/* ---------- Almuerzo ---------- */
function PlatoCampos({ p, onChange, nombre }: { p: Plato | null | undefined; onChange: (p: Plato | null) => void; nombre: string }) {
  return (
    <div className="adm-fila">
      <Campo label={nombre} value={p?.nombre} onChange={(v) => onChange(v.trim() || p?.detalle ? { ...p, nombre: v } : null)} />
      <Campo label="Detalle" value={p?.detalle} onChange={(v) => onChange({ nombre: p?.nombre ?? '', detalle: vacioAUndef(v) })} />
    </div>
  )
}

function SeccionAlmuerzo({ d, upd }: { d: Negocio; upd: Upd }) {
  const a = d.almuerzo
  const cat = a.cuarto_plato.catalogo
  const actualIdx = a.cuarto_plato.actual ? cat.findIndex((c) => c.nombre === a.cuarto_plato.actual!.nombre) : -1
  return (
    <Bloque titulo="Almuerzo">
      <Campo label="Título de la sección" value={a.titulo} onChange={(v) => upd((x) => void (x.almuerzo.titulo = v))} />
      <Campo label="Todos los almuerzos incluyen (uno por línea)" area value={a.incluye.join('\n')} onChange={(v) => upd((x) => void (x.almuerzo.incluye = v.split('\n')))} />

      <p className="adm-sub" role="heading" aria-level={2}>Platos fijos</p>
      {a.platos_fijos.map((p, i) => (
        <div className="adm-fila" key={i}>
          <Campo label="Plato" value={p.nombre} onChange={(v) => upd((x) => void (x.almuerzo.platos_fijos[i].nombre = v))} />
          <Campo label="Detalle" value={p.detalle} onChange={(v) => upd((x) => void (x.almuerzo.platos_fijos[i].detalle = vacioAUndef(v)))} />
          <Boton peligro onClick={() => upd((x) => void x.almuerzo.platos_fijos.splice(i, 1))}>Quitar</Boton>
        </div>
      ))}
      <Boton onClick={() => upd((x) => void x.almuerzo.platos_fijos.push({ nombre: '' }))}>+ Plato fijo</Boton>

      <p className="adm-sub" role="heading" aria-level={2}>Plato de la semana</p>
      <label className="campo adm-campo">
        Esta semana
        <select
          value={actualIdx}
          onChange={(e) => {
            const i = Number(e.target.value)
            upd((x) => void (x.almuerzo.cuarto_plato.actual = i >= 0 ? { ...x.almuerzo.cuarto_plato.catalogo[i] } : null))
          }}
        >
          <option value={-1}>Sin definir (“Pregunta por el plato de esta semana”)</option>
          {cat.map((c, i) => (
            <option key={i} value={i}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <p className="adm-ayuda">Lista de platos que rotan:</p>
      {cat.map((c, i) => (
        <div className="adm-fila" key={i}>
          <Campo label="Plato" value={c.nombre} onChange={(v) => upd((x) => void (x.almuerzo.cuarto_plato.catalogo[i].nombre = v))} />
          <Campo label="Detalle" value={c.detalle} onChange={(v) => upd((x) => void (x.almuerzo.cuarto_plato.catalogo[i].detalle = vacioAUndef(v)))} />
          <Boton peligro onClick={() => upd((x) => void x.almuerzo.cuarto_plato.catalogo.splice(i, 1))}>Quitar</Boton>
        </div>
      ))}
      <Boton onClick={() => upd((x) => void x.almuerzo.cuarto_plato.catalogo.push({ nombre: '' }))}>+ Plato a la rotación</Boton>

      <p className="adm-sub" role="heading" aria-level={2}>Plato del día (fijo por día de la semana)</p>
      {DIAS.map((dia) => (
        <div key={dia.id}>
          <PlatoCampos nombre={dia.largo} p={a.plato_del_dia[dia.id]} onChange={(p) => upd((x) => void (x.almuerzo.plato_del_dia[dia.id as DiaId] = p))} />
          <label className="tipo adm-check">
            <input
              type="checkbox"
              checked={a.dias_sin_servicio.includes(dia.id)}
              onChange={(e) => upd((x) => void (x.almuerzo.dias_sin_servicio = e.target.checked ? [...x.almuerzo.dias_sin_servicio, dia.id] : x.almuerzo.dias_sin_servicio.filter((z) => z !== dia.id)))}
            />
            Sin servicio de almuerzo el {dia.largo.toLowerCase()}
          </label>
        </div>
      ))}
    </Bloque>
  )
}

/* ---------- Carta ---------- */
function ItemEd({ it, cat, ci, ii, upd }: { it: Item; cat: Categoria; ci: number; ii: number; upd: Upd }) {
  const set = (fn: (i: Item) => void) => upd((x) => fn(x.categorias[ci].items[ii]))
  return (
    <fieldset className="adm-item">
      <Campo label="Nombre" value={it.nombre} onChange={(v) => set((i) => void (i.nombre = v))} />
      <Campo label="Descripción" value={it.descripcion} area onChange={(v) => set((i) => void (i.descripcion = vacioAUndef(v)))} />
      <div className="adm-fila">
        {cat.columnas ? (
          cat.columnas.map((c) => <Precio key={c.id} label={c.label} value={it.precios?.[c.id]} onChange={(v) => set((i) => void (i.precios = { ...(i.precios ?? {}), [c.id]: v }))} />)
        ) : (
          <Precio label="Precio" value={it.precio} onChange={(v) => set((i) => void (i.precio = v))} />
        )}
        <Campo label="Moneda propia (vacío = del negocio)" value={it.moneda} onChange={(v) => set((i) => void (i.moneda = vacioAUndef(v.toUpperCase())))} />
        <Campo label="Subgrupo" value={it.subgrupo} onChange={(v) => set((i) => void (i.subgrupo = vacioAUndef(v)))} />
      </div>
      <div className="adm-fila">
        <Boton onClick={() => upd((x) => void mover(x.categorias[ci].items, ii, -1))}>↑</Boton>
        <Boton onClick={() => upd((x) => void mover(x.categorias[ci].items, ii, 1))}>↓</Boton>
        <Boton peligro onClick={() => confirm(`¿Eliminar “${it.nombre}”?`) && upd((x) => void x.categorias[ci].items.splice(ii, 1))}>Eliminar</Boton>
      </div>
    </fieldset>
  )
}

function SeccionCarta({ d, upd }: { d: Negocio; upd: Upd }) {
  return (
    <Bloque titulo={`Carta (${d.categorias.length} categorías)`}>
      {d.categorias.map((c, ci) => (
        <details className="adm-cat" key={c.id}>
          <summary>
            {c.nombre || 'Sin nombre'} <span className="adm-ayuda">· {c.items.length} productos</span>
          </summary>
          <Campo label="Título de la categoría" value={c.nombre} onChange={(v) => upd((x) => void (x.categorias[ci].nombre = v))} />
          <Campo label="Nota (opcional)" value={c.nota} area onChange={(v) => upd((x) => void (x.categorias[ci].nota = vacioAUndef(v)))} />
          <label className="campo adm-campo">
            Tipo de categoría
            <select value={c.grupo} onChange={(e) => upd((x) => void (x.categorias[ci].grupo = e.target.value as Categoria['grupo']))}>
              <option value="desayuno">Desayuno</option>
              <option value="cafe">Café y bebidas</option>
              <option value="comida">Comida</option>
            </select>
          </label>
          <Campo label="Horario (opcional)" value={c.horario} onChange={(v) => upd((x) => void (x.categorias[ci].horario = vacioAUndef(v)))} />
          <Campo label="Foto de la sección (ruta o URL, opcional)" value={c.imagen} onChange={(v) => upd((x) => void (x.categorias[ci].imagen = vacioAUndef(v)))} />
          {c.items.map((it, ii) => (
            <ItemEd key={it.id} it={it} cat={c} ci={ci} ii={ii} upd={upd} />
          ))}
          <div className="adm-fila">
            <Boton onClick={() => upd((x) => void x.categorias[ci].items.push({ id: nuevoId(), nombre: 'Nuevo producto', precio: null }))}>+ Producto</Boton>
            <Boton onClick={() => upd((x) => void mover(x.categorias, ci, -1))}>Subir categoría</Boton>
            <Boton onClick={() => upd((x) => void mover(x.categorias, ci, 1))}>Bajar categoría</Boton>
            <Boton peligro onClick={() => confirm(`¿Eliminar la categoría “${c.nombre}” y sus ${c.items.length} productos?`) && upd((x) => void x.categorias.splice(ci, 1))}>Eliminar categoría</Boton>
          </div>
        </details>
      ))}
      <Boton onClick={() => upd((x) => void x.categorias.push({ id: nuevoId(), nombre: 'Nueva categoría', grupo: 'comida', items: [] }))}>+ Categoría</Boton>
    </Bloque>
  )
}

/* ---------- Página ---------- */
export function AdminPage() {
  const slug = useParams().slug ?? 'loma-linda'
  const [d, setD] = useState<Negocio | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('nfcmenu:token')
    } catch {
      return null
    }
  })
  const [msg, setMsg] = useState('')
  const [cambios, setCambios] = useState(false)

  useEffect(() => {
    document.title = 'Panel · NFC Menu'
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const b = !hayNube ? leerBorrador(slug) : null
      const n = b ?? (await getNegocio(slug))
      if (vivo) setD(n ? structuredClone(n) : null)
    })()
    return () => {
      vivo = false
    }
  }, [slug])

  const upd: Upd = (fn) => {
    setD((p) => {
      if (!p) return p
      const c = structuredClone(p)
      fn(c)
      if (!hayNube) guardarBorrador(c)
      return c
    })
    setCambios(true)
    setMsg('')
  }

  const sel = useMemo(() => (d ? elegirTema(d) : null), [d])
  const estilo = sel ? estiloTema(sel.tema, sel.id) : undefined

  if (hayNube && !token) return <Login onToken={(t) => { setToken(t); try { sessionStorage.setItem('nfcmenu:token', t) } catch { /* nada */ } }} />
  if (!d) return <div className="cargando">Cargando…</div>

  const publicar = async () => {
    const problemas = validarNegocio(d)
    if (problemas.length) return setMsg('No se puede publicar: ' + problemas.slice(0, 3).join('; ') + (problemas.length > 3 ? ` (+${problemas.length - 3} más)` : ''))
    try {
      await publicarNube(d, token!)
      setCambios(false)
      setMsg('Publicado. Los clientes ya ven los cambios.')
    } catch (e) {
      if ((e as Error).message === 'SESION') {
        setToken(null)
        try { sessionStorage.removeItem('nfcmenu:token') } catch { /* nada */ }
      } else setMsg((e as Error).name === 'TimeoutError' || e instanceof TypeError ? 'No hay conexión con el servidor. Intenta de nuevo.' : (e as Error).message)
    }
  }
  const descargar = () => {
    const u = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = u
    a.download = `${d.slug}.json`
    a.click()
    URL.revokeObjectURL(u)
  }
  const descartar = () => {
    if (!confirm('¿Descartar todos los cambios y volver a la versión incluida en el código?')) return
    borrarBorrador(slug)
    const b = getNegocioBase(slug)
    if (b) setD(b)
    // Con nube, la versión del código puede diferir de la publicada: hay que poder publicarla.
    setCambios(hayNube)
  }

  return (
    <div className={'raiz tema-' + sel!.id} style={estilo}>
      <div className="app">
        <header className="hero adm-cab">
          <p className="sobre">Panel de administración</p>
          <h1>{d.nombre}</h1>
          <p className="lema">
            {hayNube
              ? 'Los cambios se publican cuando pulsas “Publicar”.'
              : 'Modo local: tus cambios se guardan como borrador en este navegador. Para verlos en la web pública hay que conectar Supabase (ver README).'}
          </p>
          <div className="enlaces">
            <Link className="chip" to={`/b/${slug}${hayNube ? '' : '?borrador=1'}`} target="_blank">Ver bienvenida</Link>
            <Link className="chip" to={`/m/${slug}${hayNube ? '' : '?borrador=1'}`} target="_blank">Ver menú</Link>
          </div>
        </header>

        <main className="adm-main">
          <SeccionEnlaces d={d} upd={upd} />
          <SeccionCarta d={d} upd={upd} />
          <SeccionAlmuerzo d={d} upd={upd} />
          <SeccionLocal d={d} upd={upd} />
          <SeccionInfo d={d} upd={upd} />
        </main>

        <div className="adm-barra" role="region" aria-label="Guardar">
          <span className="adm-estado" aria-live="polite">{msg || (cambios ? (hayNube ? 'Cambios sin publicar' : 'Borrador guardado') : 'Sin cambios')}</span>
          {hayNube ? <Boton onClick={publicar} disabled={!cambios}>Publicar</Boton> : <Boton onClick={descargar}>Descargar JSON</Boton>}
          <Boton peligro onClick={descartar}>Descartar</Boton>
        </div>
      </div>
    </div>
  )
}

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [err, setErr] = useState('')
  return (
    <div className="raiz tema-naranja">
      <form
        className="app hero adm-login"
        onSubmit={async (e) => {
          e.preventDefault()
          try {
            onToken(await iniciarSesion(email, clave))
          } catch (x) {
            setErr((x as Error).message)
          }
        }}
      >
        <p className="sobre">Panel de administración</p>
        <h1>Entrar</h1>
        <Campo label="Correo" tipo="email" value={email} onChange={setEmail} />
        <Campo label="Clave" tipo="password" value={clave} onChange={setClave} />
        {err && <p className="error" role="alert">{err}</p>}
        <button className="enviar" type="submit">Entrar</button>
      </form>
    </div>
  )
}
