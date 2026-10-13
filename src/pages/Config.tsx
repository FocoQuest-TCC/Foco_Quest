import { useNavigate } from 'react-router-dom';
import styles from './styles/config.module.css';

export function Config(){
    const navigate = useNavigate();

    return(
        <section className={styles.container}>
            <h2 id='config-heading' className={styles.title}>CONFIGURAÇÕES DA CONTA</h2>
            <div className={styles.form}>
                <button type='button' className={styles.logoutBtn} onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    navigate('/login', { replace: true });
                }}>SAIR DA CONTA</button>
            </div>
        </section>
    );
};