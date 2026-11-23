import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { hasSession, SESSION_EVENT } from './config/api';
import { Transition } from './components/Transition';
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

function useSessionStatus() {
  const [authenticated, setAuthenticated] = useState(hasSession);

  useEffect(() => {
    const updateSession = () => {
      setAuthenticated(hasSession());
    };

    window.addEventListener(SESSION_EVENT, updateSession);
    window.addEventListener('storage', updateSession);

    updateSession();

    return () => {
      window.removeEventListener(SESSION_EVENT, updateSession);
      window.removeEventListener('storage', updateSession);
    };
  }, []);

  return authenticated;
}

function RequireSession() {
  const authenticated = useSessionStatus();

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RedirectAuthenticated() {
  const authenticated = useSessionStatus();

  return authenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function LandingRoute() {
  const authenticated = useSessionStatus();

  return authenticated ? <Navigate to="/home" replace /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Transition>
        <Routes>
          <Route path="/" element={<LandingRoute />}/>
          <Route element={<RedirectAuthenticated />}>
            <Route path="/login" element={<Login />}/>
            <Route path="/cad"element={<Cadastro />}/>
          </Route>
          <Route element={<RequireSession />}>
            <Route path="/home" element={<Home />}/>
          </Route>
          <Route path="/fale-conosco" element={<FaleConosco />}/>
          <Route path="/noticias" element={<Noticias />}/>
          <Route path="/faq" element={<Faq />}/>
          <Route path="/reportar-problema" element={<ReportarProblema />}/>
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </Transition>
    </BrowserRouter>
  </StrictMode>
);