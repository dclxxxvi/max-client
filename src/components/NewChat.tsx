import { useState, type FormEvent } from 'react';
import { normalizePhone } from '../utils/format';

export function NewChat({ onOpen }: { onOpen: (phone: string) => Promise<string | null> }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = normalizePhone(phone);
    if (!digits) {
      setError('Введите номер в международном формате, например +7 912 345-67-89');
      return;
    }
    setError(null);
    setLoading(true);
    const openError = await onOpen(digits);
    setLoading(false);
    if (openError) setError(openError);
    else setPhone('');
  };

  return (
    <div className="new-chat">
      <form className="new-chat-card" onSubmit={handleSubmit}>
        <h2>Новый чат</h2>
        <p className="muted">Введите номер телефона собеседника</p>
        <input
          className="phone-input"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          placeholder="+7 912 345-67-89"
          autoFocus
        />
        {error && <div className="error">{error}</div>}
        <button className="primary-button" disabled={loading || !phone.trim()}>
          {loading ? 'Ищем контакт…' : 'Начать чат'}
        </button>
      </form>
    </div>
  );
}
