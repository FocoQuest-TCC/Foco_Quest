import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, publicApiHeaders } from '../config/api';
import GoogleIcon from '../assets/Google.png';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  theme: 'outline';
  size: 'large';
  text: 'continue_with';
  shape: 'rectangular';
  width: number;
  locale: 'pt-BR';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts.id) resolve();
      else reject(new Error('O serviço de autenticação do Google não foi carregado.'));
    };
    script.onerror = () => reject(new Error('Não foi possível carregar o serviço de autenticação do Google.'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    googleScriptPromise = null;
    throw error;
  });

  return googleScriptPromise;
}

interface GoogleAuthButtonProps {
  label: string;
  className: string;
  buttonClassName: string;
  iconClassName: string;
  errorClassName: string;
}

export function GoogleAuthButton({
  label,
  className,
  buttonClassName,
  iconClassName,
  errorClassName,
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const buttonHost = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let mounted = true;
    loadGoogleIdentityServices()
      .then(() => {
        if (!mounted || !buttonHost.current || !window.google?.accounts.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setError('O Google não retornou uma credencial válida. Tente novamente.');
              return;
            }

            try {
              const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { ...publicApiHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
              });
              const data = await response.json().catch(() => ({}));

              if (!response.ok) {
                throw new Error(data.message ?? 'Não foi possível entrar com o Google.');
              }

              localStorage.setItem('user', JSON.stringify(data.user));
              localStorage.setItem('authToken', data.token);
              navigate('/home');
            } catch (authError) {
              setError(authError instanceof Error ? authError.message : 'Erro ao conectar com o servidor.');
            }
          },
        });
        window.google.accounts.id.renderButton(buttonHost.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(buttonHost.current.clientWidth || 400, 400),
          locale: 'pt-BR',
        });
        setIsReady(true);
      })
      .catch((loadError: unknown) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar o Google.');
      });

    return () => {
      mounted = false;
    };
  }, [clientId, navigate]);

  return (
    <div className={className}>
      <div ref={buttonHost} />
      {!isReady && (
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setError(clientId
            ? 'Aguarde o carregamento do Google ou tente novamente.'
            : 'O acesso com Google ainda não está configurado neste ambiente.')}
        >
          <img src={GoogleIcon} className={iconClassName} aria-hidden="true" />
          {label}
        </button>
      )}
      {error && <p className={errorClassName} role="alert">{error}</p>}
    </div>
  );
}
