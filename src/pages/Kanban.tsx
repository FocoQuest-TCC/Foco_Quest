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

  const CreateTask = (e: FormEvent): void =>{
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

  const MoveTask = (id:number, nextColumn: 'todo' | 'doing' | 'done'):void =>{
    setTasks(tasks.map(task => task.id === id ?{...task, column:nextColumn}:task));
  };

  const DeleteTask=(id:number):void=>{
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className={styles.kanbanContainer}>
      <div className={styles.titleContianer}>
        <h2 className={styles.sectionTitle}>KANBAN</h2>
        <button className={styles.openModalBtn} onClick={() => setModalOpen(true)}>+ NOVA MISSÃO</button>
      </div>
      <div className={styles.tasksGrid}>
        <div className={styles.column}>
          <h3 className={styles.todoHeader}>A FAZER</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'todo').map(task => (
              <div key={task.id} className={styles.taskCard}>
                <span>{task.text}</span>
                  <div className={styles.cardActions}>
                    <button className={styles.moveBtn} onClick={() => MoveTask(task.id, 'doing')}>➔</button>
                    <span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}>x</span>
                  </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doingHeader}>FAZENDO</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'doing').map(task => (
              <div key={task.id} className={`${styles.taskCard} ${styles.doingCard}`}>
                <span>{task.text}</span>
                <div className={styles.cardActions}>
                  <button className={styles.finishBtn} onClick={() => MoveTask(task.id, 'done')}>✓</button>
                  <span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}>x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doneHeader}>CONCLUÍDO</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'done').map(task => (
              <div key={task.id} className={`${styles.taskCard} ${styles.doneCard}`}>
                <span>{task.text}</span>
                <span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}>x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {ModalOpen &&(
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3>INICIAR NOVA QUEST</h3>
            <form onSubmit={CreateTask}>
              <input type="text" placeholder='Descreva o objetivo da missão...' value={newtasks} onChange={(e: ChangeEvent<HTMLInputElement>) => setnewTasks(e.target.value)} className={styles.modalInput} autoFocus required />
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