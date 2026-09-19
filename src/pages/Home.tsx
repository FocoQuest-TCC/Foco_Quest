import { useEffect, useState } from 'react';
import styles from './styles/home.module.css';
import Branco from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom';
import { Crono } from './Cronograma';
import { Quests } from './Quests';
import { Kanban } from './Kanban';
import { Guilda } from './Guilda';
import { Config } from './Config';
import { Inv } from './Inv';
import { usePersistentState } from '../config/UsePersistentState';
import { API_URL, authHeaders, getAuthToken, getStoredUser } from '../config/api';

export interface ITarefa {
  id: number;
  text: string;
  completed: boolean;
  date?: string;
  time?: string;
}

export interface IHabito {
  id: number;
  title: string;
  streak: number;
}

export interface IKanbanBoard {
  id: number;
  name: string;
}

export interface IKanbanTask {
  id: number;
  boardId: number;
  text: string;
  column: 'todo' | 'doing' | 'done';
  date?: string;
  time?: string;
}

export interface IInventoryItem {
  id: number;
  name: string;
  type: string;
  img: string;
}

interface UserAppData {
  tasks: ITarefa[];
  habits: IHabito[];
  boards: IKanbanBoard[];
  kanbanTasks: IKanbanTask[];
  inventory: IInventoryItem[];
  gold: number;
  gems: number;
}

const defaultInventory: IInventoryItem[] = [
  { id: 1, name: 'ESPADA DE CRISTAL', type: 'ARMA', img: '⚔️' },
  { id: 2, name: 'POÇÃO DE MANA', type: 'CONSUMÍVEL', img: '🧪' },
  { id: 3, name: 'ESCUDO DE FERRO', type: 'DEFESA', img: '🛡️' },
  { id: 4, name: 'CAJADO ARCANO', type: 'MÁGICO', img: '🪄' },
];

// todas as 'interface' são conteúdo para as outras páginas por isso o 'export'

type MenuKey = 'Cronograma' | 'Quests' | 'Kanban' | 'Guilda' | 'Configurações' | 'Inventário';

export function Home() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('Cronograma');
  const user = getStoredUser();
  const userId = user?.UserID;
  const storageKey = userId ? `@focoquest:${userId}` : '@focoquest:guest';
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = usePersistentState<ITarefa[]>(`${storageKey}:tarefas`, []);
  const [habits, setHabits] = usePersistentState<IHabito[]>(`${storageKey}:habitos`, []);
  const [boards, setBoards] = usePersistentState<IKanbanBoard[]>(`${storageKey}:kanban_boards`, []);
  const [kanbanTasks, setKanbanTasks] = usePersistentState<IKanbanTask[]>(`${storageKey}:kanban_tasks`, []);
  const [inventory, setInventory] = usePersistentState<IInventoryItem[]>(`${storageKey}:inventory`, defaultInventory);
  const [gold, setGold] = usePersistentState<number>(`${storageKey}:gold`, 0);
  const [gems, setGems] = usePersistentState<number>(`${storageKey}:gems`, 0);

  useEffect(() => {
    if (!userId || !getAuthToken()) {
      setIsLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_URL}/users/${userId}/data`, { headers: authHeaders() })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Falha ao carregar dados')))
      .then(({ data }: { data: Partial<UserAppData> }) => {
        if (cancelled) return;
        if (data.tasks) setTasks(data.tasks);
        if (data.habits) setHabits(data.habits);
        if (data.boards) setBoards(data.boards);
        if (data.kanbanTasks) setKanbanTasks(data.kanbanTasks);
        if (data.inventory) setInventory(data.inventory);
        if (typeof data.gold === 'number') setGold(data.gold);
        if (typeof data.gems === 'number') setGems(data.gems);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isLoaded || !getAuthToken()) return;
    fetch(`${API_URL}/users/${userId}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ data: { tasks, habits, boards, kanbanTasks, inventory, gold, gems } }),
    }).catch(() => undefined);
  }, [userId, isLoaded, tasks, habits, boards, kanbanTasks, inventory, gold, gems]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'Cronograma': return <Crono tasks={tasks} habits={habits} kanbanTasks={kanbanTasks} />;
      case 'Quests': return <Quests tasks={tasks} setTasks={setTasks} habits={habits} setHabits={setHabits} />;
      case 'Kanban': return <Kanban boards={boards} setBoards={setBoards} tasks={kanbanTasks} setTasks={setKanbanTasks} />;
      case 'Guilda': return <Guilda />;
      case 'Configurações': return <Config />;
      case 'Inventário': return <Inv items={inventory} />;
      default: return <Crono tasks={tasks} habits={habits} kanbanTasks={kanbanTasks} />;
    }
  }; // mapa de navegação

  return (
    <main className={styles.home}>
      <h1 className="srOnly">FocoQuest - Painel do Herói</h1>
      <header className={styles.navbar}>
        <button type="button" className={styles.logoBtn} onClick={() => navigate('/')}>
          <img src={Branco} className={styles.logo}/>
        </button>
        <nav className={styles.navLinks}>
          <button type="button" onClick={() => setActiveMenu('Cronograma')} className={activeMenu === 'Cronograma' ? styles.active : ''}>Início</button>
          <button type="button" onClick={() => setActiveMenu('Kanban')} className={activeMenu === 'Kanban' ? styles.active : ''}>Kanban</button>
          <span className={styles.userTag}>{user?.name ?? 'HERÓI'}</span>
        </nav>
      </header>
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}><img className={styles.img} src="https://i.imgur.com/lYqXWJx.png"/></div>
            <div className={styles.profileInfo}>
              <p>Nível 1</p>
              <span>{user?.name ?? 'HERÓI'}</span>
            </div>
          </div>
          <div className={styles.stats}>
            <span className={styles.gold}>Gold: {gold}</span>
            <span className={styles.gems}>Gems: {gems}</span>
          </div>
          <nav className={styles.menuItems}>
            <button className={activeMenu === 'Cronograma' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Cronograma')}>Cronograma</button>
            <button className={activeMenu === 'Quests' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Quests')}>Quests</button>
            <button className={activeMenu === 'Kanban' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Kanban')}>Kanban</button>
            <button className={activeMenu === 'Guilda' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Guilda')}>Guilda</button>
            <button className={activeMenu === 'Inventário' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Inventário')}>Inventário</button>
            <button className={activeMenu === 'Configurações' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Configurações')}>Configurações</button>
          </nav>
        </aside>
        <section className={styles.contentContainer}>
          <div className={styles.innerWrapper}>{renderContent()}</div>
        </section>
      </div>
    </main>
  );
}