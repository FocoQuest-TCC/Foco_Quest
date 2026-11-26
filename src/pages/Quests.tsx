import React, { useRef, useState, type FormEvent } from 'react';
import type { ITarefa, IHabito } from './Home';
import styles from './styles/Quests.module.css';
import { DatePickerField } from './DatePickerField';
import { nowHHMM, formatDateBR, differenceInDays } from '../config/DateUtils';

interface QuestsProps {
    tasks: ITarefa[]; // conteúdo
    setTasks: React.Dispatch<React.SetStateAction<ITarefa[]>>; // Armazenamento
    habits: IHabito[]; // conteúdo
    setHabits: React.Dispatch<React.SetStateAction<IHabito[]>>; // Armazenamento
    currentDate: string;
    onExperienceChange: (amount: number) => Promise<boolean>;
}

// 'interface QuestsProps' pegam as informações das tarefas e do hábito, ou seja, quando for criar algo vai ter que obrigatóriamente passar por isso
// 'ITarefa e IHabito' foram tirados da home

// export interface ITarefa{
//   id: number;
//   text: string;
//   completed: boolean;
//   date?: string;
//   time?: string;
// }

// export interface IHabito{
//   id: number;
//   title: string;
//   streak: number;
// }

type ItemType = 'tarefa' | 'habito'; // Juntar os dois

interface MissionRow { // tabela de missão
    kind: ItemType; // chave
    id: number; 
    text: string;
    meta?: string;
    completed?: boolean;
    streak?: number;
}

export function Quests({ tasks, setTasks, habits, setHabits, currentDate, onExperienceChange }: QuestsProps) { // função para o form
    const [input, setInput] = useState('');
    const [date, setDate] = useState(currentDate);
    const [time, setTime] = useState(nowHHMM());
    const [repeat, setRepeat] = useState(false);
    const pendingRewardsRef = useRef(new Set<string>());

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();

        const text = input.trim();
        if (!text) return;

        const id = Date.now();

        if (repeat) { // se clicar na opção 'repetir' da página
            setHabits(previous => [...previous, { id, title: text.toUpperCase(), streak: 0 },]);
        } else {
            if (!date) return;
            setTasks(previous => [...previous, { id, text, completed: false, date, time, rewardClaimed: false, latePenaltyDays: 0 },]);
        }

        setInput('');
        setDate(currentDate);
        setTime(nowHHMM());
        setRepeat(false);
    };

    const toggleTask = (id: number) => {
        const task = tasks.find(candidate => candidate.id === id);
        if (!task) return;
        const isCompleting = !task.completed;
        const xpChange = isCompleting
            ? task.rewardClaimed ? 0 : 75
            : task.rewardClaimed ? -75 : 0;
        const rewardKey = `quest-${id}`;
        if (pendingRewardsRef.current.has(rewardKey)) return;

        const updateTask = () => {
            setTasks(previous => previous.map(candidate => candidate.id === id
                ? {
                    ...candidate,
                    completed: isCompleting,
                    ...(xpChange !== 0 ? { rewardClaimed: isCompleting } : {}),
                }
                : candidate));
        };
        if (xpChange === 0) {
            updateTask();
            return;
        }

        pendingRewardsRef.current.add(rewardKey);
        void onExperienceChange(xpChange)
            .then(applied => {
                if (applied) updateTask();
            })
            .finally(() => pendingRewardsRef.current.delete(rewardKey));
    };

    const deleteTask = (id: number) => {
        setTasks(previous => previous.filter(task => task.id !== id));
    };

    const markHabitToday = (id: number) => {
        const habit = habits.find(candidate => candidate.id === id);
        if (!habit || habit.lastCompletedDate === currentDate) return;
        const rewardKey = `habit-${id}-${currentDate}`;
        if (pendingRewardsRef.current.has(rewardKey)) return;
        const streak = habit.lastCompletedDate && differenceInDays(habit.lastCompletedDate, currentDate) === 1
            ? habit.streak + 1
            : 1;
        pendingRewardsRef.current.add(rewardKey);
        void onExperienceChange(25).then(applied => {
            if (applied) {
                setHabits(previous => previous.map(candidate => candidate.id === id
                    ? { ...candidate, streak, lastCompletedDate: currentDate }
                    : candidate));
            }
        }).finally(() => pendingRewardsRef.current.delete(rewardKey));
    };

    const deleteHabit = (id: number) => { 
        setHabits(previous => previous.filter(habit => habit.id !== id));
    };

    const missions: MissionRow[] = [ 
        ...tasks.map((t): MissionRow => ({ 
            kind: 'tarefa',
            id: t.id,
            text: t.text,
            meta: [t.date ? formatDateBR(t.date) : null, t.time].filter(Boolean).join('  ·  ') || undefined,
            completed: t.completed,
        })),
        ...habits.map((h): MissionRow => ({ // separar as duas funções 'tarefas' e 'hábitos'
            kind: 'habito',
            id: h.id,
            text: h.title,
            meta: 'HÁBITO DIÁRIO',
            streak: h.streak,
        })),
    ].sort((a, b) => b.id - a.id);

    return (
        <section className={styles.container}>
            <h2 className={styles.title}>Quests</h2>

            <section className={styles.block}>
                <h3 className={styles.blockTitle}>Tarefas</h3>

                <form onSubmit={handleAdd} className={styles.missionForm}>
                    <input
                        className={styles.textInput}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Digite uma nova missão..."
                        required
                    />

                    <div className={styles.modalDateRow}>
                        <DatePickerField date={date} time={time} onDateChange={setDate} onTimeChange={setTime} repeat={repeat} onRepeatChange={setRepeat} showRepeat/>
                    </div>

                    <button type="submit" className={styles.addBtn}>ADICIONAR</button>
                </form>

                <div className={styles.missionList}>
                    {missions.length === 0 ? (
                        <p className={styles.emptyText}>Nenhuma missão ativa no momento.</p>
                    ) : (
                        missions.map(m => (
                            <div
                                key={`${m.kind}-${m.id}`}
                                className={`${styles.item} ${styles[`accent-${m.kind}`]} ${m.completed ? styles.done : ''}`}
                                onClick={m.kind === 'tarefa' ? () => toggleTask(m.id) : undefined}
                                role={m.kind === 'tarefa' ? 'button' : undefined}
                                tabIndex={m.kind === 'tarefa' ? 0 : undefined}
                                aria-label={m.kind === 'tarefa' ? `${m.completed ? 'Reabrir' : 'Concluir'} tarefa: ${m.text}` : undefined}
                                aria-pressed={m.kind === 'tarefa' ? Boolean(m.completed) : undefined}
                                onKeyDown={e => {
                                    if(
                                        m.kind === 'tarefa' &&
                                        (e.key === 'Enter' || e.key === ' ')
                                    ){
                                        if(e.target !== e.currentTarget) return;
                                        e.preventDefault();
                                        toggleTask(m.id);
                                    }
                                }}
                            >
                                <div className={styles.leftRow}>
                                    {m.kind === 'tarefa' ? (
                                        <span className={styles.check}>{m.completed ? '✔' : ''}</span>
                                    ) : (
                                        <span className={styles.habitIcon} aria-hidden="true">🔥</span>
                                    )}
                                    <div className={styles.itemBody}>
                                        <p>{m.text}</p>
                                        {m.meta && <span className={styles.itemMeta}>{m.meta}</span>}
                                    </div>
                                </div>

                                <div className={styles.itemActions}>
                                    {m.kind === 'habito' && (
                                        <div className={styles.counter} onClick={e => e.stopPropagation()}>
                                            <span className={styles.streak}>{m.streak}</span>
                                            <button
                                                type="button"
                                                className={styles.plus}
                                                onClick={() => markHabitToday(m.id)}
                                                disabled={habits.find(habit => habit.id === m.id)?.lastCompletedDate === currentDate}
                                                aria-label={`Marcar hábito ${m.text} como concluído hoje e receber 25 XP`}
                                            >
                                                {habits.find(habit => habit.id === m.id)?.lastCompletedDate === currentDate ? '✓' : '+'}
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.deleteIcon}
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (m.kind === 'tarefa') deleteTask(m.id);
                                            else deleteHabit(m.id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </section>
    );
}