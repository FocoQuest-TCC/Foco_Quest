import styles from './styles/inv.module.css';

export function Inv(){
    const items = [
        {id: 1, name:'ESPADA DE CRISTAL', type:'ARMA', img:'⚔️'},
        {id: 2, name:'POÇÃO DE MANA', type:'CONSUMÍVEL', img:'🧪'},
        {id: 2, name:'ESCUDO DE FERRO', type:'DEFESA', img:'🛡️'},
        {id: 2, name:'CAJADO ARCANO', type:'MÁGICO', img:'🪄'},
    ];

    return(
        <div className={styles.container}>
            <h2 className={styles.title}>INVENTÁRIO DO HERÓI</h2>
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
        </div>
    );
};