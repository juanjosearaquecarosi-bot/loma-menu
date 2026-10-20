import { Component, type ReactNode } from 'react'

/** Si algo inesperado rompe la pantalla, el cliente ve un mensaje claro en vez de una página en blanco. */
export class Limite extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Error de interfaz:', error)
  }
  render() {
    if (!this.state.fallo) return this.props.children
    return (
      <div className="raiz tema-naranja">
        <div className="centro" role="alert">
          <h1>Algo salió mal</h1>
          <p>Recarga la página. Si sigue pasando, avisa al local.</p>
          <p>
            <button type="button" className="chip" onClick={() => location.reload()}>
              Recargar
            </button>
          </p>
        </div>
      </div>
    )
  }
}
