import { useState, type FormEvent } from 'react';
import { createGreenApi, DEFAULT_API_URL, getErrorMessage, type Credentials } from '../api';

export function LoginScreen({ onLogin }: { onLogin: (credentials: Credentials) => void }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const credentials: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
    };
    setError(null);
    setLoading(true);
    try {
      const { stateInstance } = await createGreenApi(credentials).getStateInstance();
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance}). Авторизуйте его в личном кабинете Green API.`);
        return;
      }
      onLogin(credentials);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo">MAX</div>
        <h1>Вход</h1>
        <p className="muted">Введите данные инстанса из личного кабинета Green API</p>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
            inputMode="numeric"
            autoFocus
            required
          />
        </label>
        <label className="field">
          <span>apiTokenInstance</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
            autoComplete="off"
            required
          />
        </label>
        <label className="field">
          <span>apiUrl</span>
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder={DEFAULT_API_URL} />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="primary-button" disabled={loading || !idInstance.trim() || !apiTokenInstance.trim()}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
