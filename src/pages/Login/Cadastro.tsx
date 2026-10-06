import { useNavigate } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import styles from './styles/cadastro.module.css';
import Foco from '../../assets/FocoQuest.png'
import BOSS from '../../assets/Boss.png'
import { API_URL, publicApiHeaders } from '../../config/api';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export function Cadastro(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ConfPassword, setConfPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cadastro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== ConfPassword) {
        setError("As senhas não coincidem!");
        return;
    }

    setIsSubmitting(true);
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
              ...publicApiHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email: email.trim(),
                password,
            }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.message ?? "Não foi possível criar a conta.");
            return;
        }

        setSuccess(data.message ?? "Enviamos um link de confirmação para seu email.");

    } catch (error) {
      console.error(error);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
};

    return (
    <main className={styles.container}>
      <aside className={styles.sidebar}>
        <img src={BOSS} className={styles.bossImg}/>
      </aside>

      <div className={styles.content}>
        <section className={styles.cadastroBox}>

          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg}/>
          </div>

          <form onSubmit={cadastro}>
            {error && (
              <p className={styles.errorMsg} role="alert">
                {error}
              </p>
            )}
            {success && <p className={styles.successMsg} role="status">{success}</p>}

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
              <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repita a senha criada" autoComplete="new-password" minLength={6} value={ConfPassword} onChange={e => setConfPassword(e.target.value)} required/>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting || Boolean(success)}>
              CRIAR CONTA
            </button>

            <GoogleAuthButton
              label="REGISTRAR COM GOOGLE"
              className={styles.inputGoogle}
              buttonClassName={`${styles.btn} ${styles.btnGoogle}`}
              iconClassName={styles.googleIcon}
              errorClassName={styles.errorMsg}
            />
          </form>

          <p className={styles.loginLink}>
            Já possui uma conta? <button type="button" onClick={() => navigate('/login')}>Iniciar Sessão</button>
          </p>
        </section>
      </div>
    </main>
  );
}