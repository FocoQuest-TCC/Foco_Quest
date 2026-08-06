import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { IKanbanBoard, IKanbanTask } from './Home';
import styles from './styles/Kanban.module.css';
import { DatePickerField } from './DatePickerField';
import { formatDateBR } from '../config/DateUtils';

interface KanbanProps {
    boards: IKanbanBoard[];
    setBoards: React.Dispatch<React.SetStateAction<IKanbanBoard[]>>;
    tasks: IKanbanTask[];
    setTasks: React.Dispatch<React.SetStateAction<IKanbanTask[]>>;
}

export function Kanban({ boards, setBoards, tasks, setTasks }: KanbanProps) {
    const [activeBoardId, setActiveBoardId] = useState<number | null>(null);

    const [isBoardModalOpen, setBoardModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');

    useEffect(() => {
        if (!isBoardModalOpen && !isTaskModalOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setBoardModalOpen(false);
                setTaskModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBoardModalOpen, isTaskModalOpen]);

    const activeBoard = boards.find(b => b.id === activeBoardId) ?? null;

    const createBoard = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!newBoardName.trim()) return;
        const board: IKanbanBoard = { id: Date.now(), name: newBoardName.toUpperCase() };
        setBoards([...boards, board]);
        setNewBoardName('');
        setBoardModalOpen(false);
        setActiveBoardId(board.id);
    };

    const deleteBoard = (id: number, e: React.MouseEvent): void => {
        e.stopPropagation();
        setBoards(boards.filter(b => b.id !== id));
        setTasks(tasks.filter(t => t.boardId !== id));
        if (activeBoardId === id) setActiveBoardId(null);
    };

    const createTask = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!newTaskText.trim() || activeBoardId === null) return;

        const newTask: IKanbanTask = {
            id: Date.now(),
            boardId: activeBoardId,
            text: newTaskText.toUpperCase(),
            column: 'todo',
            date: dueDate || undefined,
            time: dueDate ? (dueTime || undefined) : undefined,
        };

        setTasks([...tasks, newTask]);
        setNewTaskText('');
        setDueDate('');
        setDueTime('');
        setTaskModalOpen(false);
    };

    const moveTask = (id: number, targetColumn: 'todo' | 'doing' | 'done'): void => {
        setTasks(tasks.map(t => (t.id === id ? { ...t, column: targetColumn } : t)));
    };

    const deleteTask = (id: number): void => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const renderCard = (t: IKanbanTask, cardClass: string) => (
        <div key={t.id} className={`${styles.taskCard} ${cardClass}`}>
            <div className={styles.taskCardBody}>
                <span>{t.text}</span>
                {t.date && (
                    <span className={styles.dueDate}>
                        Entrega: {formatDateBR(t.date)}{t.time ? ` · ${t.time}` : ''}
                    </span>
                )}
            </div>
            <div className={styles.cardActions}>
                {t.column !== 'done' && (
                    <button
                        type="button"
                        className={styles.moveBtn}
                        onClick={() => moveTask(t.id, t.column === 'todo' ? 'doing' : 'done')}
                    >
                        ➔
                    </button>
                )}
                <button type="button" className={styles.closeIcon} onClick={() => deleteTask(t.id)}>x</button>
            </div>
        </div>
    );

    // ---------- Vista: lista de quadros ("pastas") ----------
    if (!activeBoard) {
        return (
            <section className={styles.container} aria-labelledby="kanbanTitle">
                <div className={styles.headerRow}>
                    <h2 id="kanbanTitle" className={styles.title}>KANBAN</h2>
                </div>

                <div className={styles.boardGrid}>
                    {boards.map(b => {
                        const count = tasks.filter(t => t.boardId === b.id).length;
                        return (
                            <button
                                key={b.id}
                                type="button"
                                className={`${styles.boardCard} cornerFrame`}
                                onClick={() => setActiveBoardId(b.id)}
                            >
                                <button
                                    type="button"
                                    className={styles.boardDeleteBtn}
                                    onClick={e => deleteBoard(b.id, e)}
                                    aria-label={`Excluir quadro ${b.name}`}
                                >
                                    x
                                </button>
                                <span className={styles.boardIcon} aria-hidden="true">📁</span>
                                <h3>{b.name}</h3>
                                <span className={styles.boardCount}>{count} {count === 1 ? 'tarefa' : 'tarefas'}</span>
                            </button>
                        );
                    })}

                    <button type="button" className={styles.newBoardCard} onClick={() => setBoardModalOpen(true)}>
                        <span className={styles.newBoardIcon}>+</span>
                        <span>Criar novo Kanban</span>
                    </button>
                </div>

                {isBoardModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setBoardModalOpen(false)}>
                        <div className={`${styles.modalBox} cornerFrame`} onClick={e => e.stopPropagation()}>
                            <h3>NOVO KANBAN</h3>
                            <form onSubmit={createBoard}>
                                <input
                                    type="text"
                                    placeholder="Nome do quadro (ex: TCC, Casa nova...)"
                                    value={newBoardName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewBoardName(e.target.value)}
                                    className={styles.modalInput}
                                    autoFocus
                                    required
                                />
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setBoardModalOpen(false)}>CANCELAR</button>
                                    <button type="submit" className={styles.confirmBtn}>CRIAR</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        );
    }

    // ---------- Vista: dentro de um quadro ----------
    const boardTasks = tasks.filter(t => t.boardId === activeBoard.id);

    return (
        <section className={styles.container} aria-labelledby="kanbanTitle">
            <div className={styles.headerRow}>
                <div className={styles.boardHeading}>
                    <button type="button" className={styles.backBtn} onClick={() => setActiveBoardId(null)}>
                        ← Voltar
                    </button>
                    <h2 id="kanbanTitle" className={styles.title}>{activeBoard.name}</h2>
                </div>
                <button type="button" className={styles.addBtn} onClick={() => setTaskModalOpen(true)}>+</button>
            </div>

            <div className={styles.board}>
                <section className={styles.column} aria-labelledby="todo-heading">
                    <h3 id="todo-heading" className={`${styles.todoHeader} ${styles.Header}`}>PARA FAZER</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'todo').map(t => renderCard(t, styles.todoCard))}
                    </div>
                </section>

                <section className={styles.column} aria-labelledby="doing-heading">
                    <h3 id="doing-heading" className={`${styles.doingHeader} ${styles.Header}`}>FAZENDO</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'doing').map(t => renderCard(t, styles.doingCard))}
                    </div>
                </section>

                <section className={styles.column} aria-labelledby="done-heading">
                    <h3 id="done-heading" className={`${styles.doneHeader} ${styles.Header}`}>FEITO</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'done').map(t => renderCard(t, styles.doneCard))}
                    </div>
                </section>
            </div>

            {isTaskModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setTaskModalOpen(false)}>
                    <div className={`${styles.modalBox} cornerFrame`} onClick={e => e.stopPropagation()}>
                        <h3>NOVA TAREFA</h3>
                        <form onSubmit={createTask}>
                            <input
                                type="text"
                                placeholder="Descreva o objetivo da tarefa..."
                                value={newTaskText}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
                                className={styles.modalInput}
                                autoFocus
                                required
                            />

                            <div className={styles.modalDateRow}>
                                <DatePickerField
                                    date={dueDate}
                                    time={dueTime}
                                    onDateChange={setDueDate}
                                    onTimeChange={setDueTime}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setTaskModalOpen(false)}>CANCELAR</button>
                                <button type="submit" className={styles.confirmBtn}>CRIAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}