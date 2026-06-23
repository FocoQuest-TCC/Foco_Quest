import { useNavigate } from 'react-router-dom';

export function Cadastro(){
const navigate = useNavigate();

return(
    <div>
        <button onClick={() => navigate('/Login')}>Voltar para o Login</button>
    </div>
)}