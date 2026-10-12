import { useEffect, useState, type FormEvent } from 'react';
import styles from './styles/Pomodoro.module.css';
import { usePersistentState } from '../config/UsePersistentState';

type Mode = 'pomodoro' | 'short' | 'long';

interface SessionTask {
    id: number;
    text: string;
    completed: boolean;
}

const DURATIONS: Record<Mode, number> = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
    pomodoro: 'Pomodoro',
    short: 'Pausa curta',
    long: 'Pausa longa',
};

const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function Pomodoro() {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro);
    const [isRunning, setIsRunning] = useState(false);
    const [round, setRound] = useState(1);
    const [completedPomodoros, setCompletedPomodoros] = usePersistentState<number>('@focoquest:pomodoro_count', 0);

    const [sessionTasks, setSessionTasks] = usePersistentState<SessionTask[]>('@focoquest:pomodoro_tasks', []);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    useEffect(() => {
        if (!isRunning) return;

        if (secondsLeft <= 0) {
            setIsRunning(false);

            if (mode === 'pomodoro') {
                const nextCount = completedPomodoros + 1;
                setCompletedPomodoros(nextCount);
                const nextMode: Mode = nextCount % 4 === 0 ? 'long' : 'short';
                setMode(nextMode);
                setSecondsLeft(DURATIONS[nextMode]);
                setRound(r => r + 1);
            } else {
                setMode('pomodoro');
                setSecondsLeft(DURATIONS.pomodoro);
            }
            return;
        }

        const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [isRunning, secondsLeft, mode, completedPomodoros, setCompletedPomodoros]);

    const changeMode = (newMode: Mode) => {
        setMode(newMode);
        setSecondsLeft(DURATIONS[newMode]);
        setIsRunning(false);
    };

    const resetTimer = () => {
        setSecondsLeft(DURATIONS[mode]);
        setIsRunning(false);
    };

    const addTask = (e: FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        setSessionTasks([...sessionTasks, { id: Date.now(), text: newTaskText, completed: false }]);
        setNewTaskText('');
        setIsAddingTask(false);
    };

    const toggleTask = (id: number) => {
        setSessionTasks(sessionTasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const deleteTask = (id: number) => {
        setSessionTasks(sessionTasks.filter(t => t.id !== id));
    };

    return (
        <section className={styles.container} aria-labelledby="pomodoro-heading">
            <h2 id="pomodoro-heading" className={styles.title}>POMODORO</h2>

            <div className={`${styles.timerCard} cornerFrame ${styles[mode]}`}>
                <div className={styles.modeTabs} role="tablist" aria-label="Modo do timer">
                    {(Object.keys(MODE_LABELS) as Mode[]).map(m => (
                        <button
                            key={m}
                            type="button"
                            role="tab"
                            aria-selected={mode === m}
                            className={mode === m ? styles.modeActive : ''}
                            onClick={() => changeMode(m)}
                        >
                            {MODE_LABELS[m]}
                        </button>
                    ))}
                </div>

                <p className={styles.clock}>{formatTime(secondsLeft)}</p>

                <div className={styles.timerActions}>
                    <button type="button" className={styles.startBtn} onClick={() => setIsRunning(r => !r)}>
                        {isRunning ? 'PAUSAR' : 'COMEÇAR'}
                    </button>
                    <button type="button" className={styles.resetBtn} onClick={resetTimer} aria-label="Reiniciar timer">
                        ↺
                    </button>
                </div>

                <p className={styles.roundInfo}>
                    <span>#{round}</span> {mode === 'pomodoro' ? 'Hora de focar!' : 'Hora de descansar!'}
                </p>
            </div>

            <div className={styles.taskBlock}>
                <h3 className={styles.taskBlockTitle}>Tarefas da sessão</h3>

                {sessionTasks.length > 0 && (
                    <div className={styles.taskList}>
                        {sessionTasks.map(t => (
                            <div
                                key={t.id}
                                className={`${styles.taskItem} ${t.completed ? styles.taskDone : ''}`}
                                onClick={() => toggleTask(t.id)}
                            >
                                <span className={styles.taskCheck}>{t.completed ? '✔' : ''}</span>
                                <p>{t.text}</p>
                                <button
                                    type="button"
                                    className={styles.taskDelete}
                                    onClick={e => { e.stopPropagation(); deleteTask(t.id); }}
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isAddingTask ? (
                    <form onSubmit={addTask} className={styles.addTaskForm}>
                        <input
                            value={newTaskText}
                            onChange={e => setNewTaskText(e.target.value)}
                            placeholder="No que você vai focar?"
                            autoFocus
                            onBlur={() => { if (!newTaskText.trim()) setIsAddingTask(false); }}
                            className={styles.addTaskInput}
                        />
                        <button type="submit">Adicionar</button>
                    </form>
                ) : (
                    <button type="button" className={styles.addTaskBtn} onClick={() => setIsAddingTask(true)}>
                        + Adicionar tarefa
                    </button>
                )}
            </div>
        </section>
    );
}