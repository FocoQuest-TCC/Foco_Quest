import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/config.module.css';

export function Config(){
    const navigate = useNavigate();
    const [nome, setNome] = useState('???');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return(
        <section className={styles.container} aria-labelledby='config-heading'>
            <h2 id='config-heading' className={styles.title}>CONFIGURAÇÕES DA CONTA</h2>
            <div className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="nome">APELIDO DO HERÓI:</label>
                    <input id="nome" name="nome" value={nome} onChange={e => setNome(e.target.value)}/>
                </div>
                {saved && <span className={styles.savedMsg}>Alterações salvas!</span>}
                <button type='button' className={styles.saveBtn} onClick={handleSave}>SALVAR ALTERAÇÕES</button>
                <button type='button' className={styles.logoutBtn} onClick={() => navigate('/login')}>SAIR DA CONTA</button>
            </div>
        </section>
    );
};