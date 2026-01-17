import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

console.log('main.tsx démarré');

// Test simple sans App pour voir si React charge
function TestApp() {
  console.log('TestApp render');
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ React fonctionne !</h1>
      <p>Si vous voyez ce message, React se charge correctement.</p>
      <p>Le problème est dans App.tsx ou dans un composant importé.</p>
    </div>
  );
}

const root = document.getElementById('root');
console.log('root element:', root);

if (root) {
  createRoot(root).render(
    <StrictMode>
      <TestApp />
    </StrictMode>,
  );
  console.log('React rendered');
} else {
  console.error('Element #root non trouvé !');
}
