import styles from './styles/Login.module.css';
import Foco from '../assets/FocoQuest.png';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
      </div>
      <div className={styles.content}>
        <div className={styles.loginBox}>
          <div className={styles.logoContainer}>
            <img src={Foco} alt='FocoQuest' className={styles.logoImg}/>
          </div>
          <form onSubmit={(e)=> e.preventDefault()}>
            <div className={styles.inputGroup}>
              <label>Email:</label>
              <input type="email" placeholder='Digite seu email' required/>
            </div>
            <div className={styles.inputGroup}>
              <label>Senha:</label>
              <input type="password" placeholder='Digite sua senha' required/>
            </div>
            <button type='button' className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/home')}>ENTRAR</button>
            <div className={styles.inputGoogle}>
              <button type='button' className={`${styles.btn} ${styles.btnGoogle}`}>ENTRAR COM GOOGLE</button>
            </div>  
          </form>
          <p className={styles.signup}>Não possui conta? <a onClick={() => navigate('/Cadastro')}>Cadastrar</a></p>
        </div>
      </div>
    </div>
  );
};