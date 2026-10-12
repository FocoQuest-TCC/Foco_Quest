import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, publicApiHeaders } from '../../config/api';
import styles from './styles/emailVerification.module.css';

export function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const requestStarted = useRef(false);
  const [message, setMessage] = useState('Confirmando seu email...');
  const [error, setError] = useState(() => token ? '' : 'O link de confirmação é inválido.');

  useEffect(() => {
    if (requestStarted.current || !token) return;
    requestStarted.current = true;

    fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { ...publicApiHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message ?? 'Não foi possível confirmar seu email.');
        setMessage(data.message);
      })
      .catch((verificationError: unknown) => {
        setError(verificationError instanceof Error
          ? verificationError.message
          : 'Erro ao conectar com o servidor.');
      });
  }, [token]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Confirmação de email</h1>
        {error ? <p className={styles.error} role="alert">{error}</p> : <p role="status">{message}</p>}
        <button type="button" onClick={() => navigate('/login')}>IR PARA O LOGIN</button>
      </section>
    </main>
  );
}
