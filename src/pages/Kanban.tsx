import styles from './styles/Kanban.module.css';

export function Kanban() {
  return (
    <div className={styles.kanbanContainer}>
      <h2 className={styles.sectionTitle}>Kanban</h2>
      <div className={styles.tasksGrid}>
        <div className={styles.column}>
          <h3 className={styles.todoHeader}>A Fazer</h3>
          <div className={styles.cardList}>
            <div className={`${styles.taskCard} ${styles.tagRed}`}>Leitura</div>
            <div className={`${styles.taskCard} ${styles.tagRed}`}>Pipoca</div>
            <div className={`${styles.taskCard} ${styles.tagRed}`}>TCC - CDU</div>
            <div className={`${styles.taskCard} ${styles.tagRed}`}>Meditação</div>
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doingHeader}>Fazendo</h3>
          <div className={styles.cardList}>
            <div className={`${styles.taskCard} ${styles.tagGreen}`}>Fazer Commit</div>
            <div className={`${styles.taskCard} ${styles.tagGreen}`}>2L Água</div>
          </div>
        </div>
        <div className={styles.column}>
          <h3 className={styles.doneHeader}>Feito</h3>
          <div className={styles.cardList}>
            <div className={styles.taskCard}>N sei <span className={styles.closeIcon}>×</span></div>
            <div className={styles.taskCard}>Deve ser <span className={styles.closeIcon}>×</span></div>
            <div className={styles.taskCard}>Pse <span className={styles.closeIcon}>×</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}