import { Fragment, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Chat, Message } from '../store/chats';
import { chatIdToTitle, formatDay, formatPhone, formatTime } from '../utils/format';
import { Avatar } from './Avatar';
import { AlertIcon, BackIcon, CheckIcon, ClockIcon, SendIcon } from './Icons';

const MAX_LENGTH = 4096;

interface Props {
  chat: Chat;
  onSend: (text: string) => void;
  onBack: () => void;
}

function StatusMark({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'pending':
      return <ClockIcon />;
    case 'sent':
      return <CheckIcon />;
    case 'delivered':
      return <CheckIcon double />;
    case 'read':
      return (
        <span className="status-read">
          <CheckIcon double />
        </span>
      );
    case 'failed':
      return (
        <span className="status-failed" title="Не отправлено">
          <AlertIcon />
        </span>
      );
    default:
      return null;
  }
}

export function ChatView({ chat, onSend, onBack }: Props) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat.chatId, chat.messages.length]);

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, [chat.chatId]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const subtitle =
    [chat.phone && formatPhone(chat.phone), chat.username].filter((v) => v && v !== chat.name).join(' · ') ||
    (chat.name !== chatIdToTitle(chat.chatId) ? chatIdToTitle(chat.chatId) : '');

  return (
    <section className="chat">
      <header className="chat-header">
        <button className="icon-button back-button" onClick={onBack} title="Назад">
          <BackIcon />
        </button>
        <Avatar id={chat.chatId} name={chat.name} size={40} />
        <div className="chat-header-info">
          <div className="chat-header-name">{chat.name}</div>
          <div className="chat-header-sub">{subtitle}</div>
        </div>
      </header>

      <div className="messages" ref={listRef}>
        {chat.messages.length === 0 && (
          <div className="messages-empty">
            <Avatar id={chat.chatId} name={chat.name} size={72} />
            <p>Здесь пока пусто. Напишите первое сообщение!</p>
          </div>
        )}
        {chat.messages.map((message, i) => {
          const prev = chat.messages[i - 1];
          const newDay =
            !prev || new Date(prev.timestamp).toDateString() !== new Date(message.timestamp).toDateString();
          const grouped = !newDay && prev?.outgoing === message.outgoing;
          return (
            <Fragment key={message.id}>
              {newDay && <div className="day-separator">{formatDay(message.timestamp)}</div>}
              <div className={`message ${message.outgoing ? 'out' : 'in'}${grouped ? ' grouped' : ''}`}>
                <div className="bubble">
                  <span className="bubble-text">{message.text}</span>
                  <span className="bubble-meta">
                    {formatTime(message.timestamp)}
                    {message.outgoing && <StatusMark status={message.status} />}
                  </span>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <footer className="composer">
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
        />
        <button className="send-button" onClick={send} disabled={!text.trim()} title="Отправить">
          <SendIcon />
        </button>
      </footer>
    </section>
  );
}
