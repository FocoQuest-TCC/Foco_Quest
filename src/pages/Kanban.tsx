import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { IKanbanBoard, IKanbanTask } from './Home';
import styles from './styles/Kanban.module.css';
import { DatePickerField } from './DatePickerField';
import { formatDateBR, todayISO } from '../config/DateUtils';

interface KanbanProps {
    boards: IKanbanBoard[]; // conteúdo
    setBoards: React.Dispatch<React.SetStateAction<IKanbanBoard[]>>; // Armazenamento
    tasks: IKanbanTask[]; // conteúdo
    setTasks: React.Dispatch<React.SetStateAction<IKanbanTask[]>>; // Armazenamento
    onExperienceChange: (amount: number) => Promise<boolean>;
}

// 'interface KanbanProps' mesma coisa do quest

export function Kanban({ boards, setBoards, tasks, setTasks, onExperienceChange }: KanbanProps) {
    const [activeBoardId, setActiveBoardId] = useState<number | null>(null);

    const [isBoardModalOpen, setBoardModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [dueDate, setDueDate] = useState(todayISO());
    const [dueTime, setDueTime] = useState('');
    const [completionNotice, setCompletionNotice] = useState('');
    const [isFinishingBoard, setIsFinishingBoard] = useState(false);
    const rewardInProgressRef = useRef(false);

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

        const name = newBoardName.trim();
        if (!name) return;

        const board: IKanbanBoard = { id: Date.now(), name: newBoardName.toUpperCase() };

        setBoards(previous => [...previous, board]);
        setNewBoardName('');
        setBoardModalOpen(false);
        setActiveBoardId(board.id);
    };

    const deleteBoard = (id: number): void => {
        setBoards(previous => previous.filter(board => board.id !== id));

        setTasks(previous => previous.filter(task => task.boardId !== id));

        if (activeBoardId === id) {
            setActiveBoardId(null);
        }
    };

    const createTask = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        const text = newTaskText.trim();

        if (!text || activeBoardId === null || !dueDate) return;

        const newTask: IKanbanTask = {
            id: Date.now(),
            boardId: activeBoardId,
            text: text.toUpperCase(),
            column: 'todo',
            date: dueDate,
            time: dueTime || undefined,
            latePenaltyDays: 0,
        };

        setTasks(previous => [...previous, newTask]);

        setNewTaskText('');
        setDueDate(todayISO());
        setDueTime('');
        setTaskModalOpen(false);
    };

    const moveTask = (id: number, targetColumn: 'todo' | 'doing' | 'done'): void => {
        const boardId = tasks.find(task => task.id === id)?.boardId;
        if (boards.find(board => board.id === boardId)?.rewardClaimed) return;
        setTasks(previous => previous.map(task => task.id === id ? { ...task, column: targetColumn } : task));
    };

    const deleteTask = (id: number): void => {
        const boardId = tasks.find(task => task.id === id)?.boardId;
        if (boards.find(board => board.id === boardId)?.rewardClaimed) return;
        setTasks(previous => previous.filter(task => task.id !== id));
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
                {!activeBoard?.rewardClaimed && t.column !== 'todo' && (
                    <button type="button" className={styles.moveBtn} onClick={() => moveTask(t.id, t.column === 'done' ? 'doing' : 'todo')} title="Voltar tarefa" aria-label={`Voltar tarefa ${t.text}`} >
                        🠜
                    </button>
                )}
                {!activeBoard?.rewardClaimed && t.column !== 'done' && (
                    <button type="button" className={styles.moveBtn} onClick={() => moveTask(t.id, t.column === 'todo' ? 'doing' : 'done')} title="Avançar tarefa" aria-label={`Avançar tarefa ${t.text}`} >
                        🠞
                    </button>
                )}
                {!activeBoard?.rewardClaimed && (
                    <button type="button" className={styles.closeIcon} onClick={() => deleteTask(t.id)} title="Excluir tarefa" aria-label={`Excluir tarefa ${t.text}`}>✕</button>
                )}
            </div>
        </div>
    );

    if (!activeBoard) {
        return (
            <section className={styles.container}>
                <div className={styles.headerRow}>
                    <h2 id="kanbanTitle" className={styles.title}>KANBAN</h2>
                </div>

                <div className={styles.boardGrid}>
                    {boards.map(b => {
                        const count = tasks.filter(task => task.boardId === b.id).length;
                        return (
                            <div
                                key={b.id}
                                className={`${styles.boardCard} cornerFrame`}
                                style={{ position: 'relative' }}
                            >
                                <button
                                    type="button"
                                    className={styles.boardDeleteBtn}
                                    onClick={() => deleteBoard(b.id)}
                                    aria-label={`Excluir quadro ${b.name}`}
                                >
                                    ✕
                                </button>
        
                                <button
                                    type="button"
                                    onClick={() => setActiveBoardId(b.id)}
                                    aria-label={`Abrir quadro ${b.name}`}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '100%',
                                        padding: '20px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'inherit',
                                        font: 'inherit',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span
                                        className={styles.boardIcon}
                                        aria-hidden="true"
                                    >
                                        📁
                                    </span>

                                    <h3>{b.name}</h3>

                                    <span className={styles.boardCount}>
                                        {count} {count === 1 ? 'tarefa' : 'tarefas'}
                                    </span>
                                    {b.rewardClaimed && <span className={styles.boardCompleted}>FINALIZADO</span>}
                                </button>
                            </div>
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
    
    const boardTasks = tasks.filter(t => t.boardId === activeBoard.id);
    const isBoardFinalized = Boolean(activeBoard.rewardClaimed);
    const boardComplete = boardTasks.length > 0 && boardTasks.every(task => task.column === 'done');
    const finishBoard = async () => {
        if (!boardComplete || activeBoard.rewardClaimed || rewardInProgressRef.current) return;
        rewardInProgressRef.current = true;
        setIsFinishingBoard(true);
        const reward = boardTasks.length * 150;
        try {
            const applied = await onExperienceChange(reward);
            if (applied) {
                setBoards(previous => previous.map(board => board.id === activeBoard.id
                    ? { ...board, rewardClaimed: true }
                    : board));
                setCompletionNotice(`Quadro finalizado! Você recebeu ${reward} XP.`);
            }
        } finally {
            rewardInProgressRef.current = false;
            setIsFinishingBoard(false);
        }
    };

    return (
        <section className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.boardHeading}>
                    <button type="button" className={styles.backBtn} onClick={() => setActiveBoardId(null)}>
                        🠜 Voltar
                    </button>
                    <h2 id="kanbanTitle" className={styles.title}>{activeBoard.name}</h2>
                </div>
                {!isBoardFinalized && (
                    <button type="button" className={styles.addBtn} onClick={() => setTaskModalOpen(true)} aria-label="Adicionar tarefa">+</button>
                )}
            </div>

            {isBoardFinalized && <p className={styles.boardCompletedNotice}>KANBAN FINALIZADO · ESTE QUADRO NÃO PODE MAIS SER ALTERADO.</p>}
            {completionNotice && <p className={styles.completionNotice} role="status">{completionNotice}</p>}
            {boardComplete && !isBoardFinalized && (
                <div className={styles.finishBoard}>
                    <p>Todas as tarefas foram concluídas. Finalize para receber {boardTasks.length * 150} XP.</p>
                    <button type="button" className={styles.finishBoardBtn} onClick={finishBoard} disabled={isFinishingBoard}>
                        {isFinishingBoard ? 'FINALIZANDO...' : `FINALIZAR QUADRO · RECEBER ${boardTasks.length * 150} XP`}
                    </button>
                </div>
            )}

            <div className={styles.board}>
                <section className={styles.column}>
                    <h3 id="todo-heading" className={`${styles.todoHeader} ${styles.Header}`}>PARA FAZER</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'todo').map(t => renderCard(t, styles.todoCard))}
                    </div>
                </section>

                <section className={styles.column}>
                    <h3 id="doing-heading" className={`${styles.doingHeader} ${styles.Header}`}>FAZENDO</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'doing').map(t => renderCard(t, styles.doingCard))}
                    </div>
                </section>

                <section className={styles.column}>
                    <h3 id="done-heading" className={`${styles.doneHeader} ${styles.Header}`}>FEITO</h3>
                    <div className={styles.cardList}>
                        {boardTasks.filter(t => t.column === 'done').map(t => renderCard(t, styles.doneCard))}
                    </div>
                </section>
            </div>

            {isTaskModalOpen && !isBoardFinalized && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalBox} cornerFrame`}>
                        <h3>NOVA TAREFA</h3>
                        <form onSubmit={createTask}>
                            <div className={styles.modal}>
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