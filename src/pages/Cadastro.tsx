import { useNavigate } from 'react-router-dom';
import {} from 'react';

export function Cadastro(){
const navigate = useNavigate();

return(
    <div>
        <button onClick={() => navigate('/Login')}>Voltar para o Login</button>
    </div>
)}