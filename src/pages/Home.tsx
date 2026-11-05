import { useCallback, useEffect, useState } from 'react';
import styles from './styles/home.module.css';
import ROXA from '../assets/LOGO-roxa.png';
import { useNavigate } from 'react-router-dom';
import { Crono } from './Cronograma';
import { Quests } from './Quests';
import { Kanban } from './Kanban';
import { Pomodoro, type PomodoroStatus } from './Pomodoro';
import { Guilda } from './Guilda';
import { Config } from './Config';
import { Inv } from './Inv';
import { usePersistentState } from '../config/UsePersistentState';
import { API_URL, authHeaders, getAuthToken, getStoredUser } from '../config/api';
import { getCharacterImage, type CharacterId } from '../config/characters';
import { formatCompactNumber, getLevelProgress } from '../config/experience';
import { CharacterSelection } from '../components/CharacterSelection';
import {
  DEFAULT_POMODORO_DURATIONS,
  isPomodoroDurations,
  type PomodoroDurations,
} from '../config/pomodoro';

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
  pomodoroDurations?: PomodoroDurations;
}

const defaultInventory: IInventoryItem[] = [
  { id: 1, name: 'ESPADA DE CRISTAL', type: 'ARMA', img: '⚔️' },
  { id: 2, name: 'POÇÃO DE MANA', type: 'CONSUMÍVEL', img: '🧪' },
  { id: 3, name: 'ESCUDO DE FERRO', type: 'DEFESA', img: '🛡️' },
  { id: 4, name: 'CAJADO ARCANO', type: 'MÁGICO', img: '🪄' },
];

// todas as 'interface' são conteúdo para as outras páginas por isso o 'export'

type MenuKey = 'Cronograma' | 'Quests' | 'Kanban' | 'Pomodoro' | 'Guilda' | 'Configurações' | 'Inventário';

export function Home() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('Cronograma');
  const [user, setUser] = useState(getStoredUser);
  const userId = user?.UserID;
  const levelProgress = getLevelProgress(user?.experience);
  const levelProgressPercent = levelProgress.experienceForNextLevel
    ? (levelProgress.experienceInLevel / levelProgress.experienceForNextLevel) * 100
    : 0;
  const storageKey = userId ? `@focoquest:${userId}` : '@focoquest:guest';
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = usePersistentState<ITarefa[]>(`${storageKey}:tarefas`, []);
  const [habits, setHabits] = usePersistentState<IHabito[]>(`${storageKey}:habitos`, []);
  const [boards, setBoards] = usePersistentState<IKanbanBoard[]>(`${storageKey}:kanban_boards`, []);
  const [kanbanTasks, setKanbanTasks] = usePersistentState<IKanbanTask[]>(`${storageKey}:kanban_tasks`, []);
  const [inventory, setInventory] = usePersistentState<IInventoryItem[]>(`${storageKey}:inventory`, defaultInventory);
  const [gold, setGold] = usePersistentState<number>(`${storageKey}:gold`, 0);
  const [gems, setGems] = usePersistentState<number>(`${storageKey}:gems`, 0);
  const [pomodoroDurations, setPomodoroDurations] = usePersistentState<PomodoroDurations>(
    `${storageKey}:pomodoro_durations`,
    DEFAULT_POMODORO_DURATIONS,
  );
  const [characterError, setCharacterError] = useState('');
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);
  const [pomodoroStatus, setPomodoroStatus] = useState<PomodoroStatus>({
    time: '25:00',
    phase: 'Foco',
    isRunning: false,
  });
  const updateUserExperience = useCallback((experience: number) => {
    const storedUser = getStoredUser();
    if (!storedUser) return;
    const updatedUser = { ...storedUser, experience };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);
  const updatePomodoroStatus = useCallback((status: PomodoroStatus) => {
    setPomodoroStatus(current => (
      current.time === status.time
        && current.phase === status.phase
        && current.isRunning === status.isRunning
        ? current
        : status
    ));
  }, []);
  const savePomodoroDurations = useCallback(async (durations: PomodoroDurations) => {
    if (!userId || !getAuthToken()) {
      setPomodoroDurations(durations);
      return 'device' as const;
    }

    const response = await fetch(`${API_URL}/users/${userId}/data`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ data: { pomodoroDurations: durations } }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message ?? 'Não foi possível salvar os tempos no banco de dados.');
    }

    setPomodoroDurations(durations);
    return 'database' as const;
  }, [userId, setPomodoroDurations]);

  const selectCharacter = async (characterId: CharacterId) => {
    if (!user?.UserID) {
      setCharacterError('Entre novamente para salvar seu personagem.');
      return;
    }

    setCharacterError('');
    setIsSavingCharacter(true);
    try {
      const response = await fetch(`${API_URL}/users/${user.UserID}/character`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ characterId }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? 'Não foi possível salvar seu personagem.');
      }

      const updatedUser = { ...user, characterId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (selectionError) {
      setCharacterError(selectionError instanceof Error ? selectionError.message : 'Erro ao salvar o personagem.');
    } finally {
      setIsSavingCharacter(false);
    }
  };

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
        if (isPomodoroDurations(data.pomodoroDurations)) {
          setPomodoroDurations(data.pomodoroDurations);
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId || !getAuthToken()) return;
    let cancelled = false;
    fetch(`${API_URL}/users/${userId}`, { headers: authHeaders() })
      .then(response => response.ok
        ? response.json() as Promise<Array<{ experience?: number; characterId?: CharacterId | null }>>
        : Promise.reject(new Error('Não foi possível carregar o perfil do usuário.')))
      .then(users => {
        const latestUser = users[0];
        if (cancelled || !latestUser || typeof latestUser.experience !== 'number') return;
        const storedUser = getStoredUser();
        if (!storedUser) return;
        const updatedUser = {
          ...storedUser,
          experience: latestUser.experience,
          characterId: latestUser.characterId ?? storedUser.characterId,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      })
      .catch(profileError => {
        console.error('Erro ao atualizar o perfil do usuário:', profileError);
      });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isLoaded || !getAuthToken()) return;
    fetch(`${API_URL}/users/${userId}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        data: { tasks, habits, boards, kanbanTasks, inventory, gold, gems, pomodoroDurations },
      }),
    }).catch(() => undefined);
  }, [userId, isLoaded, tasks, habits, boards, kanbanTasks, inventory, gold, gems, pomodoroDurations]);

  if (user && !user.characterId && getAuthToken()) {
    return (
      <main className={styles.home}>
        <CharacterSelection
          disabled={isSavingCharacter}
          error={characterError}
          onSelect={characterId => void selectCharacter(characterId)}
        />
      </main>
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'Cronograma': return <Crono tasks={tasks} habits={habits} kanbanTasks={kanbanTasks} />;
      case 'Quests': return <Quests tasks={tasks} setTasks={setTasks} habits={habits} setHabits={setHabits} />;
      case 'Kanban': return <Kanban boards={boards} setBoards={setBoards} tasks={kanbanTasks} setTasks={setKanbanTasks} />;
      case 'Pomodoro': return null;
      case 'Guilda': return <Guilda onExperienceUpdated={updateUserExperience} />;
      case 'Configurações': return <Config onUserUpdated={name => setUser(current => current ? { ...current, name } : current)}/>;
      case 'Inventário': return <Inv items={inventory} />;
      default: return <Crono tasks={tasks} habits={habits} kanbanTasks={kanbanTasks} />;
    }
  }; // mapa de navegação

  return (
    <main className={styles.home}>
      <header className={styles.navbar}>
        <button type="button" className={styles.logoBtn} onClick={() => navigate('/')}>
          <img src={ROXA} className={styles.logo} alt='Logo do FocoQuest'/>
        </button>
        <nav className={styles.navLinks}>
          <span className={styles.pomTimer} aria-label={`Pomodoro: ${pomodoroStatus.time}, ${pomodoroStatus.phase}${pomodoroStatus.isRunning ? '' : ', pausado'}`}>
            {pomodoroStatus.time} · {pomodoroStatus.phase}{pomodoroStatus.isRunning ? '' : ' (pausado)'}
          </span>
          <span className={styles.userTag}>{user?.name ?? 'HERÓI'}</span>
        </nav>
      </header>
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {getCharacterImage(user?.characterId) && (
                <img
                  src={getCharacterImage(user?.characterId)}
                  alt={`${user?.name ?? 'Personagem'} escolhido`}
                />
              )}
            </div>
            <div className={styles.profileInfo}>
              <p>Nível {levelProgress.level}</p>
              <span>{user?.name ?? 'HERÓI'}</span>
              <div className={styles.xpProgress}>
                <div
                  className={styles.xpTrack}
                  role="progressbar"
                  aria-label="Progresso de experiência para o próximo nível"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(1, levelProgress.experienceForNextLevel)}
                  aria-valuenow={levelProgress.experienceInLevel}
                >
                  <span style={{ width: `${levelProgressPercent}%` }} />
                </div>
                <small>
                  {formatCompactNumber(levelProgress.experienceInLevel)}
                  {' / '}
                  {formatCompactNumber(levelProgress.experienceForNextLevel)} XP · total
                  {' '}
                  {formatCompactNumber(levelProgress.experience)}
                  {' · faltam '}
                  {formatCompactNumber(levelProgress.experienceToNextLevel)}
                </small>
              </div>
            </div>
          </div>
          <div className={styles.stats}>
            <span className={styles.gold}>Gold:{formatCompactNumber(gold)}</span>
            <span className={styles.gems}>Gems:{formatCompactNumber(gems)}</span>
          </div>
          <nav className={styles.menuItems}>
            <button className={activeMenu === 'Cronograma' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Cronograma')}>Cronograma</button>
            <button className={activeMenu === 'Quests' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Quests')}>Quests</button>
            <button className={activeMenu === 'Kanban' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Kanban')}>Kanban</button>
            <button className={activeMenu === 'Pomodoro' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Pomodoro')}>Pomodoro</button>
            <button className={activeMenu === 'Guilda' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Guilda')}>Guilda</button>
            <button className={activeMenu === 'Inventário' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Inventário')}>Inventário</button>
            <button className={activeMenu === 'Configurações' ? styles.activeMenuBtn : ''} onClick={() => setActiveMenu('Configurações')}>Configurações</button>
          </nav>
        </aside>
        <section className={styles.contentContainer}>
          <div className={styles.innerWrapper}>
            {renderContent()}
            <div hidden={activeMenu !== 'Pomodoro'}>
              <Pomodoro
                key={`${pomodoroDurations.focus}-${pomodoroDurations.shortBreak}-${pomodoroDurations.longBreak}`}
                tasks={tasks}
                setTasks={setTasks}
                kanbanTasks={kanbanTasks}
                setKanbanTasks={setKanbanTasks}
                durations={pomodoroDurations}
                onSaveDurations={savePomodoroDurations}
                onTimerUpdate={updatePomodoroStatus}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}