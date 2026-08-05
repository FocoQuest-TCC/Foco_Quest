import { type FormEvent } from 'react';
import styles from './styles/Login.module.css';
import Foco from '../../assets/FocoQuest.png';
import GoogleIcon from '../../assets/Google.png';
import BOSS from '../../assets/Boss.png';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/home');
  }

  return (
    <main className={styles.container}>
      <aside className={styles.sidebar}>
        <img src={BOSS} className={styles.bossImg} alt="Boss do FocoQuest" />
      </aside>

      <div className={styles.content}>
        <section className={`${styles.loginBox} cornerFrame`} aria-labelledby='loginTitle'>
          <h1 id='loginTitle' className='srOnly'>Entrar no FocoQuest</h1>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg} alt="FocoQuest" />
          </div>

          <form onSubmit={login} noValidate>
            <div className={styles.inputGroup}>
              <label htmlFor="email">EMAIL:</label>
              <input id="email" name="email" type="email" placeholder="Digite seu email" autoComplete="email" required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">SENHA:</label>
              <input id="password" name="password" type="password" placeholder="Digite sua senha" autoComplete="current-password" required/>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              ENTRAR
            </button>

            <div className={styles.inputGoogle}>
              <button type="button" className={`${styles.btn} ${styles.btnGoogle}`} disabled title='Em breve'>
                <img src={GoogleIcon} className={styles.googleIcon} alt="" aria-hidden="true" />
                ENTRAR COM GOOGLE
              </button>
            </div>
          </form>

          <p className={styles.signup}>
            Não possui conta?{' '}
            <button type="button" className={styles.linkBtn} onClick={() => navigate('/Cad')}>Cadastrar</button>
          </p>
        </section>
      </div>
    </main>
  );
};