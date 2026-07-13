import React, {useState, type FormEvent} from 'react';
import type { ITarefa } from './Home';
import styles from './styles/Tarefas.module.css';
import { todayISO, nowHHMM, formatDateBR } from '../config/DateUtils'

interface TarefaProps{
    tasks: ITarefa[];
    setTasks: React.Dispatch<React.SetStateAction<ITarefa[]>>;
}

export function Tarefas({ tasks, setTasks } : TarefaProps){
    const [input, setInput] = useState('');
    const [date, setDate] = useState(todayISO());
    const [time, setTime] = useState(nowHHMM());

    const addTask = (e: FormEvent) =>{
        e.preventDefault();
        if(!input.trim()) return;
        setTasks([...tasks, {id: Date.now(), text: input, completed: false, date, time}]);
        setInput('');
        setDate(todayISO());
        setTime(nowHHMM());
    };

    const toggleTask = (id: number) =>{
        setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed}: t));
    };

    const deleteTask = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.filter(t => t.id !== id));
    };

    return(
        <section className={styles.container} aria-labelledby="tarefasTitle">
            <h2 id="tarefasTitle" className={styles.title}>GERENCIADOR DE TAREFAS</h2>
            <form onSubmit={addTask} className={styles.inputBox}>
                <input className={styles.textInput} value={input} onChange={e => setInput(e.target.value)} placeholder='Digite uma nova tarefa...' required />
                <input type="date" className={styles.dateInput} value={date} onChange={e => setDate(e.target.value)} aria-label='Data da tarefa' required />
                <input type="time" className={styles.timeInput} value={time} onChange={e => setTime(e.target.value)} aria-label='Horário da tarefa' required />
                <button type='submit'>ADICIONAR</button>
            </form>
            <div className={styles.list}>
                {tasks.length === 0 ?(
                    <p className={styles.emptyText}>Nenhuma missão ativa no momento.</p>
                ) : (
                    tasks.map(t => (
                        <div key={t.id} className={`${styles.item} ${t.completed ? styles.done :''}`} onClick={()=> toggleTask(t.id)}>
                            <div className={styles.leftRow}>
                                <span className={styles.check}>{t.completed ? '✔':''}</span>
                                <div className={styles.itemBody}>
                                    <p>{t.text}</p>
                                    {(t.date || t.time) && (
                                        <span className={styles.itemMeta}>
                                            {t.date ? formatDateBR(t.date) : ''}{t.date && t.time ? ' · ' : ''}{t.time ?? ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button type='button' className={styles.deleteIcon} onClick={(e) => deleteTask(t.id, e)}>X</button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};