import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { checkEnvironment } from './utils/env.ts'

// Check environment in development
if (import.meta.env.DEV) {
  checkEnvironment();
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  console.log("Starting app render...");
  const root = createRoot(rootElement);
  console.log("Root created, rendering App...");
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: white;">
      <div style="text-align: center;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">VLIC - Loading Error</h1>
        <p style="color: #6b7280; margin-bottom: 16px;">Please refresh the page or try again later.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 16px;">Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
