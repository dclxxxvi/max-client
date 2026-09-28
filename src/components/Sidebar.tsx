import type { Chat, ChatsState } from '../store/chats';
import { formatListDate } from '../utils/format';
import { Avatar } from './Avatar';
import { LogoutIcon, PlusIcon } from './Icons';

interface Props {
  state: ChatsState;
  activeChatId: string | null;
  idInstance: string;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

function lastMessagePreview(chat: Chat) {
  const last = chat.messages.at(-1);
  if (!last) return <span className="muted">Нет сообщений</span>;
  return (
    <>
      {last.outgoing && <span className="preview-you">Вы: </span>}
      {last.text}
    </>
  );
}

export function Sidebar({ state, activeChatId, idInstance, onSelect, onNewChat, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1>Чаты</h1>
        <div className="sidebar-actions">
          <button className="icon-button" onClick={onNewChat} title="Новый чат">
            <PlusIcon />
          </button>
          <button className="icon-button" onClick={onLogout} title={`Выйти (инстанс ${idInstance})`}>
            <LogoutIcon />
          </button>
        </div>
      </header>

      <ul className="chat-list">
        {state.order.length === 0 && <li className="chat-list-empty muted">Нажмите «+», чтобы начать чат</li>}
        {state.order.map((chatId) => {
          const chat = state.chats[chatId];
          const last = chat.messages.at(-1);
          return (
            <li key={chatId}>
              <button
                className={`chat-item${chatId === activeChatId ? ' active' : ''}`}
                onClick={() => onSelect(chatId)}
              >
                <Avatar id={chatId} name={chat.name} />
                <div className="chat-item-body">
                  <div className="chat-item-row">
                    <span className="chat-item-name">{chat.name}</span>
                    {last && <span className="chat-item-date">{formatListDate(last.timestamp)}</span>}
                  </div>
                  <div className="chat-item-row">
                    <span className="chat-item-preview">{lastMessagePreview(chat)}</span>
                    {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
