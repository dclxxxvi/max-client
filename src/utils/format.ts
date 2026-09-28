/** Номер в международном формате без «+»: 8XXXXXXXXXX -> 7XXXXXXXXXX */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export const formatPhone = (digits: string) => `+${digits}`;

export function chatIdToTitle(chatId: string) {
  const [id, domain] = chatId.split('@');
  return domain === 'c.us' && /^\d+$/.test(id) ? `+${id}` : id;
}

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function formatDay(ts: number) {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

/** Короткая дата для списка чатов: время сегодня, иначе дд.мм */
export function formatListDate(ts: number) {
  const date = new Date(ts);
  return date.toDateString() === new Date().toDateString()
    ? formatTime(ts)
    : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}
