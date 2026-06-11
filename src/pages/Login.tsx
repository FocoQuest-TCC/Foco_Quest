import './styles/Login.css';
import Branco from '../assets/LOGO.png';
import Google from '../assets/Google.png';
import Foco from '../assets/FocoQuest.png';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  return (
    <main className='login-page'>
      <div className='login-card'>
        <div className='login-left'>
            <img src={Branco} alt='FocoQuest' className='login-logo'/>
            <h1>FocoQuest</h1>
            <p>Organize suas tarefas, evolua seu personagem e conquiste seus objetivos.</p>
        </div>
        <div className='login-right'>
            <img src={Foco} className="foco" />
            <form className='login-form'>
              <div className='input-box'>
                <label>Email</label>
                <input type="email" placeholder='Digite seu email' />
              </div>
              <div className='input-box'>
                <label>Senha</label>
                <input type="password" placeholder='Digite sua senha' />
              </div>
              <button type='button' className='btn-login' onClick={()=>navigate('/home')}>Entrar</button>
              <div className="input-google">
                <button type='button' className='btn-google'>Entrar com Google</button>
                <img src={Google} className='gool'/>
              </div>
              <p className='register'>Não possui conta?<span>Cadastrar</span></p>  
            </form>
        </div>
      </div>
    </main>
  )
}