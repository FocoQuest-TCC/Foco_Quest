import {useState, useEffect} from 'react';
import styles from './styles/Habitos.module.css';

interface Habito{
    id: number;
    title: string;
    streak: number;
}

export function Habitos(){
    const [habits, setHabits] = useState<Habito[]>(()=>{
        const saved = localStorage.getItem('@focoquest:habitos');
        return saved ? JSON.parse(saved): [{id: 1, title: 'Beber Água', streak: 0}];
    });

    useEffect(()=>{
        localStorage.setItem('@focoquest:habitos', JSON.stringify(habits));
    }, [habits]);

    const updateStreak = (id: number, val: number) =>{
        setHabits(habits.map(h => h.id === id ? {...h, streak: Math.max(0, h.streak + val)}: h));
    };

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>Hábitos & Combos</h2>
            <div className={styles.grid}>
                {habits.map(h => (
                    <div  key={h.id} className={styles.card}>
                        <h3>{h.title}</h3>
                        <div className={styles.counter}>
                            <button onClick={()=> updateStreak(h.id, -1)} className={styles.minus}>-</button>
                            <span className={styles.streak}>{h.streak}</span>
                            <button onClick={()=> updateStreak(h.id, 1)} className={styles.plus}>+</button>
                        </div>
                        <p>Combo Atual</p>
                    </div>
                ))}
            </div>
        </div>
    );
};