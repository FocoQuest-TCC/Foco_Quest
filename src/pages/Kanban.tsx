import styles from './styles/Kanban.module.css';
import { useState, useEffect,type ChangeEvent } from 'react';

interface Task{
  id: number;
  text: string;
  column: 'todo'|'doing'|'done';
}

export function Kanban() {
  const [ModalOpen, setModalOpen] = useState<boolean>(false)
  const [newtasks, setnewTasks] = useState<string>('')

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('@focoquest:tasks');
    if(savedTasks){
      return JSON.parse(savedTasks);
    }

    return[
      {id: 1, text: 'Leitura', column: 'todo'}
    ]
  });

  useEffect(() => {
    localStorage.setItem('@focoquest:tasks', JSON.stringify(tasks));
  }, [tasks]);

  const CreateTask = (): void =>{
    if(!newtasks.trim()) return;

    const newTask: Task ={
      id: Date.now(),
      text: newtasks,
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
        <h2 className={styles.sectionTitle}>Kanban</h2>
        <button className={styles.openModalBtn} onClick={() => setModalOpen(true)}>▶</button>
      </div>
      <div className={styles.tasksGrid}>
        <div className={styles.column}>
          <h3 className={styles.todoHeader}>Pendência</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'todo').map(task => (
              <div key={task.id} className={`${styles.taskCard} ${styles.tagRed}`}>
                <span>{task.text}</span>
                  <div className={styles.cardActions}>
                    <button className={styles.moveBtn} onClick={() => MoveTask(task.id, 'doing')} title='Mover para Fazendo'>➔</button>
                    <span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}>x</span>
                  </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doingHeader}>Fazendo</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'doing').map(task => (
              <div key={task.id} className={`${styles.taskCard} ${styles.tagGreen}`}>
                <span>{task.text}</span>
                <div className={styles.cardActions}>
                  <button className={styles.finishBtn} onClick={() => MoveTask(task.id, 'done')} title='Finalizar Tarefa'>✓</button>
                  <span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}>x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doneHeader}>Feito</h3>
          <div className={styles.cardList}>
            {tasks.filter(task => task.column === 'done').map(task => (
              <div key={task.id} className={`${styles.taskCard}`}>{task.text}<span className={styles.closeIcon} onClick={() => DeleteTask(task.id)}></span></div>
            ))}
          </div>
        </div>
      </div>
      {ModalOpen &&(
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <span className={styles.pinIcon}>📌</span>
            <input type="text" placeholder='Criar nova tarefa para kanban...' value={newtasks} onChange={(e: ChangeEvent<HTMLInputElement>) => setnewTasks(e.target.value)} className={styles.modalInput} autoFocus />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {setModalOpen(false); setnewTasks('');}}>Cancelar</button>
              <button className={styles.confirmBtn} onClick={CreateTask}>Criar Kanban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}