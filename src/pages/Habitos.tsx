import {useState, type FormEvent} from 'react';
import type { IHabito } from './Home';
import styles from './styles/Habitos.module.css';

interface HabitosProps{
    habits: IHabito[];
    setHabits: React.Dispatch<React.SetStateAction<IHabito[]>>;
}

export function Habitos({ habits, setHabits } : HabitosProps){
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
        <section className={styles.container} aria-labelledby='habitos-heading'>
            <h2 id='habitos-heading' className={styles.title}>CRIADOR DE HÁBITOS</h2>
            <form onSubmit={addHabit} className={styles.createForm}>
                <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder='Novo hábito...' required />
                <button type='submit'>+</button>
            </form>
            <div className={styles.grid}>
                {habits.map(h => (
                    <div  key={h.id} className={styles.card}>
                        <h3>{h.title}</h3>
                        <div className={styles.counter}>
                            <button onClick={()=> updateStreak(h.id, -1)} className={styles.minus}>-</button>
                            <span className={styles.streak}>{h.streak}</span>
                            <button onClick={()=> updateStreak(h.id, 1)} className={styles.plus}>+</button>
                        </div>
                        <p>COMBO STREAK</p>
                    </div>
                ))}
            </div>
        </section>
    );
};