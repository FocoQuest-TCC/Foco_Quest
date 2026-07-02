import { type FormEvent } from 'react';
import styles from './styles/Login.module.css';
import Foco from '../assets/FocoQuest.png';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/home');
  } 

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}/>

      <div className={styles.content}>
        <div className={styles.loginBox}>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg}/>
          </div>

          <form onSubmit={login}>
            <div className={styles.inputGroup}>
              <label htmlFor='email'>EMAIL:</label>
              <input type="email" placeholder='Digite seu email' required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='password'>SENHA:</label>
              <input type="password" placeholder='Digite sua senha' required/>
            </div>

            <button type='submit' className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/home')}>ENTRAR</button>
            
            <div className={styles.inputGoogle}>
              <button type='button' className={`${styles.btn} ${styles.btnGoogle}`}>ENTRAR COM GOOGLE</button>
            </div>  
          </form>

          <p className={styles.signup}>Não possui conta? <button type='button' className={styles.linkBtn} onClick={() => navigate('/Cad')}>Cadastrar</button></p>       
        </div>
      </div>
    </div>
  );
};