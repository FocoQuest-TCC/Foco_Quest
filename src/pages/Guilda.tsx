import { type FormEvent, useEffect, useState } from 'react';
import { API_URL, authHeaders, getStoredUser } from '../config/api';
import styles from './styles/Guilda.module.css';

type GuildRole = 'admin' | 'member';
type TaskColumn = 'todo' | 'doing' | 'done';

interface GuildMember {
  userId: number;
  name: string;
  role: GuildRole;
}

interface GuildBoard {
  id: number;
  name: string;
}

interface GuildTaskAssignee {
  userId: number;
  name: string;
  completed: boolean;
}

interface GuildTask {
  id: number;
  boardId: number;
  text: string;
  column: TaskColumn;
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
): Promise<GuildResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...authHeaders(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      && typeof result.message === 'string'
      ? result.message
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

export function Guilda() {
  const currentUserId = getStoredUser()?.UserID;
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [guildName, setGuildName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [boardName, setBoardName] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [taskText, setTaskText] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    guildRequest('/guild')
      .then(({ guild: loadedGuild }) => {
        if (!cancelled) setGuild(loadedGuild);
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
  }, []);

  const isAdmin = guild?.members.some(
    member => member.userId === currentUserId && member.role === 'admin',
  ) ?? false;
  const selectedBoard = guild?.boards.find(board => board.id === selectedBoardId) ?? guild?.boards[0];
  const boardTasks = guild?.tasks.filter(task => task.boardId === selectedBoard?.id) ?? [];

  const performGuildAction = async (
    action: string,
    path: string,
    method: string,
    body: Record<string, unknown> | undefined,
    successMessage: string,
  ) => {
    setError('');
    setNotice('');
    setBusyAction(action);
    try {
      const result = await guildRequest(path, method, body);
      setGuild(result.guild);
      setNotice(result.message ?? successMessage);
      return result;
    } catch (actionError: unknown) {
      setError(getErrorMessage(actionError));
      return null;
    } finally {
      setBusyAction(null);
    }
  };

  const createGuild = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await performGuildAction(
      'create-guild',
      '/guild',
      'POST',
      { name: guildName },
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
    const result = await performGuildAction(
      'create-board',
      '/guild/boards',
      'POST',
      { name: boardName },
      'Quadro criado com sucesso.',
    );
    if (result) setBoardName('');
  };

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBoard) return;
    const result = await performGuildAction(
      'create-task',
      `/guild/boards/${selectedBoard.id}/tasks`,
      'POST',
      { text: taskText, assigneeIds },
      'Tarefa criada com sucesso.',
    );
    if (result) {
      setTaskText('');
      setAssigneeIds([]);
    }
  };

  const copyInviteCode = async () => {
    setError('');
    setNotice('');
    try {
      await navigator.clipboard.writeText(guild?.code ?? '');
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
              </div>

              {isAdmin && (
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
                  <fieldset className={styles.assigneePicker}>
                    <legend>Responsáveis</legend>
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
                        {member.name}
                      </label>
                    ))}
                  </fieldset>
                  <button className={styles.primaryButton} type="submit" disabled={busyAction !== null}>
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
                                      {assignee.completed ? '✓' : '○'} {assignee.name}
                                    </span>
                                  ))}
                                </div>
                                {myAssignment && (
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
                                {isAdmin && (
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
