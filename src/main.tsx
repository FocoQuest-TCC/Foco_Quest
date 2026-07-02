import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Cadastro } from './pages/Cadastro';
import './Global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path='/Cad' element={<Cadastro/>}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
