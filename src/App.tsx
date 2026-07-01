import styles from './App.module.css';
import LogoP from './assets/LOGO-roxa.png';
import { useNavigate } from 'react-router-dom';

export function App() {
  const navigate = useNavigate();

  return (
    <main className={styles.home}>
      <header className={styles.nav}>
        <div className={styles.navBox}>
          <div className={styles.headerLeft}>
            <img src={LogoP} className={styles.logo} alt='Logo FocoQuest'/>
            <div className={styles.headerText}>
              <h1>FOCOQUEST</h1>
              <p>Motive-se a alcançar <br /> Seus objetivos.</p>
            </div>
          </div>
          <button type='button' className={styles.loginBtn} onClick={() => navigate('/login')}>
            <h2>INICIAR SESSÃO</h2>
          </button>
        </div>
      </header>

      <section className={styles.homeSection}>
        <div className={styles.triangleCard}>
          <svg className={styles.triangleSvg} viewBox="0 0 250 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4 12C10.5 12 7.2 17 9.3 21.4L113.9 224.6C116.1 229 121.2 232 125 232C128.8 232 133.9 229 136.1 224.6L240.7 21.4C242.8 17 239.5 12 234.6 12H15.4Z" fill="var(--triangle-bg)"/>
          </svg>
          <article className={`${styles.cardContent} ${styles.paddingDown}`}>
            <p>Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.</p>
          </article>
        </div>

        <div className={styles.triangleCard}>
          <svg className={styles.triangleSvg} viewBox="0 0 250 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4 228C10.5 228 7.2 223 9.3 218.6L113.9 15.4C116.1 11 121.2 8 125 8C128.8 8 133.9 11 136.1 15.4L240.7 218.6C242.8 223 239.5 228 234.6 228H15.4Z" fill="var(--triangle-bg)"/>
          </svg>
          <article className={`${styles.cardContent} ${styles.paddingUp}`}>
            <img src="https://i.imgur.com/lYqXWJx.png" alt="Desafio" />
            <h3>SE DESAFIE</h3>
          </article>
        </div>

        <div className={styles.triangleCard}>
          <svg className={styles.triangleSvg} viewBox="0 0 250 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4 12C10.5 12 7.2 17 9.3 21.4L113.9 224.6C116.1 229 121.2 232 125 232C128.8 232 133.9 229 136.1 224.6L240.7 21.4C242.8 17 239.5 12 234.6 12H15.4Z" fill="var(--triangle-bg)"/>
          </svg>
          <article className={`${styles.cardContent} ${styles.paddingDown}`}>
            <p>Complete tarefas para ganhar experiência e subir de nível com seu personagem.</p>
          </article>
        </div>

        <div className={styles.triangleCard}>
          <svg className={styles.triangleSvg} viewBox="0 0 250 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4 228C10.5 228 7.2 223 9.3 218.6L113.9 15.4C116.1 11 121.2 8 125 8C128.8 8 133.9 11 136.1 15.4L240.7 218.6C242.8 223 239.5 228 234.6 228H15.4Z" fill="var(--triangle-bg)"/>
          </svg>
          <article className={`${styles.cardContent} ${styles.paddingUp}`}>
            <img src="https://i.imgur.com/F7g8z4x.png" alt="Personagem" />
            <h3>CRIE SEU PERSONAGEM</h3>
          </article>
        </div>

        <div className={styles.triangleCard}>
          <svg className={styles.triangleSvg} viewBox="0 0 250 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4 12C10.5 12 7.2 17 9.3 21.4L113.9 224.6C116.1 229 121.2 232 125 232C128.8 232 133.9 229 136.1 224.6L240.7 21.4C242.8 17 239.5 12 234.6 12H15.4Z" fill="var(--triangle-bg)"/>
          </svg>
          <article className={`${styles.cardContent} ${styles.paddingDown}`}>
            <p>Progrida nas metas para liberar desafios e missões especiais.</p>
          </article>
        </div>
      </section>

      <section className={styles.aboutContainer}>
        <div className={styles.aboutRow}>
          <div className={styles.aboutText}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
              aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
          <div className={styles.aboutImage}>
            <img src="https://i.imgur.com/ES0GZ8Q.png" alt='Sobre o FocoQuest'/>
          </div>
        </div>

        <div className={styles.aboutRow}>
          <div className={styles.aboutText}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
              aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.bannerContainer}>
        <img src="https://i.imgur.com/lYqXWJx.png" className={styles.banner} alt='Banner Promocional'/>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <img src={LogoP} className={styles.footerLogo} alt='Logo Rodapé'/>
          <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>
        </div>
        <div className={styles.footerLinks}>
          <nav>
            <h3>Companhia</h3>
            <button type='button' className={styles.footerLinksBtn}>Fale conosco</button>
            <button type='button' className={styles.footerLinksBtn}>Notícias</button>
          </nav>
          <nav>
            <h3>Suporte</h3>
            <button type='button' className={styles.footerLinksBtn}>Perguntas frequentes</button>
            <button type='button' className={styles.footerLinksBtn}>Reportar um problema</button>
            <button type='button' className={styles.footerLinksBtn}>Solicitar Sugestão</button>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 FocoQuest.</p>
          <div>
            <button type='button' className={styles.footerBottomBtn}>Política de Privacidade</button>
            <button type='button' className={styles.footerBottomBtn}>Termos de Uso</button>
          </div>
        </div>
      </footer>
    </main>
  );
}