import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authenticatedFetch, getStoredUser, authHeaders, clearSession } from '../config/api';
import styles from './styles/config.module.css';

interface ConfigProps {
    onUserUpdated: (name: string) => void;
}

export function Config({ onUserUpdated }: ConfigProps) {
    const navigate = useNavigate();
    const user = getStoredUser();

    const [nome, setNome] = useState(user?.name ?? '');

    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [deletePassword, setDeletePassword] = useState('');
    const [showPasswordStep, setShowPasswordStep] = useState(false);

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(isSaving || isDeleting) return;
        
        setSaveError('');
        setSaved(false);

        const name = nome.trim();

        if (!user?.UserID) {
            setSaveError('Não foi possível identificar sua conta. Entre novamente.');
            return;
        }

        if (!name || name.length > 120) {
            setSaveError('O nome deve ter entre 1 e 120 caracteres.');
            return;
        }

        setIsSaving(true);

        try {
            const response = await authenticatedFetch(`${API_URL}/users/${user.UserID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ name }),
            }
        );

        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Não foi possível salvar as alterações.');

        const updatedUser = { ...user, ...data.user, name };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        onUserUpdated(name);
        setNome(name);
        setSaved(true);

        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Erro ao conectar com o servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        if (isSaving || isDeleting) return;

        clearSession();

        navigate('/login', { replace: true });
    };

    const beginDelete = () => {
        if (isSaving || isDeleting) return;

        const confirmed = window.confirm('Tem certeza de que deseja excluir sua conta? ' + 'Essa ação não pode ser desfeita.');

        if(!confirmed) return;

        setDeleteError('');
        setDeletePassword('');
        setShowPasswordStep(true);
    };

    const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isDeleting || isSaving) return;

        setDeleteError('');

        if (!user?.UserID) {
            setDeleteError('Não foi possível identificar sua conta. Entre novamente.');
            return;
        }

        if (!deletePassword) {
            setDeleteError('Digite sua senha para confirmar a exclusão.');
            return;
        }

        setIsDeleting(true);

        try {
            const response = await authenticatedFetch(`${API_URL}/users/${user.UserID}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ password: deletePassword }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Não foi possível excluir a conta.');

            clearSession();

            navigate('/login', { replace: true });
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Erro ao conectar com o servidor.');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        if(isDeleting) return;

        setShowPasswordStep(false);
        setDeletePassword('');
        setDeleteError('');
    }

    return (
        <section className={styles.container}>
            <h2 id="config-heading" className={styles.title}>CONFIGURAÇÕES DA CONTA</h2>
            <form className={styles.form} onSubmit={handleSave}>
                <div className={styles.field}>
                    <label htmlFor="nome">APELIDO DO HERÓI:</label>
                    <input
                        id="nome"
                        name="nome"
                        type='text'
                        maxLength={120}
                        autoComplete='nickname'
                        value={nome}
                        onChange={event => {
                            setNome(event.target.value);
                            setSaved(false);
                            setSaveError('');
                        }}
                        aria-invalid={Boolean(saveError)}
                        aria-describedby={saveError ? 'config-save-error' : undefined}
                        required
                    />
                </div>
                {saveError && <span id='config-save-error' className={styles.errorMsg} role="alert">{saveError}</span>}
                {saved && <span className={styles.savedMsg} role="status">Alterações salvas!</span>}
                <button type="submit" className={styles.saveBtn} disabled={isSaving || isDeleting} aria-busy={isSaving}>
                    {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
                <button  type="button" className={styles.logoutBtn} onClick={handleLogout} disabled={isSaving || isDeleting}>SAIR DA CONTA</button>
            </form>

            <section className={styles.deleteSection} aria-labelledby="delete-account-heading">
            <h3 id="delete-account-heading">EXCLUIR CONTA</h3>

            <p>Excluir a conta remove permanentemente seu perfil e seus dados.</p>

            {!showPasswordStep ? (
              <button type="button" className={styles.deleteBtn} onClick={beginDelete} disabled={isSaving || isDeleting}>EXCLUIR MINHA CONTA</button>
            ) : (
              <form onSubmit={handleDelete}>
                <div className={styles.field}>
                  <label htmlFor="delete-password">SENHA DA CONTA:</label>

                  <input
                    id="delete-password"
                    name="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={event => {
                      setDeletePassword(
                        event.target.value
                      );
                      setDeleteError('');
                    }}
                    required
                  />
                </div>

                {deleteError && (
                    <span className={styles.errorMsg} role="alert">{deleteError}</span>
                )}

                <div className={styles.deleteActions}>
                    <button type="submit" className={styles.deleteBtn} disabled={isDeleting || isSaving} aria-busy={isDeleting}>{isDeleting ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}</button>   
                    <button type="button" className={styles.cancelBtn} onClick={cancelDelete} disabled={isDeleting}>CANCELAR</button>
                </div>
              </form>
            )}
      </section>
    </section>
  );    
}