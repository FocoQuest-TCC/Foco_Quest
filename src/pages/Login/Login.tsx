import { type FormEvent, useState } from 'react';
import styles from './styles/Login.module.css';
import Foco from '../../assets/FocoQuest.png';
import GoogleIcon from '../../assets/Google.png';
import BOSS from '../../assets/Boss.png';
import { useNavigate } from 'react-router-dom';
import { API_URL, publicApiHeaders } from '../../config/api';

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { ...publicApiHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message ?? 'Não foi possível entrar.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      navigate('/home');
    } catch {
      setError('Erro ao conectar com o servidor.');
    }
  }

  return (
    <main className={styles.container}>
      <aside className={styles.sidebar}>
        <img src={BOSS} className={styles.bossImg}/>
      </aside>

      <div className={styles.content}>
        <section className={`${styles.loginBox} cornerFrame`}>
          <h1 id='loginTitle' className='srOnly'>Entrar no FocoQuest</h1>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg}/>
          </div>

          <form onSubmit={login} noValidate>
            {error && <p className={styles.errorMsg} role="alert">{error}</p>}
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
                <img src={GoogleIcon} className={styles.googleIcon} aria-hidden="true" />
                ENTRAR COM GOOGLE
              </button>
            </div>
          </form>

          <p className={styles.signup}>
            Não possui conta?{' '}
            <button type="button" className={styles.linkBtn} onClick={() => navigate('/cad')}>Cadastrar</button>
          </p>
        </section>
      </div>
    </main>
  );
};