import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ProcessosPage from './pages/ProcessosPage.tsx'
import CadastrosPage from './pages/CadastrosPage.tsx'
import RegistrosPage from './pages/RegistrosPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<ProcessosPage />} />
          <Route path="cadastros" element={<CadastrosPage />} />
          <Route path="registros" element={<RegistrosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
