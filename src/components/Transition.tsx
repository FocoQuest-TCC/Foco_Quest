
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Transition.module.css';
import Logo from '../assets/LOGO.png';

interface TransitionProps {
  children: ReactNode;
}

export function Transition({ children }: TransitionProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);


  useEffect(() => {
    setLoading(true);
    setAnimationKey((previous) => previous + 1);

    const finishTimer = window.setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () => {
      window.clearTimeout(finishTimer);
    };
  }, [location.pathname]);

  return (
    <>
      {children}
        <div className={`${styles.overlay} ${loading ? styles.visible : styles.hidden}`} role="status" aria-hidden={!loading}>
          <img key={animationKey} src={Logo} className={styles.logo} alt="Logo do FocoQuest"/>
          <span className={styles.loadingText}>PREPARANDO A AVENTURA...</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}/>
          </div>
        </div>
    </>
  );
}