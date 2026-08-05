import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ITarefa, IHabito } from './Home';
import styles from './styles/Quests.module.css';
import {
    todayISO,
    tomorrowISO,
    nowHHMM,
    formatDateBR,
    getMonthMatrix,
    MONTH_NAMES,
    WEEKDAY_LABELS,
    pad,
} from '../config/DateUtils';

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

    const [isDatePanelOpen, setDatePanelOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => Number(todayISO().slice(0, 4)));
    const [viewMonth, setViewMonth] = useState(() => Number(todayISO().slice(5, 7)) - 1);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDatePanelOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setDatePanelOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDatePanelOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKey);
        };
    }, [isDatePanelOpen]);

    const openDatePanel = () => {
        const [y, m] = date.split('-').map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
        setDatePanelOpen(true);
    };

    const goToPrevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const pickDate = (iso: string) => {
        setDate(iso);
        setRepeat(false);
    };

    const dateButtonLabel = repeat
        ? '🔁 Repete'
        : date === todayISO()
            ? 'Hoje'
            : date === tomorrowISO()
                ? 'Amanhã'
                : formatDateBR(date);

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
        setDatePanelOpen(false);
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

                    <div className={styles.dateFieldWrapper} ref={pickerRef}>
                        <button
                            type="button"
                            className={styles.dateBtn}
                            onClick={() => (isDatePanelOpen ? setDatePanelOpen(false) : openDatePanel())}
                            aria-expanded={isDatePanelOpen}
                        >
                            📅 {dateButtonLabel}
                        </button>

                        {isDatePanelOpen && (
                            <div className={`${styles.datePanel} cornerFrame`} role="dialog" aria-label="Escolher data">
                                <div className={styles.quickOptions}>
                                    <button type="button" onClick={() => pickDate(todayISO())}>
                                        Hoje
                                    </button>
                                    <button type="button" onClick={() => pickDate(tomorrowISO())}>
                                        Amanhã
                                    </button>
                                </div>

                                <div className={styles.calendarNav}>
                                    <button type="button" onClick={goToPrevMonth} aria-label="Mês anterior">‹</button>
                                    <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                                    <button type="button" onClick={goToNextMonth} aria-label="Próximo mês">›</button>
                                </div>

                                <div className={styles.calendarGrid}>
                                    {WEEKDAY_LABELS.map((w, i) => (
                                        <span key={i} className={styles.weekdayLabel}>{w}</span>
                                    ))}
                                    {getMonthMatrix(viewYear, viewMonth).flat().map((day, i) => {
                                        if (day === null) return <span key={i} />;
                                        const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                                        const isSelected = !repeat && iso === date;
                                        const isToday = iso === todayISO();
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className={`${styles.dayCell} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
                                                onClick={() => pickDate(iso)}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className={styles.panelRow}>
                                    <label htmlFor="missionTime">HORA</label>
                                    <input
                                        id="missionTime"
                                        type="time"
                                        value={time}
                                        disabled={repeat}
                                        onChange={e => setTime(e.target.value)}
                                    />
                                </div>

                                <label className={styles.repeatRow}>
                                    <input
                                        type="checkbox"
                                        checked={repeat}
                                        onChange={e => setRepeat(e.target.checked)}
                                    />
                                    <span>🔁 Repetir diariamente <em>(vira um hábito)</em></span>
                                </label>
                            </div>
                        )}
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