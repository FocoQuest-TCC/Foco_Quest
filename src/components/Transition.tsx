
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Transition.module.css';
import Logo from '../assets/LOGO.png';

interface TransitionProps {
  children: ReactNode;
}

export function Transition({ children }: TransitionProps) {
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setActivePath(location.pathname)
    setLoading(true);
    setAnimationKey(previous => previous + 1);

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1150);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {children}
      
      <div className={`${styles.overlay} ${loading ? styles.visible : styles.hidden}`} role={loading ? 'status' : undefined} aria-live='polite' aria-hidden={!loading} aria-label='Carregando página' key={activePath}>
        <div className={styles.pixelGrid} aria-hidden='true'/>
          <div className={styles.content} key={animationKey}>
            <div className={styles.logoFrame}>
              <img src={Logo} className={styles.logo} alt="Logo do FocoQuest"/>
            </div>
            <h2 className={styles.loadingText}>PREPARANDO A AVENTURA <span className={styles.dots}>...</span></h2>
            <div className={styles.progressBar} aria-hidden='true'>
              <div className={styles.progressFill}/>
            </div>
            <span className={styles.loadingHint}>CARREGANDO MISSÃO</span>
          </div>
      </div>
    </>
  );
}