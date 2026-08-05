import { useState } from 'react';
import { InfoPageLayout } from './InfoPageLayout';
import styles from './styles/Faq.module.css';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

const faqItems: FaqItem[] = [
    {
        id: 1,
        question: 'Como eu crio uma missão?',
        answer: 'Acesse a aba "Atividades" no painel, digite o que precisa fazer, escolha data e horário e clique em ADICIONAR.',
    },
    {
        id: 2,
        question: 'Qual a diferença entre Atividades e Kanban?',
        answer: 'Em Atividades ficam as missões pontuais com data marcada e os hábitos diários, que você repete todo dia acumulando streak. Kanban serve pra organizar objetivos maiores em colunas de progresso (A Fazer, Fazendo, Feito).',
    },
    {
        id: 3,
        question: 'O que aparece no Cronograma?',
        answer: 'O Cronograma junta tudo: tarefas e itens do Kanban com data marcada, mais seus hábitos diários, organizados em Hoje, Amanhã e Em Breve.',
    },
    {
        id: 4,
        question: 'Meus dados ficam salvos onde?',
        answer: 'Por enquanto, tudo é salvo localmente no seu navegador (localStorage). Ainda não há sincronização entre dispositivos.',
    },
    {
        id: 5,
        question: 'Como reporto um bug ou sugiro uma melhoria?',
        answer: 'Use os links "Reportar um problema" ou "Solicitar Sugestão" no rodapé da página inicial.',
    },
];

export function Faq() {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggle = (id: number) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    return (
        <InfoPageLayout title="PERGUNTAS FREQUENTES">
            <div className={styles.list}>
                {faqItems.map(item => {
                    const isOpen = openId === item.id;
                    return (
                        <div key={item.id} className={`${styles.item} cornerFrame`}>
                            <button
                                type='button'
                                className={styles.question}
                                onClick={() => toggle(item.id)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${item.id}`}
                            >
                                <span>{item.question}</span>
                                <span className={styles.icon} aria-hidden='true'>{isOpen ? '-' : '+'}</span>
                            </button>
                            {isOpen && (
                                <p id={`faq-answer-${item.id}`} className={styles.answer}>
                                    {item.answer}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </InfoPageLayout>
    );
}