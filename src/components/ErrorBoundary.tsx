import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Apex Chronicle Error Boundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Navigate safely to home
    if (window.location.hash) {
      window.location.hash = '#/';
    } else {
      window.location.href = window.location.pathname.replace(/\/+[^/]*$/, '') || '/';
    }
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-12 text-stone-900 selection:bg-stone-900 selection:text-white">
          <div className="max-w-xl w-full bg-white border border-stone-300 rounded shadow-md p-8 sm:p-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 border border-amber-200 text-amber-700 rounded-full mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
                Apex Chronicle Platform Recovery
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                Application Display Notice
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                An unexpected condition prevented this page from rendering smoothly. Our defensive fallback caught the event to prevent a blank screen.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-left overflow-auto max-h-36">
                <p className="text-xs font-mono text-red-700 font-medium">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Front Page</span>
              </button>
            </div>

            <div className="pt-4 border-t border-stone-100 text-xs text-stone-500">
              <button
                onClick={this.handleResetStorage}
                className="underline hover:text-stone-800 cursor-pointer"
              >
                Clear local session cache &amp; reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
