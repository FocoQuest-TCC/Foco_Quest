import { type FormEvent, useEffect, useRef, useState } from 'react';
import { API_URL, authenticatedFetch, getStoredUser } from '../config/api';
import styles from './styles/Guilda.module.css';
import { getCharacterImage } from '../config/characters';
import { formatCompactNumber, getLevelProgress } from '../config/experience';
import sandMonsterBoss from '../assets/Bosses/MonstroAreia.gif';
import lostTimeBoss from '../assets/Bosses/TempoPerdido.gif';
import undefinedCharacter from '../assets/Characters/Undefinied.png';
import { todayISO } from '../config/DateUtils';
import { DatePickerField } from './DatePickerField';

type GuildRole = 'admin' | 'member';
type TaskColumn = 'todo' | 'doing' | 'done';

interface GuildMember {
  userId: number;
  name: string;
  characterId: string | null;
  role: GuildRole;
  experience?: number;
  contributionXP?: number;
}

interface GuildBoard {
  id: number;
  name: string;
  bossId: string;
  bossHealth?: number;
  bossMaxHealth?: number;
  closedAt: string | null;
}

interface GuildTaskAssignee {
  userId: number;
  name: string;
  characterId: string | null;
  completed: boolean;
}

interface GuildTask {
  id: number;
  boardId: number;
  text: string;
  column: TaskColumn;
  bossDamage?: number;
  dueDate: string | null;
  assignees: GuildTaskAssignee[];
}

interface GuildData {
  id: number;
  name: string;
  code: string;
  members: GuildMember[];
  boards: GuildBoard[];
  tasks: GuildTask[];
}

interface GuildResponse {
  guild: GuildData | null;
  message?: string;
}

async function guildRequest(
  path: string,
  method = 'GET',
  body?: Record<string, unknown>,
  debugDate?: string,
): Promise<GuildResponse> {
  const url = new URL(`${API_URL}${path}`);
  if (debugDate) url.searchParams.set('debugDate', debugDate);
  const response = await authenticatedFetch(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined, ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      && typeof result.message === 'string'
      ? result.message
      : response.status === 404
        ? 'Rota da guilda não encontrada. Reinicie ou atualize o backend para habilitar a finalização do quadro.'
        : 'Não foi possível concluir a operação da guilda.';
    throw new Error(message);
  }

  if (!result || typeof result !== 'object' || !('guild' in result)) {
    throw new Error('O servidor retornou uma resposta inválida para a guilda.');
  }

  return result as GuildResponse;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro ao conectar com o servidor.';
}

const bossAssets: Record<string, { name: string; image: string }> = {
  monstroAreia: { name: 'Monstro de Areia', image: sandMonsterBoss },
  tempoPerdido: { name: 'Tempo Perdido', image: lostTimeBoss },
  bluelobister: { name: 'Monstro de Areia', image: sandMonsterBoss },
  cao: { name: 'Tempo Perdido', image: lostTimeBoss },
  red: { name: 'Monstro de Areia', image: sandMonsterBoss },
  nico: { name: 'Tempo Perdido', image: lostTimeBoss },
};

function getExperience(experience: number | null | undefined) {
  return typeof experience === 'number' && Number.isFinite(experience) ? experience : 0;
}

function getBossHealth(health: number | null | undefined) {
  return typeof health === 'number' && Number.isFinite(health) ? health : 0;
}

export function Guilda({
  debugDate,
  onExperienceUpdated,
}: {
  debugDate?: string;
  onExperienceUpdated?: (experience: number) => void;
}) {
  const currentUserId = getStoredUser()?.UserID;
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const actionInProgressRef = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [guildName, setGuildName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [boardName, setBoardName] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [taskText, setTaskText] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(todayISO());
  const [assigneeIds, setAssigneeIds] = useState<number[]>(currentUserId ? [currentUserId] : []);
  const memberAvatarRefs = useRef(new Map<number, HTMLElement>());
  const bossImageRef = useRef<HTMLImageElement>(null);

  const animateBossAttack = (assignees: GuildTaskAssignee[]) => {
    const boss = bossImageRef.current;
    if (!boss || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bossBounds = boss.getBoundingClientRect();
    const bossCenterX = bossBounds.left + bossBounds.width / 2;
    const bossCenterY = bossBounds.top + bossBounds.height / 2;

    assignees.forEach((assignee, index) => {
      const avatar = memberAvatarRefs.current.get(assignee.userId);
      if (!avatar) return;
      const avatarBounds = avatar.getBoundingClientRect();
      const deltaX = bossCenterX - (avatarBounds.left + avatarBounds.width / 2);
      const deltaY = bossCenterY - (avatarBounds.top + avatarBounds.height / 2);
      window.setTimeout(() => {
        avatar.animate([
          { transform: 'translate(0, 0) scale(1)', offset: 0 },
          { transform: `translate(${deltaX}px, ${deltaY}px) scale(1.2)`, offset: 0.65 },
          { transform: 'translate(0, 0) scale(1)', offset: 1 },
        ], { duration: 850, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }, index * 100);
    });

    boss.animate([
      { transform: 'translateX(0) rotate(0)' },
      { transform: 'translateX(7px) rotate(4deg)' },
      { transform: 'translateX(-7px) rotate(-4deg)' },
      { transform: 'translateX(0) rotate(0)' },
    ], { duration: 550, easing: 'ease-in-out' });
  };

  useEffect(() => {
    let cancelled = false;
    guildRequest('/guild', 'GET', undefined, debugDate)
      .then(({ guild: loadedGuild }) => {
        if (!cancelled) {
          setGuild(loadedGuild);
          const currentMember = loadedGuild?.members.find(member => member.userId === currentUserId);
          if (typeof currentMember?.experience === 'number') onExperienceUpdated?.(currentMember.experience);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, debugDate, onExperienceUpdated]);

  const isAdmin = guild?.members.some(
    member => member.userId === currentUserId && member.role === 'admin',
  ) ?? false;
  const selectedBoard = guild?.boards.find(board => board.id === selectedBoardId) ?? guild?.boards[0];
  const boardTasks = guild?.tasks.filter(task => task.boardId === selectedBoard?.id) ?? [];
  const boardComplete = boardTasks.length > 0 && boardTasks.every(task => task.column === 'done');
  const bossMaxHealth = getBossHealth(selectedBoard?.bossMaxHealth);
  const bossHealth = getBossHealth(selectedBoard?.bossHealth);
  const bossHealthPercent = bossMaxHealth
    ? (bossHealth / bossMaxHealth) * 100
    : 0;

  const performGuildAction = async (
    action: string,
    path: string,
    method: string,
    body: Record<string, unknown> | undefined,
    successMessage: string,
  ): Promise<GuildResponse | null> => {
    if(actionInProgressRef.current){
      return null;
    }

    actionInProgressRef.current = true;

    setError('');
    setNotice('');
    setBusyAction(action);

    try {
      const result = await guildRequest(path, method, body, debugDate);

      setGuild(result.guild);
      const currentMember = result.guild?.members.find(member => member.userId === currentUserId);
      if (typeof currentMember?.experience === 'number') onExperienceUpdated?.(currentMember.experience);

      if (action.startsWith('complete-') && guild && result.guild) {
        const taskId = Number(action.slice('complete-'.length));
        const previousTask = guild.tasks.find(task => task.id === taskId);
        const updatedTask = result.guild.tasks.find(task => task.id === taskId);

        if (previousTask?.column !== 'done' && updatedTask?.column === 'done') {
          animateBossAttack(updatedTask.assignees);
        }
      }

      setNotice(result.message ?? successMessage);

      return result;
    } catch (actionError: unknown) {
      setError(getErrorMessage(actionError));
      return null;
    } finally {
      actionInProgressRef.current = false;
      setBusyAction(null);
    }
  };

  const createGuild = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = guildName.trim();

    if(!name){
      setError('Digite um nome para sua guilda.');
      return;
    }

    const result = await performGuildAction(
      'create-guild',
      '/guild',
      'POST',
      { name },
      'Guilda criada com sucesso.',
    );
    if (result) setGuildName('');
  };

  const joinGuild = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await performGuildAction(
      'join-guild',
      '/guild/join',
      'POST',
      { code: inviteCode },
      'Você entrou na guilda.',
    );
    if (result) setInviteCode('');
  };

  const createBoard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = boardName.trim();

    if(!name){
      setError('Digite um nome para o kanban.');
      return;
    }

    const result = await performGuildAction(
      'create-board',
      '/guild/boards',
      'POST',
      { name: boardName },
      'Kanban criado com sucesso.',
    );
    if (result) setBoardName('');
  };

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBoard) return;
    if (!taskDueDate) {
      setError('Selecione o prazo da tarefa.');
      return;
    }
    if (!assigneeIds.length) {
      setError('Selecione pelo menos um membro responsável pela tarefa.');
      return;
    }
    const result = await performGuildAction(
      'create-task',
      `/guild/boards/${selectedBoard.id}/tasks`,
      'POST',
      { text: taskText, dueDate: taskDueDate, assigneeIds },
      'Tarefa criada com sucesso.',
    );
    if (result) {
      setTaskText('');
      setTaskDueDate(todayISO());
      setAssigneeIds(currentUserId ? [currentUserId] : []);
    }
  };

  const finishBoard = async () => {
    if (!selectedBoard || !boardComplete) return;
    if (!window.confirm(`Derrotar o boss e finalizar "${selectedBoard.name}"? A experiência será distribuída aos responsáveis pelas quests.`)) {
      return;
    }
    const result = await performGuildAction(
      `finish-board-${selectedBoard.id}`,
      `/guild/boards/${selectedBoard.id}/finish`,
      'POST',
      undefined,
      'Quadro finalizado e experiência distribuída.',
    );
    const currentMember = result?.guild?.members.find(member => member.userId === currentUserId);
    if (typeof currentMember?.experience === 'number') {
      onExperienceUpdated?.(currentMember.experience);
    }
  };

  const copyInviteCode = async () => {
    setError('');
    setNotice('');

    const code = guild?.code?.trim();

    if(!code){
      setError('Nenhum código de convite disponível.');
      return;
    }

    try {
      if(!navigator.clipboard?.writeText){
        throw new Error(
          'A cópia automática não está disponível neste navegador'
        );
      }

      await navigator.clipboard.writeText(code);
      
      setNotice('Código de convite copiado.');
    } catch (copyError: unknown) {
      setError(getErrorMessage(copyError));
    }
  };

  if (loading) {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>GUILDA</h2>
        <p className={styles.emptyText} role="status">Carregando sua guilda...</p>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-labelledby="guilda-heading">
      <header className={styles.header}>
        <div>
          <h2 id="guilda-heading" className={styles.title}>GUILDA</h2>
          {guild && <p className={styles.memberCount}>{guild.members.length} membros</p>}
        </div>
        {guild && (
          <div className={styles.inviteCode}>
            <span>CÓDIGO DE CONVITE</span>
            <strong>{guild.code}</strong>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={copyInviteCode}
              disabled={busyAction !== null}
            >
              COPIAR
            </button>
          </div>
        )}
      </header>

      {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      {notice && <p className={styles.successMessage} role="status">{notice}</p>}

      {!guild ? (
        <>
          <p className={styles.emptyText}>
            Crie uma guilda para organizar objetivos em equipe ou entre em uma com o código de convite.
          </p>
          <div className={styles.entryGrid}>
            <form className={styles.panel} onSubmit={createGuild}>
              <h3>Criar uma guilda</h3>
              <label className={styles.fieldLabel} htmlFor="guild-name">Nome da guilda</label>
              <input
                id="guild-name"
                className={styles.input}
                value={guildName}
                onChange={event => setGuildName(event.target.value)}
                maxLength={80}
                required
              />
              <button className={styles.primaryButton} type="submit" disabled={busyAction !== null}>
                {busyAction === 'create-guild' ? 'CRIANDO...' : 'CRIAR GUILDA'}
              </button>
            </form>
            <form className={styles.panel} onSubmit={joinGuild}>
              <h3>Entrar em uma guilda</h3>
              <label className={styles.fieldLabel} htmlFor="guild-code">Código de convite</label>
              <input
                id="guild-code"
                className={styles.input}
                value={inviteCode}
                onChange={event => setInviteCode(event.target.value.toUpperCase())}
                maxLength={10}
                minLength={10}
                autoCapitalize="characters"
                required
              />
              <button className={styles.primaryButton} type="submit" disabled={busyAction !== null}>
                {busyAction === 'join-guild' ? 'ENTRANDO...' : 'ENTRAR NA GUILDA'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className={styles.guildTitleRow}>
            <div>
              <h3 className={styles.guildName}>{guild.name}</h3>
              <span className={isAdmin ? styles.adminBadge : styles.memberBadge}>
                {isAdmin ? 'ADMINISTRADOR' : 'MEMBRO'}
              </span>
            </div>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => void performGuildAction(
                'leave-guild',
                `/guild/members/${currentUserId}`,
                'DELETE',
                undefined,
                'Você saiu da guilda.',
              )}
              disabled={busyAction !== null}
            >
              {busyAction === 'leave-guild' ? 'SAINDO...' : 'SAIR DA GUILDA'}
            </button>
          </div>

          <section className={styles.panel} aria-labelledby="guild-members-heading">
            <div className={styles.sectionHeader}>
              <h3 id="guild-members-heading">MEMBROS</h3>
              <span>{guild.members.length} na equipe</span>
            </div>
            <div className={styles.memberList}>
              {guild.members.map(member => (
                <div className={styles.memberRow} key={member.userId}>
                  <div>
                    {getCharacterImage(member.characterId) && (
                      <img
                        className={styles.memberAvatar}
                        src={getCharacterImage(member.characterId)}
                        alt=""
                      />
                    )}
                    <strong>{member.name}</strong>
                    <span className={member.role === 'admin' ? styles.adminBadge : styles.memberBadge}>
                      {member.role === 'admin' ? 'ADMIN' : 'MEMBRO'}
                    </span>
                    {member.userId === currentUserId && <span className={styles.youBadge}>VOCÊ</span>}
                  </div>
                  {isAdmin && (
                    <div className={styles.memberActions}>
                      <button
                        type="button"
                        className={styles.smallButton}
                        onClick={() => void performGuildAction(
                          `role-${member.userId}`,
                          `/guild/members/${member.userId}/role`,
                          'PATCH',
                          { role: member.role === 'admin' ? 'member' : 'admin' },
                          'Permissão atualizada.',
                        )}
                        disabled={busyAction !== null}
                      >
                        {member.role === 'admin' ? 'REMOVER ADMIN' : 'TORNAR ADMIN'}
                      </button>
                      {member.userId !== currentUserId && (
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => void performGuildAction(
                            `remove-${member.userId}`,
                            `/guild/members/${member.userId}`,
                            'DELETE',
                            undefined,
                            'Membro removido da guilda.',
                          )}
                          disabled={busyAction !== null}
                        >
                          REMOVER
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {isAdmin && (
            <form className={`${styles.panel} ${styles.boardForm}`} onSubmit={createBoard}>
              <h3>Criar quadro da guilda</h3>
              <div className={styles.inlineForm}>
                <label className="srOnly" htmlFor="board-name">Nome do quadro</label>
                <input
                  id="board-name"
                  className={styles.input}
                  value={boardName}
                  onChange={event => setBoardName(event.target.value)}
                  maxLength={100}
                  placeholder="Ex.: Projeto da equipe"
                  required
                />
                <button className={styles.primaryButton} type="submit" disabled={busyAction !== null}>
                  CRIAR QUADRO
                </button>
              </div>
            </form>
          )}

          <section className={styles.panel} aria-labelledby="guild-boards-heading">
            <div className={styles.sectionHeader}>
              <h3 id="guild-boards-heading">QUADROS</h3>
              <span>Planeje e acompanhe as tarefas em equipe</span>
            </div>
            {guild.boards.length ? (
              <div className={styles.boardGrid}>
                {guild.boards.map(board => {
                  const taskCount = guild.tasks.filter(task => task.boardId === board.id).length;
                  return (
                    <article
                      className={`${styles.boardCard} ${selectedBoardId === board.id ? styles.boardCardActive : ''}`}
                      key={board.id}
                    >
                      <button
                        type="button"
                        className={styles.boardOpen}
                        onClick={() => setSelectedBoardId(board.id)}
                        aria-pressed={selectedBoardId === board.id}
                      >
                        <span aria-hidden="true">📋</span>
                        <strong>{board.name}</strong>
                        <span>{taskCount} tarefas</span>
                        {board.closedAt && <span>QUADRO FINALIZADO</span>}
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => {
                            if (window.confirm(`Excluir o quadro "${board.name}" e todas as tarefas dele?`)) {
                              void performGuildAction(
                                `delete-board-${board.id}`,
                                `/guild/boards/${board.id}`,
                                'DELETE',
                                undefined,
                                'Quadro excluído.',
                              );
                            }
                          }}
                          disabled={busyAction !== null}
                        >
                          EXCLUIR
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyText}>
                Ainda não há quadros. Um administrador pode criar o primeiro quadro da equipe.
              </p>
            )}
          </section>

          {selectedBoard && (
            <section className={styles.kanbanSection} aria-labelledby="guild-board-title">
              <div className={styles.boardTitle}>
                <h3 id="guild-board-title">{selectedBoard.name}</h3>
                {selectedBoard.closedAt && <span className={styles.closedBadge}>BOSS DERROTADO</span>}
              </div>

              <section className={styles.battleScene} aria-label="Batalha do quadro">
                <div className={styles.battleTeam}>
                  <h4>GUILDA · EQUIPE</h4>
                  <div className={styles.battleMembers}>
                    {guild.members.map(member => (
                      <div
                        className={styles.battleMember}
                        key={member.userId}
                        ref={element => {
                          if (element) memberAvatarRefs.current.set(member.userId, element);
                          else memberAvatarRefs.current.delete(member.userId);
                        }}
                      >
                        <img
                          className={styles.battleAvatar}
                          src={getCharacterImage(member.characterId) ?? undefinedCharacter}
                          alt={member.name}
                        />
                        <strong>{member.name}</strong>
                        <span>
                          NVL {getLevelProgress(getExperience(member.experience)).level}
                          {' · '}
                          {formatCompactNumber(getExperience(member.experience))} XP
                        </span>
                        <span className={styles.guildContribution}>
                          Contribuição: {formatCompactNumber(getExperience(member.contributionXP))} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className={styles.battleVersus} aria-hidden="true">VS</span>
                <div className={styles.battleBoss}>
                  <h4>{selectedBoard.closedAt ? 'BOSS DERROTADO' : 'BOSS'}</h4>
                  <img
                    ref={bossImageRef}
                    className={styles.bossImage}
                    src={bossAssets[selectedBoard.bossId]?.image ?? sandMonsterBoss}
                    alt={bossAssets[selectedBoard.bossId]?.name ?? 'Boss'}
                  />
                  <strong>{bossAssets[selectedBoard.bossId]?.name ?? 'Boss'}</strong>
                  <div className={styles.bossHealth}>
                    <div
                      className={styles.bossHealthTrack}
                      role="progressbar"
                      aria-label="Vida do chefão"
                      aria-valuemin={0}
                      aria-valuemax={Math.max(1, bossMaxHealth)}
                      aria-valuenow={bossHealth}
                    >
                      <span
                        className={styles.bossHealthFill}
                        style={{ width: `${bossHealthPercent}%` }}
                      />
                    </div>
                    <span>
                      {formatCompactNumber(bossHealth)}
                      {' / '}
                      {formatCompactNumber(bossMaxHealth)} HP
                    </span>
                  </div>
                </div>
              </section>

              {isAdmin && boardComplete && !selectedBoard.closedAt && (
                <div className={styles.finishBoard}>
                  <p>Todas as tarefas foram concluídas. Finalize o quadro para distribuir 225 XP por tarefa a cada responsável.</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={finishBoard}
                    disabled={busyAction !== null}
                  >
                    {busyAction === `finish-board-${selectedBoard.id}` ? 'FINALIZANDO...' : 'DERROTAR BOSS E FINALIZAR QUADRO'}
                  </button>
                </div>
              )}

              {isAdmin && !selectedBoard.closedAt && (
                <form className={`${styles.panel} ${styles.taskForm}`} onSubmit={createTask}>
                  <h3>Adicionar tarefa</h3>
                  <label className={styles.fieldLabel} htmlFor="guild-task">Descrição</label>
                  <input
                    id="guild-task"
                    className={styles.input}
                    value={taskText}
                    onChange={event => setTaskText(event.target.value)}
                    maxLength={240}
                    placeholder="O que a equipe precisa fazer?"
                    required
                  />
                  <label className={styles.fieldLabel}>Prazo obrigatório</label>
                  <DatePickerField
                    date={taskDueDate}
                    time=""
                    onDateChange={setTaskDueDate}
                    onTimeChange={() => undefined}
                  />
                  <fieldset className={styles.assigneePicker}>
                    <legend>Responsáveis (selecione ao menos um)</legend>
                    {guild.members.map(member => (
                      <label key={member.userId}>
                        <input
                          type="checkbox"
                          checked={assigneeIds.includes(member.userId)}
                          onChange={event => setAssigneeIds(current => (
                            event.target.checked
                              ? [...current, member.userId]
                              : current.filter(id => id !== member.userId)
                          ))}
                        />
                        {getCharacterImage(member.characterId) && (
                          <img
                            className={styles.assigneeAvatar}
                            src={getCharacterImage(member.characterId)}
                            alt=""
                          />
                        )}
                        {member.name}
                      </label>
                    ))}
                  </fieldset>
                  <button className={styles.primaryButton} type="submit" disabled={busyAction !== null || !taskDueDate || !assigneeIds.length}>
                    CRIAR TAREFA
                  </button>
                </form>
              )}

              <div className={styles.board}>
                {([
                  ['todo', 'A FAZER'],
                  ['doing', 'EM ANDAMENTO'],
                  ['done', 'CONCLUÍDO'],
                ] as const).map(([column, title]) => {
                  const tasks = boardTasks.filter(task => task.column === column);
                  return (
                    <section className={styles.column} key={column} aria-label={title}>
                      <h4 className={`${styles.columnHeading} ${styles[column]}`}>
                        {title}<span>{tasks.length}</span>
                      </h4>
                      {tasks.length ? (
                        <div className={styles.taskList}>
                          {tasks.map(task => {
                            const myAssignment = task.assignees.find(
                              assignee => assignee.userId === currentUserId,
                            );
                            return (
                              <article className={styles.taskCard} key={task.id}>
                                <div className={styles.taskTopline}>
                                  <strong>{task.text}</strong>
                                  {task.dueDate && <span>Prazo: {task.dueDate.slice(0, 10).split('-').reverse().join('/')}</span>}
                                </div>
                                <p className={styles.progressText}>
                                  Responsáveis: {task.assignees.filter(person => person.completed).length}
                                  /{task.assignees.length} concluíram
                                </p>
                                <div className={styles.assigneeList}>
                                  {task.assignees.map(assignee => (
                                    <span
                                      className={assignee.completed ? styles.completedAssignee : styles.assigneeName}
                                      key={assignee.userId}
                                    >
                                      {assignee.completed ? '✓' : '○'}
                                      {getCharacterImage(assignee.characterId) && (
                                        <img
                                          className={styles.assigneeAvatar}
                                          src={getCharacterImage(assignee.characterId)}
                                          alt=""
                                        />
                                      )}
                                      {assignee.name}
                                    </span>
                                  ))}
                                </div>
                                {myAssignment && !selectedBoard.closedAt && (
                                  <label className={styles.completionToggle}>
                                    <input
                                      type="checkbox"
                                      checked={myAssignment.completed}
                                      disabled={busyAction !== null}
                                      onChange={event => void performGuildAction(
                                        `complete-${task.id}`,
                                        `/guild/tasks/${task.id}/completion`,
                                        'PATCH',
                                        { completed: event.target.checked },
                                        'Progresso atualizado.',
                                      )}
                                    />
                                    Marcar minha parte como concluída
                                  </label>
                                )}
                                {isAdmin && !selectedBoard.closedAt && (
                                  <div className={styles.taskActions}>
                                    {task.column !== 'done' && (
                                      <button
                                        type="button"
                                        className={styles.smallButton}
                                        onClick={() => void performGuildAction(
                                          `move-${task.id}`,
                                          `/guild/tasks/${task.id}/column`,
                                          'PATCH',
                                          { column: task.column === 'todo' ? 'doing' : 'todo' },
                                          'Tarefa movida.',
                                        )}
                                        disabled={busyAction !== null}
                                      >
                                        {task.column === 'todo' ? 'INICIAR' : 'VOLTAR PARA A FAZER'}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className={styles.dangerButton}
                                      onClick={() => {
                                        if (window.confirm(`Excluir a tarefa "${task.text}"?`)) {
                                          void performGuildAction(
                                            `delete-task-${task.id}`,
                                            `/guild/tasks/${task.id}`,
                                            'DELETE',
                                            undefined,
                                            'Tarefa excluída.',
                                          );
                                        }
                                      }}
                                      disabled={busyAction !== null}
                                    >
                                      EXCLUIR
                                    </button>
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={styles.emptyColumn}>Nenhuma tarefa nesta etapa.</p>
                      )}
                    </section>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
