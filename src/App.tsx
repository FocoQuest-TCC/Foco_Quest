import styles from './App.module.css';
import Branco from './assets/LOGO.png';
import { useNavigate } from 'react-router-dom';

const TRIANGLE_DOWN = 'M15.4 12C10.5 12 7.2 17 9.3 21.4L113.9 224.6C116.1 229 121.2 232 125 232C128.8 232 133.9 229 136.1 224.6L240.7 21.4C242.8 17 239.5 12 234.6 12H15.4Z';
const TRIANGLE_UP = 'M15.4 228C10.5 228 7.2 223 9.3 218.6L113.9 15.4C116.1 11 121.2 8 125 8C128.8 8 133.9 11 136.1 15.4L240.7 218.6C242.8 223 239.5 228 234.6 228H15.4Z';

type TriangleCardData =
|{ direction: 'down'; text: string }
|{ direction: 'up'; imgSrc: string; imgAlt: string; title: string };

const TRIANGLE_CARDS: TriangleCardData[] = [
  {
    direction: 'down',
    text: 'Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.',
  },
  {
    direction: 'up',
    imgSrc: 'https://i.imgur.com/lYqXWJx.png',
    imgAlt: 'Desafio',
    title: 'SE DESAFIE',
  },
  {
    direction: 'down',
    text: 'Complete tarefas para ganhar experiência e subir de nível com seu personagem.',
  },
  {
    direction: 'up',
    imgSrc: 'https://i.imgur.com/lYqXWJx.png',
    imgAlt: 'Personagem',
    title: 'CRIE SEU PERSONAGEM',
  },
  {
    direction: 'down',
    text: 'Progrida nas metas para liberar desafios e missões especiais.',
  },
];

const INTRO_TEXT = 
  'FocoQuest transforma sua rotina em uma jornada de RPG: cada missão concluída, hábito ' +
  'mantido e objetivo alcançado te aproxima do próximo nível. Veja abaixo como cada parte ' +
  'do sistema funciona.';

interface FeatureData{
  icon: string;
  title: string;
  text: string;
}

const FEATURES: FeatureData[] = [
  {
    icon: '🗓️',
    title: 'Cronograma',
    text: 'Tudo o que importa reunido num só lugar: o que fazer hoje, o que vem amanhã e o que ainda está por vir',
  },
  {
    icon: '✅',
    title: 'Atividades',
    text: 'Crie missões pontuais com data e horário marcados, e hábitos diários que você repete',
  },
  {
    icon: '📋',
    title: 'Kanban',
    text: 'Organize objetivos maiores em colunas - A fazer, fazendo e feito - e acompanhe o progresso visualmente.',
  },
  {
    icon: '⚔️',
    title: 'Guilda',
    text: 'Monte sua equipe de heróis e prepare-se para enfrentar desaios em grupo',
  },
  {
    icon: '🎒',
    title: 'Inventário',
    text: 'Colecione itens e equipamentos conforme avança nas suas conquistas.',
  },
];

function TriangleCard({ card }: { card: TriangleCardData }){
  const isDown = card.direction === 'down';

  return(
    <div className={styles.triangleCard}>
      <svg className={styles.triangleSvg} viewBox='0 0 250 240' fill='none' xmlns="http://www.w3.org/2000/svg" aria-hidden='true'>
        <path d={isDown ? TRIANGLE_DOWN : TRIANGLE_UP} fill='var(--triangle-bg)'/>
      </svg>
      <article className={`${styles.cardContent} ${isDown ? styles.paddingDown : styles.paddingUp}`}>
        {isDown ? (
          <p>{card.text}</p>
        ):(
          <>
            <img src={card.imgSrc} alt={card.imgAlt} />
            <h3>{card.title}</h3>
          </>
        )}
      </article>
    </div>
  );
}

export function App(){
  const navigate = useNavigate();

  return (
    <main className={styles.home}>
      <header className={styles.nav}>
        <nav className={styles.navBox} aria-label='Principal'>
          <div className={styles.headerLeft}>
            <img src={Branco} className={styles.logo} alt='Logo FocoQuest'/>
            <div className={styles.headerText}>
              <h1>FOCOQUEST</h1>
              <p>Motive-se a alcançar <br /> Seus objetivos.</p>
            </div>
          </div>
          <button type='button' className={styles.loginBtn} onClick={() => navigate('/login')}>
            <h2>INICIAR SESSÃO</h2>
          </button>
        </nav>
      </header>

      <section className={styles.homeSection} aria-label='Recursos do FocoQuest'>
        {TRIANGLE_CARDS.map((card, index) => (
          <TriangleCard key={index} card={card}/>
        ))}
      </section>

      <section className={styles.aboutContainer} aria-labelledby='Como-funciona'>
        <h2 id='Como-funciona' className={styles.sectionTitle}>COMO FUNCIONA</h2>

        <div className={styles.aboutRow}>
          <div className={styles.aboutText}>
            <p>{INTRO_TEXT}</p>
          </div>
          <div className={styles.aboutImage}>
            <img src="https://i.imgur.com/ES0GZ8Q.png" alt='Sobre o FocoQuest'/>
          </div>
        </div>

        <div className={styles.featureGrid}>
          {FEATURES.map(feature =>(
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden='true'>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.bannerContainer}>
        <img src="https://i.imgur.com/lYqXWJx.png" className={styles.banner} alt='Vídeo'/>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <img src={Branco} className={styles.footerLogo} alt='Logo footer'/>
          <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>
        </div>
        <div className={styles.footerLinks}>
          <nav aria-label='Companhia'>
            <h3>Companhia</h3>
            <button type='button' className={styles.footerLinksBtn} onClick={() => navigate('/fale-conosco')}>Fale conosco</button>
            <button type='button' className={styles.footerLinksBtn} onClick={() => navigate('/noticias')}>Notícias</button>
          </nav>
          <nav aria-label='Suporte'>
            <h3>Suporte</h3>
            <button type='button' className={styles.footerLinksBtn} onClick={() => navigate('/faq')}>Perguntas frequentes</button>
            <button type='button' className={styles.footerLinksBtn} onClick={() => navigate('/reportar-problema')}>Reportar um problema</button>
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