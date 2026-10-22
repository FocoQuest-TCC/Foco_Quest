import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authHeaders, getStoredUser } from '../config/api';
import styles from './styles/config.module.css';

interface ConfigProps {
    onUserUpdated: (name: string) => void;
}

export function Config({ onUserUpdated }: ConfigProps) {
    const navigate = useNavigate();
    const user = getStoredUser();
    const [nome, setNome] = useState(user?.name ?? '');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordStep, setShowPasswordStep] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSaved(false);
        const name = nome.trim();
        if (!user?.UserID) {
            setError('Não foi possível identificar sua conta. Entre novamente.');
            return;
        }
        if (!name || name.length > 120) {
            setError('O nome deve ter entre 1 e 120 caracteres.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/users/${user.UserID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ name }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message ?? 'Não foi possível salvar as alterações.');

            const updatedUser = { ...user, ...data.user, name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUserUpdated(name);
            setNome(name);
            setSaved(true);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Erro ao conectar com o servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    const beginDelete = () => {
        if (window.confirm('Tem certeza de que deseja excluir sua conta? Essa ação não pode ser desfeita.')) {
            setError('');
            setDeletePassword('');
            setShowPasswordStep(true);
        }
    };

    const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        if (!user?.UserID) {
            setError('Não foi possível identificar sua conta. Entre novamente.');
            return;
        }
        if (!deletePassword) {
            setError('Digite sua senha para confirmar a exclusão.');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`${API_URL}/users/${user.UserID}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ password: deletePassword }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message ?? 'Não foi possível excluir a conta.');

            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Erro ao conectar com o servidor.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className={styles.container}>
            <h2 id="config-heading" className={styles.title}>CONFIGURAÇÕES DA CONTA</h2>
            <form className={styles.form} onSubmit={handleSave}>
                <div className={styles.field}>
                    <label htmlFor="nome">APELIDO DO HERÓI:</label>
                    <input
                        id="nome"
                        name="nome"
                        maxLength={120}
                        value={nome}
                        onChange={event => setNome(event.target.value)}
                        required
                    />
                </div>
                {saved && <span className={styles.savedMsg} role="status">Alterações salvas!</span>}
                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
                <button
                    type="button"
                    className={styles.logoutBtn}
                    onClick={() => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        navigate('/login', { replace: true });
                    }}
                >
                    SAIR DA CONTA
                </button>
            </form>

            <section className={styles.deleteSection} aria-labelledby="delete-account-heading">
                <h3 id="delete-account-heading">EXCLUIR CONTA</h3>
                <p>Excluir a conta remove permanentemente seu perfil e seus dados.</p>
                {!showPasswordStep ? (
                    <button type="button" className={styles.deleteBtn} onClick={beginDelete}>
                        EXCLUIR MINHA CONTA
                    </button>
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
                                onChange={event => setDeletePassword(event.target.value)}
                                required
                            />
                        </div>
                        {error && <span className={styles.errorMsg} role="alert">{error}</span>}
                        <div className={styles.deleteActions}>
                            <button type="submit" className={styles.deleteBtn} disabled={isDeleting}>
                                {isDeleting ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}
                            </button>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowPasswordStep(false);
                                    setDeletePassword('');
                                    setError('');
                                }}
                                disabled={isDeleting}
                            >
                                CANCELAR
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </section>
    );
}
