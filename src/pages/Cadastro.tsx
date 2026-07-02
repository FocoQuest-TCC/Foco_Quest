import { useNavigate } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import styles from './styles/cadastro.module.css';
import Foco from '../assets/FocoQuest.png'

export function Cadastro(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ConfPassword, setConfPassword] = useState('');

    const cadastro = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault

        if(password !== ConfPassword){
            alert('As senhas não coincidem!');
            return;
        };

        navigate('/home');
    };

    return (
    <div className={styles.container}>
      <div className={styles.sidebar} />

      <div className={styles.content}>
        <div className={styles.cadastroBox}>
          
          <div className={styles.logoContainer}>
            <img src={Foco} className={styles.logoImg} alt="FocoQuest" />
          </div>

          <h2 className={styles.pageTitle}>CRIAR NOVA CONTA</h2>

          <form onSubmit={cadastro}>
            <div className={styles.inputGroup}>
              <label htmlFor='name'>NOME DO HERÓI:</label>
              <input type="text" placeholder='Digite o nome do seu personagem' value={name} onChange={e => setName(e.target.value)} required/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='email'>EMAIL:</label>
              <input type="email" placeholder='Digite seu email' value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='password'>SENHA:</label>
              <input type="password" placeholder='Crie uma senha forte' value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='confirmPassword'>CONFIRMAR SENHA:</label>
              <input type="password" placeholder='Repita a senha criada' value={ConfPassword} onChange={e => setConfPassword(e.target.value)} required />
            </div>

            <button type='submit' className={`${styles.btn} ${styles.btnPrimary}`}>CRIAR CONTA</button>
            
            <div className={styles.inputGoogle}>
              <button type='button' className={`${styles.btn} ${styles.btnGoogle}`}>REGISTRAR COM GOOGLE</button>
            </div>  
          </form>

          <p className={styles.loginLink}>
            Já possui uma conta? <button type="button" onClick={() => navigate('/login')}>Iniciar Sessão</button>
          </p>
        </div>
      </div>
    </div>
  );
}