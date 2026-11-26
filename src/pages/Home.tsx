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
import {
  characters,
  getCharacterImage,
  starterCharacterIds,
  unlockableCharacters,
  type CharacterId,
} from '../config/characters';
import { formatCompactNumber, getLevelProgress } from '../config/experience';
import { CharacterSelection } from '../components/CharacterSelection';
import { DEFAULT_POMODORO_DURATIONS, isPomodoroDurations, type PomodoroDurations,} from '../config/pomodoro';
import { addDaysToISO, differenceInDays, todayISO } from '../config/DateUtils';

export interface ITarefa {
  id: number;
  text: string;
  completed: boolean;
  date?: string;
  time?: string;
  rewardClaimed?: boolean;
  latePenaltyDays?: number;
}

export interface IHabito {
  id: number;
  title: string;
  streak: number;
  lastCompletedDate?: string;
}

export interface IKanbanBoard {
  id: number;
  name: string;
  rewardClaimed?: boolean;
}

export interface IKanbanTask {
  id: number;
  boardId: number;
  text: string;
  column: 'todo' | 'doing' | 'done';
  date?: string;
  time?: string;
  latePenaltyDays?: number;
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
  ownedCharacterIds: CharacterId[];
  maxLevelReached: number;
  gold: number;
  gems: number;
  pomodoroDurations?: PomodoroDurations;
  debugDaysOffset?: number;
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
  const [debugNotice, setDebugNotice] = useState('');
  const lastSavedSnapshotRef = useRef('');
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingKey = `${storageKey}:sync_pending`;
  const [tasks, setTasks] = usePersistentState<ITarefa[]>(`${storageKey}:tarefas`, []);
  const [habits, setHabits] = usePersistentState<IHabito[]>(`${storageKey}:habitos`, []);
  const [boards, setBoards] = usePersistentState<IKanbanBoard[]>(`${storageKey}:kanban_boards`, []);
  const [kanbanTasks, setKanbanTasks] = usePersistentState<IKanbanTask[]>(`${storageKey}:kanban_tasks`, []);
  const [inventory, setInventory] = usePersistentState<IInventoryItem[]>(`${storageKey}:inventory`, defaultInventory);
  const [ownedCharacterIds, setOwnedCharacterIds] = usePersistentState<CharacterId[]>(
    `${storageKey}:owned_characters`,
    starterCharacterIds,
  );
  const [maxLevelReached, setMaxLevelReached] = usePersistentState<number>(`${storageKey}:max_level_reached`, 1);
  const [gold, setGold] = usePersistentState<number>(`${storageKey}:gold`, 0);
  const [gems, setGems] = usePersistentState<number>(`${storageKey}:gems`, 0);
  const [pomodoroDurations, setPomodoroDurations] = usePersistentState<PomodoroDurations>(`${storageKey}:pomodoro_durations`, DEFAULT_POMODORO_DURATIONS,);
  const [debugDaysOffset, setDebugDaysOffset] = usePersistentState<number>(`${storageKey}:debug_days_offset`, 0);
  const [dateRefresh, setDateRefresh] = useState(0);
  const currentDate = addDaysToISO(todayISO(), debugDaysOffset);
  const appDataSnapshot = JSON.stringify({
    tasks,
    habits,
    boards,
    kanbanTasks,
    inventory,
    ownedCharacterIds,
    maxLevelReached,
    gold,
    gems,
    pomodoroDurations,
    debugDaysOffset,
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
  const changeExperience = useCallback(async (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount === 0) return false;
    const storedUser = getStoredUser();
    if (!storedUser) return false;

    if (!getAuthToken()) {
      updateUserExperience(Math.max(0, (storedUser.experience ?? 0) + amount));
      return true;
    }

    try {
      const response = await authenticatedFetch(`${API_URL}/users/${storedUser.UserID}/experience`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || !result || typeof result !== 'object' || !('experience' in result)
        || typeof result.experience !== 'number' || !Number.isFinite(result.experience)) {
        throw new Error('Não foi possível atualizar a experiência.');
      }
      if (getStoredUser()?.UserID !== storedUser.UserID) return false;
      updateUserExperience(result.experience);
      return true;
    } catch (experienceError) {
      console.error('Erro ao atualizar experiência:', experienceError);
      setSyncError(experienceError instanceof Error ? experienceError.message : 'Não foi possível atualizar a experiência.');
      return false;
    }
  }, [updateUserExperience]);
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
    if (!ownedCharacterIds.includes(characterId)) {
      setCharacterError('Esse personagem ainda não foi desbloqueado.');
      return;
    }
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
      setCharacterError('');
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
      ownedCharacterIds,
      maxLevelReached,
      gold,
      gems,
      pomodoroDurations,
      debugDaysOffset,
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
        const remoteOwnedCharacters = Array.isArray(remote.ownedCharacterIds)
          ? remote.ownedCharacterIds.filter((id): id is CharacterId => (
            typeof id === 'string' && characters.some(character => character.id === id)
          ))
          : localData.ownedCharacterIds;
        const remoteMaxLevel = typeof remote.maxLevelReached === 'number' && Number.isSafeInteger(remote.maxLevelReached)
          ? Math.max(1, remote.maxLevelReached)
          : localData.maxLevelReached;
        const levelUnlockedCharacters = unlockableCharacters
          .filter((_, index) => (index + 1) * 5 <= remoteMaxLevel)
          .map(character => character.id);

        const merged: UserAppData = {
          tasks: Array.isArray(remote.tasks) ? remote.tasks : localData.tasks,
          habits: Array.isArray(remote.habits) ? remote.habits : localData.habits,
          boards: Array.isArray(remote.boards) ? remote.boards : localData.boards,
          kanbanTasks: Array.isArray(remote.kanbanTasks) ? remote.kanbanTasks : localData.kanbanTasks,
          inventory: Array.isArray(remote.inventory) ? remote.inventory : localData.inventory,
          ownedCharacterIds: [...new Set([
            ...starterCharacterIds,
            ...remoteOwnedCharacters,
            ...levelUnlockedCharacters,
          ])],
          maxLevelReached: remoteMaxLevel,
          gold: typeof remote.gold === 'number' && Number.isFinite(remote.gold) ? remote.gold : localData.gold,
          gems: typeof remote.gems === 'number' && Number.isFinite(remote.gems) ? remote.gems : localData.gems,
          pomodoroDurations: isPomodoroDurations(remote.pomodoroDurations) ? remote.pomodoroDurations : localData.pomodoroDurations,
          debugDaysOffset: typeof remote.debugDaysOffset === 'number' && Number.isSafeInteger(remote.debugDaysOffset)
            ? remote.debugDaysOffset
            : localData.debugDaysOffset,
        };

        const hasSavedCharacterProgress = Array.isArray(remote.ownedCharacterIds)
          && typeof remote.maxLevelReached === 'number'
          && Number.isSafeInteger(remote.maxLevelReached);
        lastSavedSnapshotRef.current = hasSavedCharacterProgress ? JSON.stringify(merged) : '';

        setTasks(merged.tasks);
        setHabits(merged.habits);
        setBoards(merged.boards);
        setKanbanTasks(merged.kanbanTasks);
        setInventory(merged.inventory);
        setOwnedCharacterIds(merged.ownedCharacterIds);
        setMaxLevelReached(merged.maxLevelReached);
        setGold(merged.gold);
        setGems(merged.gems);
        setDebugDaysOffset(merged.debugDaysOffset ?? 0);

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
  if (userId && (syncState.userId !== userId || syncState.mode !== 'ready')) return;
  const reachedLevel = levelProgress.level;
  if (reachedLevel <= maxLevelReached) return;

  const levelsCrossed = Math.floor(reachedLevel / 5) - Math.floor(maxLevelReached / 5);
  const availableCharacters = unlockableCharacters.filter(
    character => !ownedCharacterIds.includes(character.id),
  );
  const newlyUnlocked: (typeof unlockableCharacters)[number][] = [];
  for (let reward = 0; reward < Math.min(levelsCrossed, availableCharacters.length); reward += 1) {
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    newlyUnlocked.push(availableCharacters.splice(randomIndex, 1)[0]);
  }

  if (newlyUnlocked.length) {
    const unlockedIds = newlyUnlocked.map(character => character.id);
    setOwnedCharacterIds(previous => [...new Set([...previous, ...unlockedIds])]);
    setDebugNotice(
      `Personagem${newlyUnlocked.length > 1 ? 's' : ''} desbloqueado${newlyUnlocked.length > 1 ? 's' : ''}: ${newlyUnlocked.map(character => character.name).join(', ')}. Confira o inventário.`,
    );
  }
  setMaxLevelReached(reachedLevel);
}, [
  levelProgress.level,
  maxLevelReached,
  ownedCharacterIds,
  setMaxLevelReached,
  setOwnedCharacterIds,
  syncState,
  userId,
]);


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
    const interval = window.setInterval(() => setDateRefresh(value => value + 1), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleDebugKeys = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement
        && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]')));
      if (isTyping || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        const debugXp = Math.max(1, Math.floor(levelProgress.experienceForNextLevel * 0.25));
        void changeExperience(debugXp).then(applied => {
          setDebugNotice(applied
            ? `Debug: +${debugXp} XP`
            : 'Não foi possível adicionar XP.');
        });
      } else if (event.key.toLowerCase() === 'o') {
        event.preventDefault();
        setDebugDaysOffset(offset => offset + 1);
        setDebugNotice(`Dia avançado: ${addDaysToISO(todayISO(), debugDaysOffset + 1)}.`);
      } else if (event.key.toLowerCase() === 'i') {
        event.preventDefault();
        setDebugDaysOffset(0);
        setDebugNotice('Dias resetados.');
      }
    };

    window.addEventListener('keydown', handleDebugKeys, true);
    return () => window.removeEventListener('keydown', handleDebugKeys, true);
  }, [changeExperience, debugDaysOffset, levelProgress.experienceForNextLevel, setDebugDaysOffset]);

  const processedPenaltyDaysRef = useRef(new Map<string, number>());
  useEffect(() => {
    if (userId && (syncState.userId !== userId || syncState.mode !== 'ready')) return;

    let remainingExperience = Math.max(0, user?.experience ?? 0);
    let totalPenalty = 0;
    const pendingPenaltyDays = new Map<string, { type: 'quest' | 'kanban'; id: number; days: number }>();
    for (const task of tasks) {
      if (task.completed || !task.date) continue;
      const lateDays = Math.max(0, differenceInDays(task.date, currentDate));
      const key = `${storageKey}:quest:${task.id}`;
      const appliedDays = Math.max(task.latePenaltyDays ?? 0, processedPenaltyDaysRef.current.get(key) ?? 0);
      if (lateDays <= appliedDays) continue;

      for (let day = appliedDays + 1; day <= lateDays; day += 1) {
        const required = getLevelProgress(remainingExperience).experienceForNextLevel;
        const penalty = Math.floor(required * (day === 1 ? 0.5 : 0.1));
        totalPenalty += penalty;
        remainingExperience = Math.max(0, remainingExperience - penalty);
      }
      processedPenaltyDaysRef.current.set(key, lateDays);
      pendingPenaltyDays.set(key, { type: 'quest', id: task.id, days: lateDays });
    }

    for (const task of kanbanTasks) {
      if (task.column === 'done' || !task.date) continue;
      const lateDays = Math.max(0, differenceInDays(task.date, currentDate));
      const key = `${storageKey}:kanban:${task.id}`;
      const appliedDays = Math.max(task.latePenaltyDays ?? 0, processedPenaltyDaysRef.current.get(key) ?? 0);
      if (lateDays <= appliedDays) continue;

      for (let day = appliedDays + 1; day <= lateDays; day += 1) {
        const required = getLevelProgress(remainingExperience).experienceForNextLevel;
        const penalty = Math.floor(required * (day === 1 ? 0.5 : 0.1));
        totalPenalty += penalty;
        remainingExperience = Math.max(0, remainingExperience - penalty);
      }
      processedPenaltyDaysRef.current.set(key, lateDays);
      pendingPenaltyDays.set(key, { type: 'kanban', id: task.id, days: lateDays });
    }

    const savePenaltyProgress = () => {
      const questDays = new Map<number, number>();
      const kanbanDays = new Map<number, number>();
      for (const { type, id, days } of pendingPenaltyDays.values()) {
        (type === 'quest' ? questDays : kanbanDays).set(id, days);
      }
      if (questDays.size) {
        setTasks(previous => previous.map(task => questDays.has(task.id)
          ? { ...task, latePenaltyDays: questDays.get(task.id) }
          : task));
      }
      if (kanbanDays.size) {
        setKanbanTasks(previous => previous.map(task => kanbanDays.has(task.id)
          ? { ...task, latePenaltyDays: kanbanDays.get(task.id) }
          : task));
      }
    };
    if (totalPenalty) {
      window.setTimeout(() => {
        void changeExperience(-totalPenalty).then(applied => {
          if (applied) {
            savePenaltyProgress();
          } else {
            for (const key of pendingPenaltyDays.keys()) processedPenaltyDaysRef.current.delete(key);
          }
        });
      }, 0);
    } else {
      savePenaltyProgress();
    }

    const staleHabitIds = habits
      .filter(habit => habit.streak !== 0
        && (!habit.lastCompletedDate || differenceInDays(habit.lastCompletedDate, currentDate) >= 2))
      .map(habit => habit.id);
    if (staleHabitIds.length) {
      setHabits(previous => previous.map(habit => staleHabitIds.includes(habit.id)
        ? { ...habit, streak: 0 }
        : habit));
    }
  }, [
    changeExperience,
    currentDate,
    dateRefresh,
    habits,
    kanbanTasks,
    setHabits,
    setKanbanTasks,
    setTasks,
    storageKey,
    syncState,
    tasks,
    user?.experience,
    userId,
  ]);

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
      case 'Quests': return <Quests
        tasks={tasks}
        setTasks={setTasks}
        habits={habits}
        setHabits={setHabits}
        currentDate={currentDate}
        onExperienceChange={changeExperience}
      />;
      case 'Kanban': return <Kanban
        boards={boards}
        setBoards={setBoards}
        tasks={kanbanTasks}
        setTasks={setKanbanTasks}
        onExperienceChange={changeExperience}
      />;
      case 'Pomodoro': return null;
      case 'Guilda': return <Guilda
        debugDate={debugDaysOffset ? currentDate : undefined}
        onExperienceUpdated={updateUserExperience}
      />;
      case 'Configurações': return <Config onUserUpdated={name => setUser(current => current ? { ...current, name } : current)}/>;
      case 'Inventário': return <Inv
        ownedCharacterIds={ownedCharacterIds}
        equippedCharacterId={user?.characterId ?? null}
        characterError={characterError}
        isSavingCharacter={isSavingCharacter}
        onSelectCharacter={characterId => void selectCharacter(characterId)}
      />;
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
      <p role="status" style={{ color: 'var(--gold)', padding: '8px 20px' }}>
        {debugNotice || 'P: adicionar XP; O: avançar um dia; I: resetar os dias.'}
      </p>
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