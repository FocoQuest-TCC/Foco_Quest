import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import styles from './styles/Kanban.module.css';

interface Task{
  id: number;
  text: string;
  column: 'todo'|'doing'|'done';
}

export function Kanban() {
  const [ModalOpen, setModalOpen] = useState<boolean>(false)
  const [newtasks, setnewTasks] = useState<string>('')

  const [tasks, setTasks] = useState<Task[]>(() => {
    try{
      const savedTasks = localStorage.getItem('@focoquest:tasks');
      if(savedTasks) return JSON.parse(savedTasks);
    }catch{
      localStorage.removeItem('@focoquest:tasks');
    }

    return[
      {id: 1, text: 'LEITURA DIÁRIA', column: 'todo'},
      {id: 2, text: 'REVISAR CÓDIGO', column: 'doing'}
    ];
  });

  useEffect(() => {
    localStorage.setItem('@focoquest:tasks', JSON.stringify(tasks));
  }, [tasks]);

  const CreateTask = (e: FormEvent<HTMLFormElement>): void =>{
    e.preventDefault();
    if(!newtasks.trim()) return;

    const newTask: Task ={
      id: Date.now(),
      text: newtasks.toUpperCase(),
      column: 'todo'
    };

    setTasks([...tasks, newTask]);
    setnewTasks('');
    setModalOpen(false);
  };

  const MoveTask = (id:number, targetColumn: 'todo' | 'doing' | 'done'):void =>{
    setTasks(tasks.map(t => t.id === id ?{...t, column:targetColumn}: t));
  };

  const DeleteTask=(id:number):void=>{
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>KANBAN</h2>
        <button type='button' className={styles.addBtn} onClick={() => setModalOpen(true)}>+</button>
      </div>

      <div className={styles.board}>
        <div className={styles.column}>
         <h3 className={`${styles.todoHeader} ${styles.Header}`}>PARA FAZER</h3>
          <div className={styles.cardList}>
           {tasks.filter(t => t.column === 'todo').map(t => (
              <div key={t.id} className={`${styles.taskCard} ${styles.todoCard}`}>
                <span>{t.text}</span>
                  <div className={styles.cardActions}>
                    <button type='button' className={styles.moveBtn} onClick={() => MoveTask(t.id, 'doing')}>➔</button>
                    <button type='button' className={styles.closeIcon} onClick={() => DeleteTask(t.id)}>x</button>
                  </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={`${styles.doingHeader} ${styles.Header}`}>FAZENDO</h3>
          <div className={styles.cardList}>
            {tasks.filter(t => t.column === 'doing').map(t => (
              <div key={t.id} className={`${styles.taskCard} ${styles.doingCard}`}>
                <span>{t.text}</span>
                <div className={styles.cardActions}>
                  <button type='button' className={styles.moveBtn} onClick={() => MoveTask(t.id, 'done')}>➔</button>
                  <button type='button' className={styles.closeIcon} onClick={() => DeleteTask(t.id)}>x</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={`${styles.doneHeader} ${styles.Header}`}>FEITO</h3>
          <div className={styles.cardList}>
            {tasks.filter(t => t.column === 'done').map(t => (
              <div key={t.id} className={`${styles.taskCard} ${styles.doneCard}`}>
                <span>{t.text}</span>
                <span className={styles.closeIcon} onClick={() => DeleteTask(t.id)}>x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ModalOpen &&(
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3>INICIAR NOVO KANBAN</h3>
            <form onSubmit={CreateTask}>
              <input type="text" placeholder='Descreva o objetivo da tarefa...' value={newtasks} onChange={(e: ChangeEvent<HTMLInputElement>) => setnewTasks(e.target.value)} className={styles.modalInput} autoFocus required />
                <div className={styles.modalActions}>
                  <button type='button' className={styles.cancelBtn} onClick={() => setModalOpen(false)}>CANCELAR</button>
                  <button type='submit' className={styles.confirmBtn}>CRIAR</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}