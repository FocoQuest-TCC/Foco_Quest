import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { Login } from './pages/Login/Login';
import { Home } from './pages/Home';
import { Cadastro } from './pages/Login/Cadastro';
import { FaleConosco } from './pages/Inicio/FaleConosco';
import { Noticias } from './pages/Inicio/Noticias';
import { Faq } from './pages/Inicio/Faq';
import { ReportarProblema } from './pages/Inicio/ReportarProblema';
import { NotFound } from './pages/NotFound';
import './Global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path='/Cad' element={<Cadastro/>}/>
        <Route path="/fale-conosco" element={<FaleConosco />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/reportar-problema" element={<ReportarProblema />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
