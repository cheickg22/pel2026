import { BrowserRouter, Routes, Route } from 'react-router-dom';

console.log('🔍 App-simple.tsx chargé');

function TestPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>✅ Application React fonctionnelle !</h1>
      <p>Backend Django : <a href="http://localhost:8000/admin" target="_blank">http://localhost:8000</a></p>
      <p>Frontend Vite : http://localhost:5173</p>
      <hr />
      <h2>Système de Reçus de Paiement</h2>
      <ul>
        <li>✅ Backend : Models Payment, AgencySettings, Receipt</li>
        <li>✅ Backend : ViewSets + API REST</li>
        <li>✅ Frontend : Pages + Routes</li>
        <li>🔄 En cours : Debug page blanche</li>
      </ul>
    </div>
  );
}

function AppSimple() {
  console.log('🔍 AppSimple render');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppSimple;
