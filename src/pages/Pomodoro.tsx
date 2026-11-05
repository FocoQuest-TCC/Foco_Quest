import { useEffect, useMemo, useState } from 'react';
import type { ITarefa, IKanbanTask } from './Home';
import styles from './styles/Pomodoro.module.css';
import { usePersistentState } from '../config/UsePersistentState';
import { todayISO, tomorrowISO, formatDateBR } from '../config/DateUtils';
import {
    DEFAULT_POMODORO_DURATIONS,
    isPomodoroDurations,
    type PomodoroDurations,
} from '../config/pomodoro';
import avisoSound from '../assets/aviso.mp3';

type Mode = 'pomodoro' | 'short' | 'long';

interface PomodoroProps {
    tasks: ITarefa[];
    setTasks: React.Dispatch<React.SetStateAction<ITarefa[]>>;
    kanbanTasks: IKanbanTask[];
    setKanbanTasks: React.Dispatch<React.SetStateAction<IKanbanTask[]>>;
    durations: PomodoroDurations;
    onSaveDurations: (durations: PomodoroDurations) => Promise<'database' | 'device'>;
    onTimerUpdate: (status: PomodoroStatus) => void;
}

export interface PomodoroStatus {
    time: string;
    phase: string;
    isRunning: boolean;
}

type FocusKind = 'tarefa' | 'kanban';

interface FocusRef {
    kind: FocusKind;
    id: number;
}

interface FocusItem extends FocusRef {
    text: string;
    done: boolean;
}

interface PickerOption extends FocusRef {
    text: string;
    label: string;
}

type PickerGroupKey = 'hoje' | 'amanha' | 'breve';

const GROUP_TITLES: Record<PickerGroupKey, string> = {
    hoje: 'Hoje',
    amanha: 'Amanhã',
    breve: 'Em breve',
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

export function Pomodoro({
    tasks,
    setTasks,
    kanbanTasks,
    setKanbanTasks,
    durations,
    onSaveDurations,
    onTimerUpdate,
}: PomodoroProps) {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [secondsLeft, setSecondsLeft] = useState(durations.focus * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [round, setRound] = useState(1);
    const [completedPomodoros, setCompletedPomodoros] = usePersistentState<number>('@focoquest:pomodoro_count', 0);

    const [focusRefs, setFocusRefs] = usePersistentState<FocusRef[]>('@focoquest:pomodoro_focus', []);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [durationDraft, setDurationDraft] = useState<PomodoroDurations>(durations);
    const [settingsError, setSettingsError] = useState('');
    const [settingsNotice, setSettingsNotice] = useState('');
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const notificationAudio = useMemo(() => new Audio(avisoSound), []);

    const phaseDurations = useMemo<Record<Mode, number>>(() => ({
        pomodoro: durations.focus * 60,
        short: durations.shortBreak * 60,
        long: durations.longBreak * 60,
    }), [durations.focus, durations.shortBreak, durations.longBreak]);
    const draftIsValid = isPomodoroDurations(durationDraft);

    const saveDurationSettings = async () => {
        if (!draftIsValid) {
            setSettingsError('Informe tempos inteiros entre 1 e 180 minutos.');
            return;
        }

        setSettingsError('');
        setSettingsNotice('');
        setIsSavingSettings(true);
        try {
            const saveLocation = await onSaveDurations(durationDraft);
            setSecondsLeft(phaseDurations[mode]);
            setIsRunning(false);
            setSettingsNotice(saveLocation === 'database'
                ? 'Tempos salvos no banco de dados.'
                : 'Tempos salvos neste dispositivo.');
            setIsSettingsOpen(false);
        } catch (error) {
            setSettingsError(error instanceof Error ? error.message : 'Não foi possível salvar os tempos.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    useEffect(() => {
        onTimerUpdate({
            time: formatTime(secondsLeft),
            phase: mode === 'pomodoro' ? 'Foco' : 'Pausa',
            isRunning,
        });
    }, [secondsLeft, mode, isRunning, onTimerUpdate]);

    useEffect(() => {
        if (!isRunning) return;

        const timer = setTimeout(() => {
            if (secondsLeft > 1) {
                setSecondsLeft(secondsLeft - 1);
                return;
            }

            notificationAudio.currentTime = 0;
            void notificationAudio.play().catch(error => {
                console.error('Não foi possível reproduzir o aviso do Pomodoro:', error);
            });
            setIsRunning(false);

            if (mode === 'pomodoro') {
                const nextCount = completedPomodoros + 1;
                setCompletedPomodoros(nextCount);
                const nextMode: Mode = nextCount % 4 === 0 ? 'long' : 'short';
                setMode(nextMode);
                setSecondsLeft(phaseDurations[nextMode]);
                setRound(r => r + 1);
            } else {
                setMode('pomodoro');
                setSecondsLeft(phaseDurations.pomodoro);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [isRunning, secondsLeft, mode, completedPomodoros, setCompletedPomodoros, phaseDurations, notificationAudio]);

    const changeMode = (newMode: Mode) => {
        setMode(newMode);
        setSecondsLeft(phaseDurations[newMode]);
        setIsRunning(false);
    };

    const resetTimer = () => {
        setSecondsLeft(phaseDurations[mode]);
        setIsRunning(false);
    };

    const focusItems: FocusItem[] = focusRefs.flatMap((ref): FocusItem[] => {
        if (ref.kind === 'tarefa') {
            const t = tasks.find(x => x.id === ref.id);
            return t ? [{ ...ref, text: t.text, done: t.completed }] : [];
        }
        const k = kanbanTasks.find(x => x.id === ref.id);
        return k ? [{ ...ref, text: k.text, done: k.column === 'done' }] : [];
    });

    const today = todayISO();
    const tomorrow = tomorrowISO();
    const pickerGroups: Record<PickerGroupKey, PickerOption[]> = { hoje: [], amanha: [], breve: [] };

    const alreadyPicked = (kind: FocusKind, id: number) => focusRefs.some(r => r.kind === kind && r.id === id);

    const groupOf = (date: string | undefined): PickerGroupKey | null => {
        if (!date) return 'breve';
        if (date === today) return 'hoje';
        if (date === tomorrow) return 'amanha';
        return date > tomorrow ? 'breve' : null;
    };

    tasks.forEach(t => {
        if (t.completed || alreadyPicked('tarefa', t.id)) return;
        const group = groupOf(t.date ?? today);
        if (!group) return;
        pickerGroups[group].push({
            kind: 'tarefa',
            id: t.id,
            text: t.text,
            label: group === 'breve' && t.date ? formatDateBR(t.date) : (t.time ?? ''),
        });
    });

    kanbanTasks.forEach(k => {
        if (k.column === 'done' || alreadyPicked('kanban', k.id)) return;
        const group = groupOf(k.date);
        if (!group) return;
        pickerGroups[group].push({
            kind: 'kanban',
            id: k.id,
            text: k.text,
            label: group === 'breve' && k.date ? formatDateBR(k.date) : (k.time ?? 'Kanban'),
        });
    });

    const hasOptions = (Object.keys(pickerGroups) as PickerGroupKey[]).some(g => pickerGroups[g].length > 0);

    const addToFocus = (option: PickerOption) => {
        setFocusRefs([...focusRefs, { kind: option.kind, id: option.id }]);
    };

    const removeFromFocus = (item: FocusRef) => {
        setFocusRefs(focusRefs.filter(r => !(r.kind === item.kind && r.id === item.id)));
    };

    // Marcar como feita atualiza a tarefa original (Atividades / Kanban), então o Cronograma reflete na hora.
    const toggleDone = (item: FocusItem) => {
        if (item.kind === 'tarefa') {
            setTasks(tasks.map(t => (t.id === item.id ? { ...t, completed: !t.completed } : t)));
        } else {
            setKanbanTasks(
                kanbanTasks.map(k => (k.id === item.id ? { ...k, column: k.column === 'done' ? 'todo' : 'done' } : k))
            );
        }
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

            <section className={styles.settings}>
                <button
                    className={styles.settingsToggle}
                    type="button"
                    aria-expanded={isSettingsOpen}
                    onClick={() => {
                        setDurationDraft(durations);
                        setSettingsError('');
                        setSettingsNotice('');
                        setIsSettingsOpen(open => !open);
                    }}
                >
                    {isSettingsOpen ? 'Fechar configuração' : 'Configurar tempos'}
                </button>
                {settingsNotice && <p className={styles.settingsNotice} role="status">{settingsNotice}</p>}
                {isSettingsOpen && (
                    <div className={styles.settingsPanel}>
                        <p>Defina a duração de cada fase em minutos (de 1 a 180).</p>
                        <label>
                            Foco
                            <input
                                type="number"
                                min="1"
                                max="180"
                                step="1"
                                value={durationDraft.focus}
                                disabled={isRunning || isSavingSettings}
                                onChange={event => setDurationDraft(current => ({
                                    ...current,
                                    focus: event.target.value === '' ? 0 : Number(event.target.value),
                                }))}
                            />
                        </label>
                        <label>
                            Pausa curta
                            <input
                                type="number"
                                min="1"
                                max="180"
                                step="1"
                                value={durationDraft.shortBreak}
                                disabled={isRunning || isSavingSettings}
                                onChange={event => setDurationDraft(current => ({
                                    ...current,
                                    shortBreak: event.target.value === '' ? 0 : Number(event.target.value),
                                }))}
                            />
                        </label>
                        <label>
                            Pausa longa
                            <input
                                type="number"
                                min="1"
                                max="180"
                                step="1"
                                value={durationDraft.longBreak}
                                disabled={isRunning || isSavingSettings}
                                onChange={event => setDurationDraft(current => ({
                                    ...current,
                                    longBreak: event.target.value === '' ? 0 : Number(event.target.value),
                                }))}
                            />
                        </label>
                        {isRunning && <p>Pause o cronômetro para alterar os tempos.</p>}
                        {settingsError && <p className={styles.settingsError} role="alert">{settingsError}</p>}
                        <button
                            className={styles.saveSettings}
                            type="button"
                            disabled={!draftIsValid || isRunning || isSavingSettings}
                            onClick={() => void saveDurationSettings()}
                        >
                            {isSavingSettings ? 'SALVANDO...' : 'SALVAR TEMPOS'}
                        </button>
                        {durations.focus === DEFAULT_POMODORO_DURATIONS.focus
                            && durations.shortBreak === DEFAULT_POMODORO_DURATIONS.shortBreak
                            && durations.longBreak === DEFAULT_POMODORO_DURATIONS.longBreak
                            && <span className={styles.defaultHint}>Tempos padrão: 25 min de foco, 5 min de pausa curta e 15 min de pausa longa.</span>}
                    </div>
                )}
            </section>

            <div className={styles.taskBlock}>
                <h3 className={styles.taskBlockTitle}>Foco da sessão</h3>

                {focusItems.length > 0 ? (
                    <div className={styles.taskList}>
                        {focusItems.map(item => (
                            <div
                                key={`${item.kind}-${item.id}`}
                                className={`${styles.taskItem} ${item.done ? styles.taskDone : ''}`}
                                onClick={() => toggleDone(item)}
                            >
                                <span className={styles.taskCheck}>{item.done ? '✔' : ''}</span>
                                <p>{item.text}</p>
                                <button
                                    type="button"
                                    className={styles.taskDelete}
                                    aria-label="Tirar da sessão"
                                    title="Tirar da sessão (não apaga a tarefa)"
                                    onClick={e => { e.stopPropagation(); removeFromFocus(item); }}
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyFocus}>Nenhuma tarefa escolhida ainda.</p>
                )}

                <button
                    type="button"
                    className={styles.pickBtn}
                    onClick={() => setIsPickerOpen(open => !open)}
                    aria-expanded={isPickerOpen}
                >
                    {isPickerOpen ? 'Fechar lista' : '+ Escolher do Cronograma'}
                </button>

                {isPickerOpen && (
                    <div className={styles.picker}>
                        {!hasOptions && <p className={styles.emptyFocus}>Nada pendente no Cronograma.</p>}

                        {(Object.keys(pickerGroups) as PickerGroupKey[]).map(group =>
                            pickerGroups[group].length > 0 && (
                                <div key={group} className={styles.pickerGroup}>
                                    <h4>{GROUP_TITLES[group]}</h4>
                                    {pickerGroups[group].map(option => (
                                        <button
                                            key={`${option.kind}-${option.id}`}
                                            type="button"
                                            className={styles.pickerOption}
                                            onClick={() => addToFocus(option)}
                                        >
                                            <span className={styles.pickerLabel}>{option.label}</span>
                                            <span className={styles.pickerText}>{option.text}</span>
                                            <span className={styles.pickerPlus} aria-hidden="true">+</span>
                                        </button>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}