import {useState, useEffect} from 'react';
import styles from './styles/Tarefas.module.css';

interface Tarefa{
    id: number;
    text: string;
    completed: boolean;
}

export function Tarefas(){
    const [tasks, setTasks] = useState<Tarefa[]>(()=>{
        const saved = localStorage.getItem('@focoquest:tarefas_simples');
        return saved ? JSON.parse(saved): [];
    });

    const [input, setInput] = useState('');

    useEffect(()=>{
        localStorage.setItem('@focoquest:tarefas_simples', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () =>{
        if(!input.trim()) return;
        setTasks([...tasks, {id: Date.now(), text: input, completed: false}]);
        setInput('');
    };

    const toggleTask = (id: number) =>{
        setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed}: t));
    };

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>Tarefas Diárias</h2>
            <div className={styles.inputBox}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder='Nova missão...'/>
                <button onClick={addTask}>+</button>
            </div>
            <div className={styles.list}>
                {tasks.map(t => (
                    <div  key={t.id} className={`${styles.item} ${t.completed ? styles.done :''}`} onClick={()=> toggleTask(t.id)}>
                        <span className={styles.check}>{t.completed ? '✔':''}</span>
                        <p>{t.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};