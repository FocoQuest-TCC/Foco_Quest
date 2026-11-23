import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles/home.module.css';
import ROXA from '../assets/LOGO-roxa.png';
import { Crono } from './Cronograma';
import { Quests } from './Quests';
import { Kanban } from './Kanban';
import { Pomodoro, type PomodoroStatus } from './Pomodoro';
import { Guilda } from './Guilda';
import { Config } from './Config';
import { Inv } from './Inv';
import { usePersistentState } from '../config/UsePersistentState';
import { API_URL, authHeaders, getAuthToken, getStoredUser, authenticatedFetch } from '../config/api';
import { getCharacterImage, type CharacterId } from '../config/characters';
import { formatCompactNumber, getLevelProgress } from '../config/experience';
import { CharacterSelection } from '../components/CharacterSelection';
import { DEFAULT_POMODORO_DURATIONS, isPomodoroDurations, type PomodoroDurations,} from '../config/pomodoro';

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
type SyncMode = 'loading' | 'ready' | 'offline';

const MENU_ITEMS: MenuKey[] = [
  'Cronograma',
  'Quests',
  'Kanban',
  'Pomodoro',
  'Guilda',
  'Inventário',
  'Configurações',
];

export function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('Cronograma');
  const [user, setUser] = useState(getStoredUser);
  const userId = user?.UserID;
  const levelProgress = getLevelProgress(user?.experience);
  const levelProgressPercent = levelProgress.experienceForNextLevel ? (levelProgress.experienceInLevel / levelProgress.experienceForNextLevel) * 100 : 0;
  const storageKey = userId ? `@focoquest:${userId}` : '@focoquest:guest';
  const [syncState, setSyncState] = useState<{
    userId: number | null,
    mode: SyncMode,
  }>({
    userId: userId ?? null,
    mode: 'loading',
  });

  const [syncError, setSyncError] = useState('');
  const lastSavedSnapshotRef = useRef('');
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingKey = `${storageKey}:sync_pending`;
  const [tasks, setTasks] = usePersistentState<ITarefa[]>(`${storageKey}:tarefas`, []);
  const [habits, setHabits] = usePersistentState<IHabito[]>(`${storageKey}:habitos`, []);
  const [boards, setBoards] = usePersistentState<IKanbanBoard[]>(`${storageKey}:kanban_boards`, []);
  const [kanbanTasks, setKanbanTasks] = usePersistentState<IKanbanTask[]>(`${storageKey}:kanban_tasks`, []);
  const [inventory, setInventory] = usePersistentState<IInventoryItem[]>(`${storageKey}:inventory`, defaultInventory);
  const [gold, setGold] = usePersistentState<number>(`${storageKey}:gold`, 0);
  const [gems, setGems] = usePersistentState<number>(`${storageKey}:gems`, 0);
  const [pomodoroDurations, setPomodoroDurations] = usePersistentState<PomodoroDurations>(`${storageKey}:pomodoro_durations`, DEFAULT_POMODORO_DURATIONS,);
  const appDataSnapshot = JSON.stringify({
    tasks,
    habits,
    boards,
    kanbanTasks,
    inventory,
    gold,
    gems,
    pomodoroDurations,
  });

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
    setPomodoroStatus(current => (current.time === status.time && current.phase === status.phase && current.isRunning === status.isRunning ? current : status));
  }, []);
  
  const savePomodoroDurations = useCallback(async (durations: PomodoroDurations) => {
      if (!isPomodoroDurations(durations)) {
        throw new Error('As durações informadas são inválidas.');
      }

      if (!userId || !getAuthToken() || syncState.userId !== userId || syncState.mode !== 'ready') {
        setPomodoroDurations(durations);
        return 'device' as const;
      }

      const patchRequest = saveQueueRef.current.catch(() => undefined).then(async () => {
          if (getStoredUser()?.UserID !== userId) {
            throw new Error('A sessão foi alterada.');
          }

          const response = await fetch(
            `${API_URL}/users/${userId}/data`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
              },
              body: JSON.stringify({
                data: {
                  pomodoroDurations: durations,
                },
              }),
            }
          );

          if (!response.ok) {
            const result = await response.json().catch(() => ({}));

            throw new Error(typeof result?.message === 'string' ? result.message : 'Não foi possível salvar os tempos.');
          }
        });

      saveQueueRef.current = patchRequest.catch(() => undefined);

      await patchRequest;

      setPomodoroDurations(durations);

      return 'database' as const;
    }, [userId, syncState, setPomodoroDurations]
  );

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
    const currentUserId = userId ?? null;

    if (!userId || !getAuthToken()) {
      setSyncState({
        userId: currentUserId,
        mode: 'offline',
      });

      setSyncError('Sessão indisponível.');
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const localData: UserAppData = {
      tasks,
      habits,
      boards,
      kanbanTasks,
      inventory,
      gold,
      gems,
      pomodoroDurations,
    };

    setSyncState({
      userId,
      mode: 'loading',
    });

    setSyncError('');

    const loadData = async () => {
      try {
        const response = await authenticatedFetch(
          `${API_URL}/users/${userId}/data`,
          {
            headers: authHeaders(),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP ${response.status}`);
        }

        const result: unknown = await response.json();

        if (!result || typeof result !== 'object' || !('data' in result) || !result.data || typeof result.data !== 'object' || Array.isArray(result.data)) {
          throw new Error('O servidor retornou dados inválidos.');
        }

        if (cancelled) return;

        localStorage.removeItem(pendingKey);

        const remote = result.data as Partial<UserAppData>;

        const merged: UserAppData = {
          tasks: Array.isArray(remote.tasks) ? remote.tasks : localData.tasks,
          habits: Array.isArray(remote.habits) ? remote.habits : localData.habits,
          boards: Array.isArray(remote.boards) ? remote.boards : localData.boards,
          kanbanTasks: Array.isArray(remote.kanbanTasks) ? remote.kanbanTasks : localData.kanbanTasks,
          inventory: Array.isArray(remote.inventory) ? remote.inventory : localData.inventory,
          gold: typeof remote.gold === 'number' && Number.isFinite(remote.gold) ? remote.gold : localData.gold,
          gems: typeof remote.gems === 'number' && Number.isFinite(remote.gems) ? remote.gems : localData.gems,
          pomodoroDurations: isPomodoroDurations(remote.pomodoroDurations) ? remote.pomodoroDurations : localData.pomodoroDurations,
        };

        lastSavedSnapshotRef.current = JSON.stringify(merged);

        setTasks(merged.tasks);
        setHabits(merged.habits);
        setBoards(merged.boards);
        setKanbanTasks(merged.kanbanTasks);
        setInventory(merged.inventory);
        setGold(merged.gold);
        setGems(merged.gems);

        if (merged.pomodoroDurations) {
          setPomodoroDurations(merged.pomodoroDurations);
        }

        setSyncState({
          userId,
          mode: 'ready',
        });
      } catch (error) {
        if (cancelled) return;

        try {
          if (!localStorage.getItem(pendingKey)) {
            localStorage.setItem(pendingKey, JSON.stringify(localData));
          }
        } catch {

        }

        setSyncState({
          userId,
          mode: 'offline',
        });

        setSyncError('Não foi possível carregar os dados do servidor. O FocoQuest está usando a cópia disponível neste dispositivo.');

        console.error('Erro ao carregar dados:', error);
      }
    };

  void loadData();

  return () => {
    cancelled = true;
    controller.abort();
  };

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
    if (!userId || syncState.userId !== userId || syncState.mode !== 'ready' || !getAuthToken()) {
      return;
    }

    if (appDataSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    try {
      localStorage.setItem(pendingKey, appDataSnapshot);
    } catch {
      setSyncError('Não foi possível proteger as alterações no armazenamento local.');
      return;
    }

    const timeout = window.setTimeout(() => {
      const snapshotToSave = appDataSnapshot;

      const request = saveQueueRef.current.catch(() => undefined).then(async () => {
          if (getStoredUser()?.UserID !== userId) {
            return;
          }

          const response = await authenticatedFetch(`${API_URL}/users/${userId}/data`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
              },
              body: JSON.stringify({
                data: JSON.parse(snapshotToSave),
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
          }

          lastSavedSnapshotRef.current = snapshotToSave;

          if (localStorage.getItem(pendingKey) ===snapshotToSave) {
            localStorage.removeItem(pendingKey);
          }

          if (getStoredUser()?.UserID === userId) {
            setSyncError('');
            setSyncState({
              userId,
              mode: 'ready',
            });
          }
        });

      saveQueueRef.current = request.catch(error => {
          if (getStoredUser()?.UserID !== userId) {
            return;
          }

          console.error('Erro ao sincronizar dados:', error);

          setSyncState({
            userId,
            mode: 'offline',
          });

          setSyncError('As alterações não foram confirmadas pelo servidor. A cópia local foi preservada.');
        }
      );
    }, 650);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    userId,
    syncState,
    appDataSnapshot,
    pendingKey,
  ]);

  if (userId && (syncState.userId !== userId || syncState.mode === 'loading')) {
    return (
      <main className={styles.home}>
        <div className={styles.loadingData} role="status">CARREGANDO SUA AVENTURA...</div>
      </main>
    );
  }

  if (user && !user.characterId && getAuthToken()) {
    return (
      <main className={styles.home}>
        <CharacterSelection disabled={isSavingCharacter} error={characterError} onSelect={characterId => void selectCharacter(characterId)}/>
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
  };

  return (
    <main className={styles.home}>
      {syncError && (
        <p
          role='alert'
          style={{
            padding: '12px 20px',
            color: 'var(--text-light)',
            background: 'var(--red)',
          }}
        >
          {syncError}
        </p>
      )}
      <header className={styles.navbar}>
        <button type="button" className={styles.logoBtn} onClick={() => setActiveMenu('Cronograma')} aria-label='Ir para o Cronograma'>
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
            {MENU_ITEMS.map(menu => {
              const isActive = activeMenu === menu;

              return (
                <button
                  key={menu}
                  type='button'
                  className={isActive ? styles.activeMenuBtn : ''}
                  onClick={() => setActiveMenu(menu)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {menu}
                </button>
              );
            })}
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