import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Terminal } from 'lucide-react';

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = 'An unexpected system fault occurred.';
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data?.message || 'Route navigation fault.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E7EAF0] flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-xl bg-[#12151C] border border-[#F0555A]/40 px-bracket-corners p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#262B38] pb-4">
          <div className="p-2 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] text-[#F0555A] uppercase tracking-wider">// EXCEPTION HANDLER</div>
            <h2 className="font-display text-lg font-bold text-[#E7EAF0]">System Runtime Fault Detected</h2>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
            <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">ERROR MESSAGE</span>
            <p className="text-[#F0555A] font-bold">{errorMessage}</p>
          </div>

          {errorDetails && (
            <div className="p-3 bg-[#0A0C10] border border-[#262B38] max-h-40 overflow-y-auto">
              <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">STACK TRACE METADATA</span>
              <pre className="text-[10px] text-[#8B93A7] whitespace-pre-wrap">{errorDetails}</pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#262B38] text-xs">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4C8DFF] text-[#0A0C10] font-bold uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>RELOAD CONSOLE</span>
          </button>

          <a
            href="/"
            className="px-4 py-2 bg-[#171B24] border border-[#262B38] text-[#E7EAF0] font-bold uppercase hover:bg-[#262B38] transition-colors flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            <span>RETURN TO DASHBOARD</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
