import { useState, type FormEvent } from 'react';
import { InfoPageLayout } from './InfoPageLayout';
import styles from './styles/FaleConosco.module.css';

export function FaleConosco() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <InfoPageLayout title='FALE CONOSCO'>
            <p className={styles.intro}>
                Tem uma dúvida, elogio ou crítica? Manda pra gente que a guilda responde o quanto antes.
            </p>

            {sent && (
                <p className={styles.successMsg} role='status'>
                    Mensagem enviada! Obrigado por entrar em contato.
                </p>
            )}

            <form className={`${styles.form} cornerFrame`} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="name">NOME:</label>
                    <input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className={styles.field}>
                    <label htmlFor="email">EMAIL:</label>
                    <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className={styles.field}>
                    <label htmlFor="message">MENSAGEM:</label>
                    <textarea id="message" name="message" rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>

                <button type="submit" className={styles.submitBtn}>ENVIAR MENSAGEM</button>
            </form>
        </InfoPageLayout>
    );
}