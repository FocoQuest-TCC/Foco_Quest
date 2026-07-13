import { useState, type FormEvent } from 'react';
import { InfoPageLayout } from './InfoPageLayout';
import styles from './styles/SolicitarSugestao.module.css';

export function SolicitarSugestao() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSent(true);
        setTitle('');
        setDescription('');
    };

    return (
        <InfoPageLayout title="SOLICITAR SUGESTÃO">
            <p className={styles.intro}>Tem uma ideia pra deixar o FocoQuest melhor? Conta pra gente!</p>

            {sent && (
                <p className={styles.successMsg} role="status">Sugestão enviada! Obrigado por ajudar a melhorar o FocoQuest.</p>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="title">TÍTULO DA SUGESTÃO:</label>
                    <input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className={styles.field}>
                    <label htmlFor="description">DESCREVA SUA IDEIA:</label>
                    <textarea id="description" rows={6} value={description} onChange={e => setDescription(e.target.value)} required/>
                </div>

                <button type="submit" className={styles.submitBtn}>ENVIAR SUGESTÃO</button>
            </form>
        </InfoPageLayout>
    );
}