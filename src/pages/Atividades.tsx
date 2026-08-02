import React, {useState, type FormEvent} from 'react';
import type { ITarefa, IHabito } from './Home';
import styles from './styles/Atividades.module.css';
import { todayISO, nowHHMM, formatDateBR } from '../config/DateUtils'

interface AtividadesProps{
    tasks: ITarefa[];
    setTasks: React.Dispatch<React.SetStateAction<ITarefa[]>>;
    habits: IHabito[];
    setHabits: React.Dispatch<React.SetStateAction<IHabito[]>>;
}

export function Atividades({ tasks, setTasks, habits, setHabits } : AtividadesProps){
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

    const [newHabit, setNewHabit] = useState('');

     const addHabit = (e: FormEvent<HTMLFormElement>) => {
         e.preventDefault();
         if (!newHabit.trim()) return;
         setHabits([...habits, {id: Date.now(), title: newHabit.toUpperCase(), streak: 0}]);
         setNewHabit('');
     };

     const updateStreak = (id: number, val: number) =>{
         setHabits(habits.map(h => h.id === id ? {...h, streak: Math.max(0, h.streak + val)}: h));
     };

    return(
        <section className={styles.container} aria-labelledby="atividades-heading">
            <h2 id="atividades-heading" className={styles.title}>ATIVIDADES</h2>
            <section className={styles.block} aria-labelledby="missoes-heading">
                <h3 id="missoes-heading" className={styles.blockTitle}>Missões</h3>
                <form onSubmit={addTask} className={styles.taskForm}>
                    <input className={styles.textInput} value={input} onChange={e => setInput(e.target.value)} placeholder='Digite uma nova tarefa...' required />
                    <input type="date" className={styles.dateInput} value={date} onChange={e => setDate(e.target.value)} aria-label='Data da tarefa' required />
                    <input type="time" className={styles.timeInput} value={time} onChange={e => setTime(e.target.value)} aria-label='Horário da tarefa' required />
                    <button type='submit'>ADICIONAR</button>
                </form>
                <div className={styles.taskList}>
                    {tasks.length === 0 ?(
                        <p className={styles.emptyText}>Nenhuma missão ativa no momento.</p>
                    ) : (
                        tasks.map(t => (
                            <div key={t.id} className={`${styles.taskItem} ${t.completed ? styles.done :''}`} onClick={()=> toggleTask(t.id)}>
                                <div className={styles.leftRow}>
                                    <span className={styles.check}>{t.completed ? '✔':''}</span>
                                    <div className={styles.itemBody}>
                                        <p>{t.text}</p>
                                        {(t.date || t.time) && (
                                            <span className={styles.itemMeta}>
                                                {t.date ? formatDateBR(t.date) : ''}
                                                {t.date && t.time ? ' · ' : ''}
                                                {t.time ?? ''}
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

            <section className={styles.block} aria-labelledby="habitos-heading">
                <h3 id="habitos-heading" className={styles.blockTitle}>Hábitos</h3>
                <form onSubmit={addHabit} className={styles.habitForm}>
                    <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder='Novo hábito...' required />
                    <button type='submit'>+</button>
                </form>

                <div className={styles.habitGrid}>
                    {habits.length === 0 ?(
                        <p className={styles.emptyText}>Nenhum hábito registrado.</p>
                    ) : (
                        habits.map(h => (
                            <div key={h.id} className={styles.habitCard}>
                                <h4>{h.title}</h4>
                                <div className={styles.counter}>
                                    <button type='button' className={styles.minus} onClick={() => updateStreak(h.id, -1)}>-</button>
                                    <span className={styles.streak}>{h.streak}</span>
                                    <button type='button' className={styles.plus} onClick={() => updateStreak(h.id, 1)}>+</button>
                                </div>
                                <p>COMBO STREAK</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </section>
    );
};