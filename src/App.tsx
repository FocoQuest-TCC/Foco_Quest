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
            <img src={LogoP} className={styles.logo} alt="Logo"/>
            <div className={styles.headerText}>
              <h1>FOCOQUEST</h1>
              <p>Motive-se a alcançar <br /> Seus objetivos.</p>
            </div>
          </div>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>
            <h2>INICIAR SESSÃO</h2>
          </button>
        </div>
      </header>

      <section className={styles.homeSection}>
        <article className={`${styles.triangleCard} ${styles.pointingDown}`}>
          <p>Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.</p>
        </article>
        <article className={`${styles.triangleCard} ${styles.pointingUp}`}>
          <img src="https://i.imgur.com/lYqXWJx.png" alt="Desafio"/>
          <h3>SE DESAFIE</h3>
        </article>
        <article className={`${styles.triangleCard} ${styles.pointingDown}`}>
          <p>Complete tarefas para ganhar experiência e subir de nível com seu personagem.</p>
        </article>
        <article className={`${styles.triangleCard} ${styles.pointingUp}`}>
          <img src="https://i.imgur.com/F7g8z4x.png" alt="Personagem"/>
          <h3>CRIE SEU PERSONAGEM</h3>
        </article>
        <article className={`${styles.triangleCard} ${styles.pointingDown}`}>
          <p>Progrida nas metas para liberar desafios e missões especiais.</p>
        </article>
      </section>

      <section className={styles.about}>
        <div className={styles.aboutText}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam.</p>
          <p>Quis nostrud exercitation ullamco laboris nisi ut aliquip
          ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
        </div>
        <div className={styles.aboutImage}>
          <img src="https://i.imgur.com/ES0GZ8Q.png" alt="Sobre" />
        </div>
      </section>

      <aside className={styles.bannerContainer}>
        <img src="https://i.imgur.com/lYqXWJx.png" className={styles.banner} alt="Banner" />
      </aside>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <img src={LogoP} className={styles.footerLogo} alt="Logo footer" />
          <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h3>Companhia</h3>
            <p>Fale conosco</p>
            <p>Notícias</p>
          </div>
          <div>
            <h3>Suporte</h3>
            <p>Perguntas frequentes</p>
            <p>Reportar um problema</p>
            <p>Solicitar Sugestão</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 FocoQuest.</p>
          <div>
            <span>Política de Privacidade</span>
            <span>Termos de Uso</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;

// 92