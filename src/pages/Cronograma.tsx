import { useEffect, useState } from 'react';
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

function sortByTime(a: ScheduleItem, b: ScheduleItem): number {
  if (a.sortMinutes == null && b.sortMinutes == null) return 0;
  if (a.sortMinutes == null) return 1;
  if (b.sortMinutes == null) return -1;
  return a.sortMinutes - b.sortMinutes;
}

function sortByDate(a: ScheduleItem, b: ScheduleItem): number {
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
  const taskItems: ScheduleItem[] = tasks.filter(task => (task.date ?? todayISO) === dayISO).map(task => {
    const minutes = timeToMinutes(task.time);
    const isNow = dayISO === todayISO && !task.completed && minutes !== null && Math.abs(nowMinutes - minutes) <= 15;
    return{
      key: `task-${task.id}`,
      label: isNow ? 'AGORA' : (task.time ?? 'SEM HORÁRIO'),
      text: task.text,
      color: 'task',
      completed: task.completed,
      sortMinutes: minutes,
    };
  });

  const kanbanItems: ScheduleItem[] = kanbanTasks.filter(task => task.column !== 'done' && task.date === dayISO).map(task => ({
      key: `kanban-${task.id}`,
      label: `${task.column === 'doing' ? 'FOCO' : 'A FAZER'}${task.time ? ` · ${task.time}` : ''}`,
      text: task.text,
      color: 'kanban',
      sortMinutes: timeToMinutes(task.time),
  }));

  const habitItems: ScheduleItem[] = habits.map(habit => ({
      key: `habit-${habit.id}-${dayISO}`,
      label: 'DIÁRIO',
      text: habit.title,
      color: 'habit',
      sortMinutes: null,
  }));

  return [...taskItems, ...kanbanItems, ...habitItems].sort(sortByTime);
}

function buildUpcoming(
  tasks: ITarefa[],
  kanbanTasks: IKanbanTask[],
  tomorrowISO: string,
): ScheduleItem[]{
  const taskItems: ScheduleItem[] = tasks.filter(task => Boolean(task.date && task.date > tomorrowISO)).map(task => ({
      key: `task-${task.id}`,
      label: task.date ? formatDateBR(task.date): 'SEM DATA',
      text: task.text,
      color: 'task',
      completed: task.completed,
      sortDate: task.date,
  }));

  const kanbanItems: ScheduleItem[] = kanbanTasks.filter(task => task.column !== 'done' && (!task.date || task.date > tomorrowISO)).map(task => ({
      key: `kanban-${task.id}`,
      label: task.date ? `${formatDateBR(task.date)}${task.time ? ` · ${task.time}` : ''}` : 'SEM DATA',
      text: task.text,
      color: 'kanban',
      sortDate: task.date,
  }));

  return [...taskItems, ...kanbanItems].sort(sortByDate);
}

function buildOverdue(
  tasks: ITarefa[],
  kanbanTasks: IKanbanTask[],
  todayISO: string
): ScheduleItem[] {
  const overdueTasks: ScheduleItem[] = tasks
    .filter(
      task =>
        !task.completed &&
        Boolean(task.date && task.date < todayISO)
    )
    .map(task => ({
      key: `overdue-task-${task.id}`,
      label: task.date
        ? `ATRASADA · ${formatDateBR(task.date)}`
        : 'ATRASADA',
      text: task.text,
      color: 'task',
      sortDate: task.date,
    }));

  const overdueKanban: ScheduleItem[] = kanbanTasks
    .filter(
      task =>
        task.column !== 'done' &&
        Boolean(task.date && task.date < todayISO)
    )
    .map(task => ({
      key: `overdue-kanban-${task.id}`,
      label: task.date
        ? `ATRASADA · ${formatDateBR(task.date)}`
        : 'ATRASADA',
      text: task.text,
      color: 'kanban',
      sortDate: task.date,
    }));

  return [...overdueTasks, ...overdueKanban].sort(
    sortByDate
  );
}

interface ScheduleColumnProps {
  title: string;
  items: ScheduleItem[];
  emptyText: string;
  starred?: boolean;
}

function ScheduleColumn({
  title,
  items,
  emptyText,
  starred = false,
}: ScheduleColumnProps){
  return (
    <div className={styles.scheduleColumn}>
      <div className={styles.scheduleSticky}>
        <h3 className={styles.scheduleColumnTitle}>{title}</h3>
      </div>

      <div className={styles.scheduleList}>
        {items.length === 0 ?(
          <span className={styles.emptyItem}>{emptyText}</span>
        ) : (
          items.map(item =>(
            <div key={item.key} className={[styles.scheduleItem, styles[`accent-${item.color}`], item.completed ? styles.completedItem : '',].join(' ')}>
              {starred && (<span className={styles.starIcon} aria-hidden='true'>★</span>)}
              <div className={styles.scheduleItemBody}>
                <span className={styles.scheduleItemLabel}>{item.label}</span>
                <p>{item.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Crono({ tasks, habits, kanbanTasks }: CronogramaProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateClock = () => {
      setNow(new Date());
    };

    const interval = window.setInterval(updateClock, 30_000);

    const handleVisibilityChange = () =>{
      if(!document.hidden){
        updateClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return() =>{
      window.clearInterval(interval);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const todayISO = toISODate(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowISO = toISODate(tomorrow);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const hojeItems = buildDayColumn(tasks, kanbanTasks, habits, todayISO, todayISO, nowMinutes);
  const amanhaItems = buildDayColumn(tasks, kanbanTasks, habits, tomorrowISO, todayISO, nowMinutes);
  const emBreveItems = buildUpcoming(tasks, kanbanTasks, tomorrowISO);
  const atrasadasItems = buildOverdue(tasks, kanbanTasks, todayISO);
  const tarefasDoProgresso = tasks.filter(task => !task.date || task.date <= todayISO);
  const kanbanDoProgresso = kanbanTasks.filter(task => Boolean(task.date && task.date <= todayISO));
  const totalTarefas = tarefasDoProgresso.length + kanbanDoProgresso.length;
  const tarefasConcluidas = tarefasDoProgresso.filter(task => task.completed).length + kanbanDoProgresso.filter(task => task.column === 'done').length;
  const tarefasAtrasadas = atrasadasItems.length;
  const progresso = totalTarefas === 0 ? 0 : Math.round((tarefasConcluidas / totalTarefas) * 100);

  return (
    <section className={styles.cronogramaContainer} aria-labelledby='cronogramaTitle'>
      <h2 id="cronogramaTitle" className={styles.cronogramaTitle}>CRONOGRAMA</h2>

      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <h3>PROGRESSO DAS MISSÕES</h3>

          <span className={styles.progressPercent}>
            {progresso}%
          </span>
        </div>

        <div className={styles.progressTrack} role="progressbar" aria-label="Conclusão das missões até hoje" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progresso}>
          <div className={`${styles.progressFill} ${progresso === 100 && totalTarefas > 0 ? styles.progressComplete : ''}`} style={{ width: `${progresso}%` }} />
        </div>
          
        <div className={styles.progressFooter}>
          <span>
            {totalTarefas === 0 ? 'Nenhuma missão prevista até hoje' : `${tarefasConcluidas} de ${totalTarefas} missões concluídas`}
          </span>
            
          {tarefasAtrasadas > 0 && (
            <span className={styles.progressOverdue}>
              ⚠ {tarefasAtrasadas} {tarefasAtrasadas === 1 ? 'missão atrasada' : 'missões atrasadas'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.scheduleGrid}>
        <ScheduleColumn title='HOJE' items={hojeItems} emptyText='Nada agendado para hoje.'/>
        <ScheduleColumn title='AMANHÃ' items={amanhaItems} emptyText='Nada agendado para amanhã.'/>
        <ScheduleColumn title='EM BREVE' items={emBreveItems} emptyText='Nenhum evento futuro agendado.' starred/>
      </div>
      {atrasadasItems.length > 0 && (
        <div className={styles.overdueGrid}>
          <ScheduleColumn title='MISSÕES ATRASADAS' items={atrasadasItems} emptyText='Nenhuma missão atrasada.'/>
        </div>
      )}
    </section>
  );
};