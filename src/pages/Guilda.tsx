import styles from './styles/Guilda.module.css';

export function Guilda() {
  return (
    <div className={styles.guildaContainer}>
      <h2 className={styles.sectionTitle}>Guilda</h2>
      
      <div className={styles.displayBox}>
        <div className={styles.mapFrame}>???</div>
        <div className={styles.statusGrid}>
          <div className={styles.statusRow}>
            <span>???</span>
            <div className={`${styles.statusLine} ${styles.lineRed} ${styles.blackbar}`}>??/??</div>
          </div>
          <div className={styles.statusRow}>
            <span>???</span>
            <div className={`${styles.statusLine} ${styles.lineRed} ${styles.blackbar}`}>??/??</div>
          </div>
          <div className={styles.statusRow}>
            <span>???</span>
            <div className={`${styles.statusLine} ${styles.lineRed} ${styles.blackbar}`}>??/??</div>
          </div>
          <div className={styles.statusRow}>
            <span>???</span>
            <div className={`${styles.statusLine} ${styles.lineRed} ${styles.blackbar}`}>??/??</div>
          </div>
        </div>
      </div>
    </div>
  );
}