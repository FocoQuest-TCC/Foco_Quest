import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/InfoPageLayout.module.css';
import LogoP from '../../assets/LOGO-roxa.png';

interface InfoPageLayoutProps{
    title: string;
    children: ReactNode;
};

export function InfoPageLayout({ title, children }: InfoPageLayoutProps){
    const navigate = useNavigate();

    return(
        <div className={styles.page}>
            <header className={styles.header}>
                <button type='button' className={styles.logoBtn} onClick={() => navigate('/')} aria-label='Voltar para a página inicial'>
                    <img src={LogoP} className={styles.logo} alt="Logo FocoQuest" />
                </button>
                <button type='button' className={styles.backBtn} onClick={() => navigate(-1)}>VOLTAR</button>
            </header>

            <main className={styles.content}>
                <h1 className={styles.title}>{title}</h1>
                {children}
            </main>
        </div>
    )
}