import { type FormEvent, useState } from 'react';
import styles from './styles/Login.module.css';
import Foco from '../../assets/FocoQuest.png';
import BOSS from '../../assets/Boss.png';
import eye from '../../assets/eye-fill.svg';
import eye2 from '../../assets/eye-slash-fill.svg';
import { useNavigate } from 'react-router-dom';
import { API_URL, publicApiHeaders, saveSession } from '../../config/api';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(isSubmitting) return;

    setError('');

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get('email') ?? '').trim().toLowerCase();

    const password = String(formData.get('password') ?? '');

    if(!email || !password){
      setError('Preencha o Email e a Senha.');
      return;
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setError('Digite um Email válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { ...publicApiHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.message === 'string' ? data.message : 'Email ou senha incorretos.');
        return;
      }

      if(
        typeof data.token !== 'string' || !data.token || !data.user?.UserID
      ){
        setError('O servidor retornou uma sessão inválida.');
        return;
      }

      saveSession(data);
      
      navigate('/home', {replace: true,});
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
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
              <input id="email" name="email" type="email" placeholder="Digite seu email" autoComplete='email' autoCapitalize='none' required/>
            </div>

            <label htmlFor="password" className={styles.labels}>SENHA:</label> 
            <div className={styles.inputGroup}>
              <input id="password" name="password" type={mostrarSenha ? 'text' : "password"} placeholder="Digite sua senha" autoComplete='current-password' required/>
              <button type='button' onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostar senha'} aria-pressed={mostrarSenha}>
                <img src={mostrarSenha ? eye : eye2}/>
              </button>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? 'ENTRANDO...' : 'ENTRAR'}
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