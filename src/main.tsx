import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function mountApexChronicle() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    // Notify preloader timeout guard that React has mounted successfully
    (window as any).__APEX_MOUNTED = true;
  } catch (err: any) {
    console.error('Fatal initialization error mounting Apex Chronicle:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; text-align: center;">
        <div style="max-width: 480px; background: #fff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h1 style="font-family: Georgia, serif; font-size: 24px; margin: 0 0 12px 0; color: #1c1917;">Apex Chronicle</h1>
          <p style="color: #78716c; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">An error occurred while initializing the reader interface: ${err?.message || 'Initialization failed'}</p>
          <button onclick="window.location.reload()" style="background: #1c1917; color: #fff; border: none; padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 4px; cursor: pointer;">Reload Publication</button>
        </div>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApexChronicle);
} else {
  mountApexChronicle();
}
