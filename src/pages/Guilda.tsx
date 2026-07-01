import styles from './styles/Guilda.module.css';

export function Guilda() {
  const partyMenbers = [
    {id: 1, name:'RUAN', role: 'MAGO', hp: 85, xp: 40},
    {id: 2, name:'ISAAC', role: 'GUERREIRO', hp: 100, xp: 90},
    {id: 3, name:'ALEXANDRE', role: 'CLÉRICO', hp: 60, xp: 15},
    {id: 4, name:'JOÃO', role: 'SUPORTE', hp: 55, xp: 40}
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>GUILDA</h2>
      <div className={styles.battleFrame}>
        <div className={styles.bossContainer}>
          <span className={styles.bossIcon}>👹</span>
          <div className={styles.bossInfo}>
            <h3>BOSS DA PROCASTINAÇÃO</h3>
            <div className={styles.bossHpBar}>
              <div style={{width: '65%'}}/>
            </div>
            <span>HP: 650 / 1000</span>
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