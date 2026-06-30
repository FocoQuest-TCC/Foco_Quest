import styles from './styles/inv.module.css';

export function Inv(){
    const items = [
        {id: 1, name:'Espada de Cristal', type:'Arma', img:'⚔️'},
        {id: 2, name:'Poção de Mana', type:'Consumível', img:'🧪'},
        {id: 2, name:'Escudo de Ferro', type:'Defesa', img:'🛡️'},
        {id: 2, name:'Cajado Arcano', type:'Mágico', img:'🪄'},
    ];

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>Seu Inventário</h2>
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
                    <div key={i} className={styles.emptySlot}>?</div>
                ))}
            </div>
        </div>
    );
};