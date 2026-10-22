import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
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

function hasSession() {
  return Boolean(localStorage.getItem('authToken') && localStorage.getItem('user'));
}

function hasStoredAccount() {
  return Boolean(localStorage.getItem('user'));
}

function RequireSession() {
  return hasSession() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RedirectAuthenticated() {
  return hasSession() ? <Navigate to="/home" replace /> : <Outlet />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={hasStoredAccount() ? <Navigate to="/home" replace /> : <App />} />
        <Route element={<RedirectAuthenticated />}>
          <Route path="/login" element={<Login />} />
          <Route path='/cad' element={<Cadastro/>}/>
        </Route>
        <Route element={<RequireSession />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="/fale-conosco" element={<FaleConosco />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/reportar-problema" element={<ReportarProblema />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

// Esse tsx é para a navegação, o 'path=""' é o caminho e o 'element={}' é a página