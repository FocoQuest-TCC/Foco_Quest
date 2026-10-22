import { type FormEvent, useState } from 'react';
import styles from './styles/Login.module.css';
import Foco from '../../assets/FocoQuest.png';
import BOSS from '../../assets/Boss.png';
import eye from '../../assets/eye-fill.svg';
import eye2 from '../../assets/eye-slash-fill.svg';
import { useNavigate } from 'react-router-dom';
import { API_URL, publicApiHeaders } from '../../config/api';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
      <aside className={styles.sidebar} aria-hidden='true'>
        <img src={BOSS} className={styles.bossImg}/>
      </aside>

      <div className={styles.content}>
        <section className={`${styles.loginBox} cornerFrame`}>
          <div className={styles.windowBar} aria-hidden='true'></div>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg}/>
          </div>

          <form onSubmit={login} noValidate>
            {error && <p className={styles.errorMsg} role="alert">{error}</p>}
            <label htmlFor="email" className={styles.labels}>EMAIL:</label>
            <div className={styles.inputGroup}>
              <input id="email" name="email" type="email" placeholder="Digite seu email" required/>
            </div>

            <label htmlFor="password" className={styles.labels}>SENHA:</label> 
            <div className={styles.inputGroup}>
              <input id="password" name="password" type={mostrarSenha ? 'text' : "password"} placeholder="Digite sua senha" required/>
              <button type='button' onClick={() => setMostrarSenha(!mostrarSenha)}>
                <img src={mostrarSenha ? eye : eye2}/>
              </button>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              ENTRAR
            </button>

            <GoogleAuthButton
              label="ENTRAR COM GOOGLE"
              className={styles.inputGoogle}
              buttonClassName={`${styles.btn} ${styles.btnGoogle}`}
              iconClassName={styles.googleIcon}
              errorClassName={styles.errorMsg}
            />
          </form>

          <p className={styles.signup}>
            Não possui conta?{' '}
            <button type="button" className={styles.linkBtn} onClick={() => navigate('/cad')}>Cadastrar</button>
          </p>

            <button type="button" className={styles.ReturnBtn} onClick={() => navigate('/')}>Voltar</button>
        </section>
      </div>
    </main>
  );
};