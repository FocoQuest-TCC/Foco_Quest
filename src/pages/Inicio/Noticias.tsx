import { InfoPageLayout } from './InfoPageLayout';
import styles from './styles/Noticias.module.css';

interface NewsItem {
    id: number;
    title: string;
    date: string;
    excerpt: string;
    tag: string;
}

const news: NewsItem[] = [
    {
        id: 1,
        title: 'Cronograma unificado chegou!',
        date: '10/07/2026',
        tag: 'ATUALIZAÇÃO',
        excerpt: 'Agora Quests e Kanban aparecem juntos no Cronograma, organizados em Hoje, Amanhã e Em Breve.',
    },
    {
        id: 2,
        title: 'Sistema de Guildas em desenvolvimento',
        date: '02/07/2026',
        tag: 'EM BREVE',
        excerpt: 'Em breve você vai poder formar guildas com outros heróis e enfrentar chefes em conjunto.',
    },
    {
        id: 3,
        title: 'Bem-vindo ao FocoQuest',
        date: '20/06/2026',
        tag: 'NOVIDADE',
        excerpt: 'Transforme sua rotina em uma aventura. Ganhe experiência, suba de nível e conquiste seus objetivos.',
    },
];

export function Noticias() {
    return (
        <InfoPageLayout title="NOTÍCIAS">
            <div className={styles.list}>
                {news.map(item => (
                    <article key={item.id} className={`${styles.card} cornerFrame`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.tag}>{item.tag}</span>
                            <time className={styles.date}>{item.date}</time>
                        </div>
                        <h2 className={styles.cardTitle}>{item.title}</h2>
                        <p className={styles.cardExcerpt}>{item.excerpt}</p>
                    </article>
                ))}
            </div>
        </InfoPageLayout>
    );
}