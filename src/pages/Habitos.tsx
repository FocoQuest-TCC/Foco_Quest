import {useState, useEffect, type FormEvent} from 'react';
import styles from './styles/Habitos.module.css';

interface Habito{
    id: number;
    title: string;
    streak: number;
}

export function Habitos(){
    const [habits, setHabits] = useState<Habito[]>(()=>{
        try{
            const saved = localStorage.getItem('@focoquest:habitos');
            return saved ? JSON.parse(saved): [
                {id: 1, title: 'BEBER ÁGUA', streak: 0},
                {id: 2, title: 'ESTUDAR CODE', streak: 0}
            ];
        }catch{
            return[];
        } 
    });

    const [newHabit, setNewHabit] = useState('');

    useEffect(()=>{
        localStorage.setItem('@focoquest:habitos', JSON.stringify(habits));
    }, [habits]);

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
        <div className={styles.container}>
            <h2 className={styles.title}>HÁBITOS & COMBOS</h2>
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
        </div>
    );
};