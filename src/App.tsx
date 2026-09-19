import styles from './App.module.css';
import Roxo from './assets/LOGO-roxa.png';
import { useNavigate } from 'react-router-dom';

type HeroCardData =
|{ kind: 'text'; text: string }
|{ kind: 'image'; imgSrc: string; title: string };

// 'type HeroCardData' é para os retângulos, que talvez eu vá transformar em triângulos(fica bem merda, mas eu to tentando) que estão no começo da página
// 'kind' é o tipo, 'text' é a frase, 'imgSrc' é a imagem, 'title' é o título do 2 e 4 retângulo

const HERO_CARDS: HeroCardData[] = [
  {
    kind: 'text',
    text: 'Ganhe equipamentos, mascotes e habilidades mágicas conforme avança.',
  },
  {
    kind: 'image',
    imgSrc: 'https://i.imgur.com/lYqXWJx.png',
    title: 'SE DESAFIE',
  },
  {
    kind: 'text',
    text: 'Complete tarefas para ganhar experiência e subir de nível com seu personagem.',
  },
  {
    kind: 'image',
    imgSrc: 'https://i.imgur.com/lYqXWJx.png',
    title: 'CRIE SEU PERSONAGEM',
  },
  {
    kind: 'text',
    text: 'Progrida nas metas para liberar desafios e missões especiais.',
  },
];

// 'const HERO_CARDS' é os retângulos

const INTRO_TEXT = 
  'FocoQuest transforma sua rotina em uma jornada de RPG: cada missão concluída, hábito ' +
  'mantido e objetivo alcançado te aproxima do próximo nível. Veja abaixo como cada parte ' +
  'do sistema funciona.';

// 'const INTRO_TEXT' é o texto no meio da página

interface FeatureData{
  title: string;
  text: string;
}

// 'interface FeatureData' são os blocos do final do meio

const FEATURES: FeatureData[] = [
  {
    title: 'Cronograma',
    text: 'Tudo o que importa reunido num só lugar: o que fazer hoje, o que vem amanhã e o que ainda está por vir',
  },
  {
    title: 'Atividades',
    text: 'Crie missões pontuais com data e horário marcados, e hábitos diários que você repete',
  },
  {
    title: 'Kanban',
    text: 'Organize objetivos maiores em colunas - A fazer, fazendo e feito - e acompanhe o progresso visualmente.',
  },
  {
    title: 'Guilda',
    text: 'Monte sua equipe de heróis e prepare-se para enfrentar desaios em grimageo',
  },
  {
    title: 'Inventário',
    text: 'Colecione itens e equipamentos conforme avança nas suas conquistas.',
  },
];

// 'const FEATURES' é o conteúdo dos blocos no final do meio

function HeroCard({ card }: { card: HeroCardData }){
  const isText = card.kind === 'text';

  return(
    <article className={`${styles.heroCard} ${isText ? styles.textCard : styles.imageCard}`}>
        {isText ? (
          <p>{card.text}</p>
        ):(
          <>
            <img src={card.imgSrc}/>
            <h3>{card.title}</h3>
          </>
        )}
    </article>
  );
}

// 'function HeroCard' a função dos retângulos

export function App() { // nem preciso explicar isso né, básico
  const navigate = useNavigate();
 
  return (
    <main className={styles.home}>
      <div className={styles.navMain}>
        <header className={styles.nav}>
          <nav className={styles.navBox} aria-label="Principal">
            <div className={styles.headerLeft}>
              <img src={Roxo} className={styles.logo}/>
              <div className={styles.headerText}>
                <h1>FOCOQUEST</h1>
                <p>
                  Motive-se a alcançar <br /> Seus objetivos.
                </p>
              </div>
            </div>
            <button type="button" className={styles.loginBtn} onClick={() => navigate('/login')}>
              <h2>INICIAR SESSÃO</h2>
            </button>
          </nav>
        </header>
      </div>
      
 
      <section className={styles.homeSection} aria-label="Recursos do FocoQuest">
        {HERO_CARDS.map((card, index) => (
          <HeroCard key={index} card={card} />
        ))}
      </section>
 
      <section className={styles.aboutContainer}>
        <h2 className={styles.sectionTitle}>COMO FUNCIONA</h2>
 
        <div className={styles.aboutRow}>
          <div className={styles.aboutText}>
            <p>{INTRO_TEXT}</p>
          </div>
          <div className={styles.aboutImage}>
            <img src="https://i.imgur.com/ES0GZ8Q.png"/>
          </div>
        </div>
 
        <div className={styles.featureGrid}>
          {FEATURES.map(feature => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden="true"></span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
 
      <div className={styles.bannerContainer}>
        <img src="https://i.imgur.com/lYqXWJx.png" className={styles.banner}/>
      </div>
      
      <div className={styles.footerMain}>
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <img src={Roxo} className={styles.footerLogo}/>
            <p>Junte-se a milhões de pessoas que organizam trabalho e vida pessoal com FocoQuest</p>
          </div>
          <div className={styles.footerLinks}>
            <nav aria-label="Companhia">
              <h3>Companhia</h3>
              <button type="button" className={styles.footerLinksBtn} onClick={() => navigate('/fale-conosco')}>Fale conosco</button>
              <button type="button" className={styles.footerLinksBtn} onClick={() => navigate('/noticias')}>Notícias</button>
            </nav>
            <nav aria-label="Suporte">
              <h3>Suporte</h3>
              <button type="button" className={styles.footerLinksBtn} onClick={() => navigate('/faq')}>Perguntas frequentes</button>
              <button type="button" className={styles.footerLinksBtn} onClick={() => navigate('/reportar-problema')}>Reportar um problema</button>
            </nav>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 FocoQuest.</p>
            <div>
              <button type="button" className={styles.footerBottomBtn}>Política de Privacidade</button>
              <button type="button" className={styles.footerBottomBtn}>Termos de Uso</button>
            </div>
          </div>
        </footer>
      </div>
      
    </main>
  );
}