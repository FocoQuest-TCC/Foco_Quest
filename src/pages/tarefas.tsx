import React, {useState, useEffect} from 'react';
import styles from './styles/Tarefas.module.css';

interface Tarefa{
    id: number;
    text: string;
    completed: boolean;
}

export function Tarefas(){
    const [tasks, setTasks] = useState<Tarefa[]>(()=>{
        try{
            const saved = localStorage.getItem('@focoquest:tarefas_simples');
            return saved ? JSON.parse(saved): [];
        }catch{
            return[];
        }
    });

    const [input, setInput] = useState('');

    useEffect(()=>{
        localStorage.setItem('@focoquest:tarefas_simples', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e: React.FormEvent) =>{
        e.preventDefault();
        if(!input.trim()) return;
        setTasks([...tasks, {id: Date.now(), text: input, completed: false}]);
        setInput('');
    };

    const toggleTask = (id: number) =>{
        setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed}: t));
    };

    const deleteTask = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.filter(t => t.id !== id));
    };

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>MISSÕES DIÁRIAS</h2>
            <form onSubmit={addTask} className={styles.inputBox}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder='Digite uma nova missão...' required />
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
                                <p>{t.text}</p>
                            </div>
                            <span className={styles.deleteIcon} onClick={(e) => deleteTask(t.id, e)}>X</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};