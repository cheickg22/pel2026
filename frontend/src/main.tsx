import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 main.tsx chargé');

const rootElement = document.getElementById('root');
console.log('📦 root element:', rootElement);

if (!rootElement) {
  console.error('❌ Element #root non trouvé !');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Erreur: Element #root non trouvé</h1></div>';
} else {
  try {
    console.log('🎨 Création de createRoot...');
    const root = createRoot(rootElement);
    
    console.log('⚛️ Rendering App...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('✅ App rendu avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du rendu:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Erreur de rendu React</h1>
      <pre>${error}</pre>
    </div>`;
  }
}

