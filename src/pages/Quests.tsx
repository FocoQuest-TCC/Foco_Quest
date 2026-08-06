import React, { useState, type FormEvent } from 'react';
import type { ITarefa, IHabito } from './Home';
import styles from './styles/Quests.module.css';
import { DatePickerField } from './DatePickerField';
import { todayISO, nowHHMM, formatDateBR } from '../config/DateUtils';

interface QuestsProps {
    tasks: ITarefa[];
    setTasks: React.Dispatch<React.SetStateAction<ITarefa[]>>;
    habits: IHabito[];
    setHabits: React.Dispatch<React.SetStateAction<IHabito[]>>;
}

type ItemType = 'tarefa' | 'habito';

interface MissionRow {
    kind: ItemType;
    id: number;
    text: string;
    meta?: string;
    completed?: boolean;
    streak?: number;
}

export function Quests({ tasks, setTasks, habits, setHabits }: QuestsProps) {
    const [input, setInput] = useState('');
    const [date, setDate] = useState(todayISO());
    const [time, setTime] = useState(nowHHMM());
    const [repeat, setRepeat] = useState(false);

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (repeat) {
            setHabits([...habits, { id: Date.now(), title: input.toUpperCase(), streak: 0 }]);
        } else {
            setTasks([...tasks, { id: Date.now(), text: input, completed: false, date, time }]);
        }

        setInput('');
        setDate(todayISO());
        setTime(nowHHMM());
        setRepeat(false);
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const updateStreak = (id: number, val: number) => {
        setHabits(habits.map(h => (h.id === id ? { ...h, streak: Math.max(0, h.streak + val) } : h)));
    };

    const deleteHabit = (id: number) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const missions: MissionRow[] = [
        ...tasks.map((t): MissionRow => ({
            kind: 'tarefa',
            id: t.id,
            text: t.text,
            meta: [t.date ? formatDateBR(t.date) : null, t.time].filter(Boolean).join('  ·  ') || undefined,
            completed: t.completed,
        })),
        ...habits.map((h): MissionRow => ({
            kind: 'habito',
            id: h.id,
            text: h.title,
            meta: 'HÁBITO DIÁRIO',
            streak: h.streak,
        })),
    ].sort((a, b) => b.id - a.id);

    return (
        <section className={styles.container} aria-labelledby="Quests-heading">
            <h2 id="Quests-heading" className={styles.title}>Quests</h2>

            <section className={`${styles.block} cornerFrame`} aria-labelledby="missoes-heading">
                <h3 id="missoes-heading" className={styles.blockTitle}>Tarefas</h3>

                <form onSubmit={handleAdd} className={styles.missionForm}>
                    <input
                        className={styles.textInput}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Digite uma nova missão..."
                        required
                    />

                    <DatePickerField
                        date={date}
                        time={time}
                        onDateChange={setDate}
                        onTimeChange={setTime}
                        repeat={repeat}
                        onRepeatChange={setRepeat}
                        showRepeat
                    />

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
                                            <button type="button" className={styles.minus} onClick={() => updateStreak(m.id, -1)}>-</button>
                                            <span className={styles.streak}>{m.streak}</span>
                                            <button type="button" className={styles.plus} onClick={() => updateStreak(m.id, 1)}>+</button>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.deleteIcon}
                                        onClick={e => {
                                            e.stopPropagation();
                                            m.kind === 'tarefa' ? deleteTask(m.id) : deleteHabit(m.id);
                                        }}
                                    >
                                        X
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