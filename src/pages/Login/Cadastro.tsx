import { useNavigate } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import styles from './styles/cadastro.module.css';
import Foco from '../../assets/FocoQuest.png'
import GoogleIcon from '../../assets/Google.png';

export function Cadastro(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const cadastro = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem!');
            return;
        }

        navigate('/home');
    };

    return (
    <main className={styles.container}>
      <aside className={styles.sidebar} aria-hidden='true' />

      <div className={styles.content}>
        <section className={styles.cadastroBox} aria-labelledby='cadastroTitle'>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg} alt="FocoQuest" />
          </div>

          <h1 id='cadastroTitle' className={styles.pageTitle}>CRIAR NOVA CONTA</h1>

          <form onSubmit={cadastro} noValidate>
            {error && (
              <p className={styles.errorMsg} role="alert">
                {error}
              </p>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="name">NOME DO HERÓI:</label>
              <input id="name" name="name" type="text" placeholder="Digite o nome do seu personagem" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">EMAIL:</label>
              <input id="email" name="email" type="email" placeholder="Digite seu email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">SENHA:</label>
              <input id="password" name="password" type="password" placeholder="Crie uma senha forte" autoComplete="new-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">CONFIRMAR SENHA:</label>
              <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repita a senha criada" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required/>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              CRIAR CONTA
            </button>

            <div className={styles.inputGoogle}>
              <button type="button" className={`${styles.btn} ${styles.btnGoogle}`} disabled title='Em breve'>
                <img src={GoogleIcon} className={styles.googleIcon} alt="" aria-hidden="true" />
                REGISTRAR COM GOOGLE
              </button>
            </div>
          </form>

          <p className={styles.loginLink}>
            Já possui uma conta? <button type="button" onClick={() => navigate('/login')}>Iniciar Sessão</button>
          </p>
        </section>
      </div>
    </main>
  );
}