import styles from './styles/Guilda.module.css';

export function Guilda() {
  return (
    <div className={styles.guildaContainer}>
      <h2 className={styles.sectionTitle}>Guilda</h2>
      
      <div className={styles.displayBox}>
        <div className={styles.mapFrame}>?</div>
        <div className={styles.statusGrid}>
          <div className={styles.statusRow}>
            <span>?</span>
            <div className={`${styles.statusLine} ${styles.lineRed}`} style={{width: '95%'}}>19/20</div>
          </div>
          <div className={styles.statusRow}>
            <span>?</span>
            <div className={`${styles.statusLine} ${styles.lineRed}`} style={{width: '71%'}}>10/14</div>
          </div>
          <div className={styles.statusRow}>
            <span>?</span>
            <div className={`${styles.statusLine} ${styles.lineRed}`} style={{width: '92%'}}>11/12</div>
          </div>
          <div className={styles.statusRow}>
            <span>?</span>
            <div className={`${styles.statusLine} ${styles.lineRed}`} style={{width: '100%'}}>28/28</div>
          </div>
        </div>
      </div>
    </div>
  );
}