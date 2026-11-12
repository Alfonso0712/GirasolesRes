import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error inesperado:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-danger-bg border border-danger-border flex items-center justify-center text-danger mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-black text-ink mb-2">
            Ocurrió un problema inesperado.
          </h1>
          <p className="text-xs text-ink-muted max-w-xs mb-6">
            La aplicación ha detectado un inconveniente. Puede reiniciar la aplicación para restablecer su funcionamiento.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reiniciar la aplicación</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
