import { useNavigate } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import styles from './styles/cadastro.module.css';
import Foco from '../../assets/FocoQuest.png';
import BOSS from '../../assets/Boss.png';
import eye from '../../assets/eye-fill.svg';
import eye2 from '../../assets/eye-slash-fill.svg';
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
    const [mostrarSenha, setMostrarSenha] = useState(false);

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

            <label htmlFor="name" className={styles.labels}>NOME DO HERÓI:</label>
            <div className={styles.inputGroup}>
              <input id="name" name="name" type="text" placeholder="Digite o nome do seu personagem" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required/>
            </div>

            <label htmlFor="email" className={styles.labels}>EMAIL:</label>
            <div className={styles.inputGroup}>
              <input id="email" name="email" type="email" placeholder="Digite seu email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>

            <label htmlFor="password" className={styles.labels}>SENHA:</label>
            <div className={styles.inputGroup}>
              <input id="password" name="password" type={mostrarSenha ? 'text' : "password"} placeholder="Crie uma senha forte" autoComplete="new-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required/>
              <button type='button' onClick={() => setMostrarSenha(!mostrarSenha)}>
                <img src={mostrarSenha ? eye : eye2}/>
              </button>
            </div>

            <label htmlFor="confirmPassword" className={styles.labels}>CONFIRMAR SENHA:</label>
            <div className={styles.inputGroup}>
              <input id="confirmPassword" name="confirmPassword" type={mostrarSenha ? 'text' : "password"} placeholder="Repita a senha criada" autoComplete="new-password" minLength={6} value={ConfPassword} onChange={e => setConfPassword(e.target.value)} required/>
              <button type='button' onClick={() => setMostrarSenha(!mostrarSenha)}>
                <img src={mostrarSenha ? eye : eye2}/>
              </button>
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
          
          <p className={styles.signup}>
            Não possui conta?{' '}
            <button type="button" className={styles.linkBtn} onClick={() => navigate('/login')}>Iniciar Sessão</button>
          </p>

          <button type="button" className={styles.ReturnBtn} onClick={() => navigate('/')}>Voltar</button>
        </section>
      </div>
    </main>
  );
}