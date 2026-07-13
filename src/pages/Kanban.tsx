import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { IKanbanTask } from './Home';
import styles from './styles/Kanban.module.css';
import { formatDateBR } from '../config/DateUtils';

interface KanbanProps{
  tasks: IKanbanTask[];
  setTasks: React.Dispatch<React.SetStateAction<IKanbanTask[]>>;
}

export function Kanban({ tasks, setTasks } : KanbanProps) {
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [newTaskText, setNewTaskText] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')

  useEffect(() =>{
    if (!isModalOpen) return;
    const KeyDown = (e: KeyboardEvent) =>{
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', KeyDown);
    return () => window.removeEventListener('keydown', KeyDown);
  }, [isModalOpen]);

  const createTask = (e: FormEvent<HTMLFormElement>): void =>{
    e.preventDefault();
    if(!newTaskText.trim()) return;

    const newTask: IKanbanTask ={
      id: Date.now(),
      text: newTaskText.toUpperCase(),
      column: 'todo',
      date: dueDate,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setDueDate('');
    setModalOpen(false);
  };

  const moveTask = (id:number, targetColumn: 'todo' | 'doing' | 'done'):void =>{
    setTasks(tasks.map(t => t.id === id ?{...t, column:targetColumn}: t));
  };

  const deleteTask=(id:number):void=>{
    setTasks(tasks.filter(t => t.id !== id));
  };

  const renderCard = (t: IKanbanTask, cardClass: string) => (
    <div key={t.id} className={`${styles.taskCard} ${cardClass}`}>
      <div className={styles.taskCardBody}>
        <span>{t.text}</span>
        {t.date && <span className={styles.dueDate}>Entrega: {formatDateBR(t.date)}</span>}
      </div>
      <div className={styles.cardActions}>
        {t.column !== 'done' && (
          <button type='button' className={styles.moveBtn} onClick={() => moveTask(t.id, t.column === 'todo' ? 'doing' : 'done')}>➔</button>
        )}
          <button type='button' className={styles.closeIcon} onClick={() => deleteTask(t.id)}>x</button>
      </div>
    </div>
  );
 
  return (
    <section className={styles.container} aria-labelledby="kanbanTitle">
      <div className={styles.headerRow}>
        <h2 id="kanbanTitle" className={styles.title}>KANBAN</h2>
        <button type='button' className={styles.addBtn} onClick={() => setModalOpen(true)}>+</button>
      </div>
 
      <div className={styles.board}>
        <section className={styles.column} aria-labelledby="todo-heading">
         <h3 id="todo-heading" className={`${styles.todoHeader} ${styles.Header}`}>PARA FAZER</h3>
          <div className={styles.cardList}>
           {tasks.filter(t => t.column === 'todo').map(t => renderCard(t, styles.todoCard))}
          </div>
        </section>
 
        <section className={styles.column} aria-labelledby="doing-heading">
         <h3 id="doing-heading" className={`${styles.doingHeader} ${styles.Header}`}>FAZENDO</h3>
          <div className={styles.cardList}>
           {tasks.filter(t => t.column === 'doing').map(t => renderCard(t, styles.doingCard))}
          </div>
        </section>
 
        <section className={styles.column} aria-labelledby="done-heading">
         <h3 id="done-heading" className={`${styles.doneHeader} ${styles.Header}`}>FEITO</h3>
          <div className={styles.cardList}>
           {tasks.filter(t => t.column === 'done').map(t => renderCard(t, styles.doneCard))}
          </div>
        </section>
      </div>
 
      {isModalOpen &&(
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3>INICIAR NOVO KANBAN</h3>
            <form onSubmit={createTask}>
              <input type="text" placeholder='Descreva o objetivo da tarefa...' value={newTaskText} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)} className={styles.modalInput} autoFocus required />
              <label className={styles.modalLabel} htmlFor="kanbanDueDate">DATA DE ENTREGA (OPCIONAL)</label>
              <input id='kanbanDueDate' type="date" value={dueDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)} className={styles.modalInput}/>
                <div className={styles.modalActions}>
                  <button type='button' className={styles.cancelBtn} onClick={() => setModalOpen(false)}>CANCELAR</button>
                  <button type='submit' className={styles.confirmBtn}>CRIAR</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}