import styles from './styles/inv.module.css';
import type { IInventoryItem } from './Home';

export function Inv({ items }: { items: IInventoryItem[] }){

    return(
        <section className={styles.container} aria-labelledby='inv-heading'>
            <h2 id='inv-heading' className={styles.title}>INVENTÁRIO DO HERÓI</h2>
            <article className={styles.containerB}>
                <div className={styles.contianerImg}>
                    <img className={styles.artImg} src="https://i.imgur.com/lYqXWJx.png"/>
                </div>
            </article>
            <div className={styles.grid}>
                {items.map(item =>(
                    <div key={item.id} className={styles.slot}>
                        <div className={styles.icon}>{item.img}</div>
                        <div className={styles.info}>
                            <strong>{item.name}</strong>
                            <span>{item.type}</span>
                        </div>
                    </div>                   
                ))}
                {Array.from({length: 8}).map((_,i) =>(
                    <div key={i} className={styles.emptySlot}>VAZIO</div>
                ))}
            </div>
        </section>
    );
};