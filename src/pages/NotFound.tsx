import { useNavigate } from 'react-router-dom';
import styles from './styles/NotFound.module.css';

export function NotFound(){
    const navigate = useNavigate();

    return(
        <main className={styles.container}>
            <h1 className={styles.code}>404</h1>
            <p className={styles.text}>Essa página não existe...</p>
            <button type='button' className={styles.backBtn} onClick={() => navigate('/')}>Voltar para o início</button>
        </main>
    )
}