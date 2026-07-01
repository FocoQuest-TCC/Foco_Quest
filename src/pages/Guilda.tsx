import styles from './styles/Guilda.module.css';

export function Guilda() {
  const partyMenbers = [
    {id: 1, name:'???', role: 'MAGO', hp: 100, xp: 0},
    {id: 2, name:'???', role: 'GUERREIRO', hp: 100, xp: 0},
    {id: 3, name:'???', role: 'CLÉRICO', hp: 100, xp: 0},
    {id: 4, name:'???', role: 'SUPORTE', hp: 100, xp: 0}
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>GUILDA</h2>
      <div className={styles.battleFrame}>
        <div className={styles.bossContainer}>
          <span className={styles.bossIcon}>?</span>
          <div className={styles.bossInfo}>
            <h3>???</h3>
            <div className={styles.bossHpBar}>
              <div style={{width: '100%'}}/>
            </div>
            <span>HP: 1000 / 1000</span>
          </div>
        </div>
      </div>
      <div className={styles.partyContainer}>
        <h3>MEMBROS DA EQUIPE</h3>
        <div className={styles.partyGrid}>
          {partyMenbers.map(m =>(
            <div key={m.id} className={styles.memberCard}>
              <div className={styles.memberHeader}>
                <strong>{m.name}</strong>
                <span>{m.role}</span>
              </div>
              <div className={styles.barContainer}> 
                <div className={styles.barLabel}>HP</div>
                <div className={`${styles.bar} ${styles.hpBar}`}><div style={{width: `${m.hp}%`}}/></div>
              </div>
              <div className={styles.barContainer}> 
                <div className={styles.barLabel}>XP</div>
                <div className={`${styles.bar} ${styles.xpBar}`}><div style={{width: `${m.xp}%`}}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};