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
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1>Something went wrong</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
