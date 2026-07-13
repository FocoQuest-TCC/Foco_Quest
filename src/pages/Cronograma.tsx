import type { ITarefa, IHabito, IKanbanTask } from './Home';
import styles from './styles/Crono.module.css';
import { toISODate, formatDateBR, timeToMinutes } from '../config/DateUtils';

interface CronogramaProps {
    tasks: ITarefa[];
    habits: IHabito[];
    kanbanTasks: IKanbanTask[];
}

type ScheduleColor = 'task' | 'habit' | 'kanban';

interface ScheduleItem {
    key: string;
    label: string;
    text: string;
    color: ScheduleColor;
    completed?: boolean;
    sortMinutes?: number | null;
    sortDate?: string;
}

function sortBySortMinutes(a: ScheduleItem, b: ScheduleItem): number {
  if(a.sortMinutes == null && b.sortMinutes == null) return 0;
  if(a.sortMinutes == null) return 1;
  if(b.sortMinutes == null) return -1;
  return a.sortMinutes - b.sortMinutes;
}
 
function sortBySortDate(a: ScheduleItem, b: ScheduleItem): number {
  return (a.sortDate ?? '9999-99-99').localeCompare(b.sortDate ?? '9999-99-99');
}
 
function buildDayColumn(
  tasks: ITarefa[],
  kanbanTasks: IKanbanTask[],
  habits: IHabito[],
  dayISO: string,
  todayISO: string,
  nowMinutes: number
):ScheduleItem[]{
  const taskItems: ScheduleItem[] = tasks.filter(t => (t.date ?? todayISO) === dayISO).map(t => {
    const minutes = timeToMinutes(t.time);
    const isNow = dayISO === todayISO && minutes !== null && Math.abs(nowMinutes - minutes) <= 30;
    return{
      key: `task-${t.id}`,
      label: isNow ? 'AGORA' : (t.time ?? 'SEM HORÁRIO'),
      text: t.text,
      color: 'task' as ScheduleColor,
      completed: t.completed,
      sortMinutes: minutes,
    };
  });
 
  const kanbanItems: ScheduleItem[] = kanbanTasks.filter(k => k.column !== 'done' && k.date === dayISO).map(k => ({
      key: `kanban-${k.id}`,
      label: k.column === 'doing' ? 'FOCO' : 'A FAZER',
      text: k.text,
      color: 'kanban' as ScheduleColor,
      sortMinutes: null,
  }));
 
  const habitItems: ScheduleItem[] = habits.map(h => ({
      key: `habit-${h.id}-${dayISO}`,
      label: 'DIÁRIO',
      text: h.title,
      color: 'habit' as ScheduleColor,
      sortMinutes: null,
  }));
 
  return [...taskItems, ...kanbanItems, ...habitItems].sort(sortBySortMinutes);
}
 
function buildUpcoming(
  tasks: ITarefa[],
  kanbanTasks: IKanbanTask[],
  todayISO: string,
  tomorrowISO: string,
): ScheduleItem[]{
  const taskItems: ScheduleItem[] = tasks.filter(t => (t.date ?? todayISO) > tomorrowISO).map(t => ({
      key: `task-${t.id}`,
      label: t.date ? formatDateBR(t.date): '',
      text: t.text,
      color: 'task' as ScheduleColor,
      completed: t.completed,
      sortDate: t.date,
  }));
 
  const kanbanItems: ScheduleItem[] = kanbanTasks.filter(k => k.column !== 'done' && (!k.date || k.date > tomorrowISO)).map(k => ({
      key: `kanban-${k.id}`,
      label: k.date ? formatDateBR(k.date) : (k.column === 'doing' ? 'FOCO' : 'A FAZER'),
      text: k.text,
      color: 'kanban' as ScheduleColor,
      sortDate: k.date,
  }));
 
  return [...taskItems, ...kanbanItems].sort(sortBySortDate);
}
 
function ScheduleColumn({
  title,
  items,
  emptyText,
  starred,
}:{
  title: string;
  items: ScheduleItem[];
  emptyText: string;
  starred?: boolean;
}){
  return(
    <div className={styles.scheduleColumn}>
      <h3 className={styles.scheduleColumnTitle}>{title}</h3>
      <div className={styles.scheduleList}>
        {items.length === 0 ?(
          <span className={styles.emptyItem}>{emptyText}</span>
        ):(
          items.map(item =>(
            <div key={item.key} className={`${styles.scheduleItem} ${styles[`accent-${item.color}`]} ${item.completed ? styles.completedItem : ''}`}>
              {starred && <span className={styles.starIcon}>★</span>}
              <div className={styles.scheduleItemBody}>
                <span className={styles.scheduleItemLabel}>{item.label}</span>
                <p>{item.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function Crono({ tasks, habits, kanbanTasks }: CronogramaProps) {
  const now = new Date();
  const todayISO = toISODate(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = toISODate(tomorrow);
  const nowMinutes =now.getHours() * 60 + now.getMinutes();
 
  const totalDiarias = tasks.length;
  const concluidasDiarias = tasks.filter(t => t.completed).length;
  const totalKanban = kanbanTasks.length;
  const concluidasKanban = kanbanTasks.filter(t => t.column === 'done').length;
 
  const hojeItems = buildDayColumn(tasks, kanbanTasks, habits, todayISO, todayISO, nowMinutes);
  const amanhaItems = buildDayColumn(tasks, kanbanTasks, habits, tomorrowISO, todayISO, nowMinutes);
  const emBreveItems = buildUpcoming(tasks, kanbanTasks, todayISO, tomorrowISO);
 
    return (
      <section className={styles.cronogramaContainer} aria-labelledby="cronogramaTitle">
        <h2 id="cronogramaTitle" className={styles.cronogramaTitle}>CRONOGRAMA</h2>
 
       <div className={styles.summaryWidgets}>
         <div className={styles.widgetBox}>
           <h4>MISSÕES DIÁRIAS</h4>
           <p>{concluidasDiarias} / {totalDiarias} Concluídas</p>
         </div>
         <div className={styles.widgetBox}>
           <h4>HÁBITOS ATIVOS</h4>
           <p>{habits.length} Em Foco</p>
         </div>
         <div className={styles.widgetBox}>
           <h4>QUESTS NO KANBAN</h4>
           <p>{concluidasKanban} / {totalKanban} Finalizadas</p>
         </div>
       </div>
 
       <div className={styles.scheduleGrid}>
          <ScheduleColumn title='HOJE' items={hojeItems} emptyText='Nada agendado para hoje.'/>
          <ScheduleColumn title='AMANHÃ' items={amanhaItems} emptyText='Nada agendado para amanhã.'/>
          <ScheduleColumn title='EM BREVE' items={emBreveItems} emptyText='Nenhum evento futuro agendado.' starred/>
       </div>
     </section>
   );
};