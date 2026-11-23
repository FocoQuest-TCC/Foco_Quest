import styles from './styles/inv.module.css';
import type { IInventoryItem } from './Home';
import Jonnhy from '../assets/Characters/Jonnhy.png';

interface InvProps {
  items: IInventoryItem[];
}

const MIN_SLOTS = 10;

export function Inv({ items }: InvProps) {

    const emptySlots = Math.max(0, MIN_SLOTS - items.length);

    return(
        <section className={styles.container} aria-labelledby='inv-heading'>
            <h2 id='inv-heading' className={styles.title}>INVENTÁRIO DO HERÓI</h2>
            <div className={styles.flex}>
                <article className={styles.containerB}>
                    <div className={styles.contianerImg}>
                        <img className={styles.artImg} src={Jonnhy} alt="Animação decorativa do inventário"/>
                    </div>
                </article>
                <div className={styles.grid} aria-label="Itens do inventário">
                    {items.map(item =>(
                        <div key={item.id} className={styles.slot} title={`${item.name} - ${item.type}`}>
                            <div className={styles.icon} aria-hidden="true">{item.img}</div>
                            <div className={styles.info}>
                                <strong>{item.name}</strong>
                                <span>{item.type}</span>
                            </div>
                        </div>                   
                    ))}
                    {Array.from({length: emptySlots}, (_, index) => (
                        <div key={`empty-${index}`} className={styles.emptySlot} aria-label="Espaço vazio">VAZIO</div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};