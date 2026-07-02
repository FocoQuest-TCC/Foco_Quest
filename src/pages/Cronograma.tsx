// import { ITarefa, IHabito, IKanbanTask } from './Home';
// import styles from './styles/Cronograma.module.css';

// interface CronogramaProps {
//   tasks: ITarefa[];
//   habits: IHabito[];
//   kanbanTasks: IKanbanTask[];
// }

// export function Foco({ tasks, habits, kanbanTasks }: CronogramaProps) {
//   const totalDiarias = tasks.length;
//   const concluidasDiarias = tasks.filter(t => t.completed).length;
//   const totalKanban = kanbanTasks.length;
//   const concluidasKanban = kanbanTasks.filter(t => t.column === 'done').length;

//   return (
//     <div className={styles.cronogramaContainer}>
//       <h2 className={styles.cronogramaTitle}>CRONOGRAMA GERAL</h2>
      
//       {/* Indicadores de Progresso */}
//       <div className={styles.summaryWidgets}>
//         <div className={styles.widgetBox}>
//           <h4>MISSÕES DIÁRIAS</h4>
//           <p>{concluidasDiarias} / {totalDiarias} Concluídas</p>
//         </div>
//         <div className={styles.widgetBox}>
//           <h4>HÁBITOS ATIVOS</h4>
//           <p>{habits.length} Em Foco</p>
//         </div>
//         <div className={styles.widgetBox}>
//           <h4>QUESTS NO KANBAN</h4>
//           <p>{concluidasKanban} / {totalKanban} Finalizadas</p>
//         </div>
//       </div>

//       {/* Grelha de Listagens Consolidadas */}
//       <div className={styles.cronogramaGrid}>
        
//         {/* Bloco de Tarefas Diárias */}
//         <div className={styles.cronogramaBlock}>
//           <h3>📋 Checklist Diário</h3>
//           <div className={styles.previewList}>
//             {tasks.length === 0 ? (
//               <span className={styles.emptyItem}>Nenhuma missão ativa para hoje.</span>
//             ) : (
//               tasks.map(t => (
//                 <div key={t.id} className={`${styles.previewItem} ${t.completed ? styles.lineThrough : ''}`}>
//                   <span className={styles.bullet}>{t.completed ? '✔' : '⏳'}</span>
//                   <p>{t.text}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Bloco de Hábitos */}
//         <div className={styles.cronogramaBlock}>
//           <h3>🔥 Combos de Hábitos</h3>
//           <div className={styles.previewList}>
//             {habits.length === 0 ? (
//               <span className={styles.emptyItem}>Nenhum hábito rastreado.</span>
//             ) : (
//               habits.map(h => (
//                 <div key={h.id} className={styles.previewItem}>
//                   <span className={styles.bullet}>⭐</span>
//                   <p>{h.title} <strong className={styles.streakCount}>({h.streak}d)</strong></p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Bloco de Objetivos Kanban */}
//         <div className={styles.cronogramaBlock}>
//           <h3>🎯 Objetivos em Andamento</h3>
//           <div className={styles.previewList}>
//             {kanbanTasks.filter(k => k.column !== 'done').length === 0 ? (
//               <span className={styles.emptyItem}>Nenhuma quest ativa no Kanban.</span>
//             ) : (
//               kanbanTasks.filter(k => k.column !== 'done').map(k => (
//                 <div key={k.id} className={styles.previewItem}>
//                   <span className={`${styles.badge} ${k.column === 'doing' ? styles.badgeDoing : styles.badgeTodo}`}>
//                     {k.column === 'doing' ? 'FOCO' : 'A FAZER'}
//                   </span>
//                   <p>{k.text}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }