import styles from './styles/Login.module.css'; 
import Google from '../assets/Google.png';
import Foco from '../assets/FocoQuest.png';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}></div>
      <div className={styles.content}>
        <div className={styles.loginBox}>
          <div className={styles.logoContainer}>
            <img src={Foco} alt='FocoQuest' className={styles.logoImg}/>
          </div>
          <form onSubmit={(e)=> e.preventDefault()}>
            <div className={styles.inputGroup}>
              <label>Email:</label>
              <input type="email" placeholder='Digite seu email' />
            </div>
            <div className={styles.inputGroup}>
              <label>Senha:</label>
              <input type="password" placeholder='Digite sua senha' />
            </div>
            <button type='button' className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/home')}>ENTRAR</button>
            <div className={styles.inputGoogle}>
              <button type='button' className={`${styles.btn} ${styles.btnGoogle}`}>ENTRAR COM GOOGLE</button>
              <img src={Google} className={styles.googleIcon} alt="Google Icon"/>
            </div>  
          </form>
          <p className={styles.signupText}>Não possui conta? <a href="#cadastro">Cadastrar</a></p>
        </div>
      </div>
    </div>
  );
}