import { useState, type FormEvent } from 'react';
import { InfoPageLayout } from './InfoPageLayout';
import styles from './styles/ReportarProblema.module.css';

export function ReportarProblema() {
    const [category, setCategory] = useState('bug');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSent(true);
        setDescription('');
        setEmail('');
    };

    return (
        <InfoPageLayout title="REPORTAR UM PROBLEMA">
            <p className={styles.intro}>
                Encontrou algo quebrado? Descreva o que aconteceu pra gente investigar.
            </p>

            {sent && (
                <p className={styles.successMsg} role='status'>
                    Problema reportado! Nossa equipe vai dar uma olhada.
                </p>
            )}

            <form className={`${styles.form} cornerFrame`} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="category">CATEGORIA:</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="bug">Erro / Bug</option>
                        <option value="visual">Problema visual</option>
                        <option value="performance">Lentidão</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="description">DESCRIÇÃO:</label>
                    <textarea
                        id='description'
                        rows={6}
                        placeholder='O que você estava fazendo quando o problema aconteceu?'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="email">EMAIL PARA CONTATO (OPCIONAL):</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <button type="submit" className={styles.submitBtn}>ENVIAR RELATO</button>
            </form>
        </InfoPageLayout>
    );
}