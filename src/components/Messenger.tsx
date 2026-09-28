import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  createGreenApi,
  getErrorMessage,
  type Credentials,
  type MessageWebhook,
  type StatusWebhook,
  type Webhook,
} from '../api';
import { useInstanceSettings } from '../hooks/useInstanceSettings';
import { useNotifications } from '../hooks/useNotifications';
import { chatsReducer, initialChatsState, type ChatsState } from '../store/chats';
import { formatPhone } from '../utils/format';
import { ChatView } from './ChatView';
import { NewChat } from './NewChat';
import { Sidebar } from './Sidebar';

const MESSAGE_WEBHOOKS = new Set(['incomingMessageReceived', 'outgoingMessageReceived', 'outgoingAPIMessageReceived']);

const storageKey = (idInstance: string) => `max-client:chats:${idInstance}`;

function loadChats(idInstance: string): ChatsState {
  try {
    const saved = localStorage.getItem(storageKey(idInstance));
    return saved ? (JSON.parse(saved) as ChatsState) : initialChatsState;
  } catch {
    return initialChatsState;
  }
}

interface Props {
  credentials: Credentials;
  onLogout: () => void;
}

export function Messenger({ credentials, onLogout }: Props) {
  const api = useMemo(() => createGreenApi(credentials), [credentials]);
  const [state, dispatch] = useReducer(chatsReducer, credentials.idInstance, loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(credentials.idInstance), JSON.stringify(state));
    } catch {
      // хранилище недоступно — история останется только в памяти
    }
  }, [state, credentials.idInstance]);

  const handleWebhook = useCallback(
    (webhook: Webhook) => {
      if (MESSAGE_WEBHOOKS.has(webhook.typeWebhook)) {
        dispatch({ type: 'webhookMessage', webhook: webhook as MessageWebhook, activeChatId });
      } else if (webhook.typeWebhook === 'outgoingMessageStatus') {
        dispatch({ type: 'webhookStatus', webhook: webhook as StatusWebhook });
      }
    },
    [activeChatId]
  );

  useNotifications(api, handleWebhook);
  const { notice, dismiss } = useInstanceSettings(api);

  const selectChat = (chatId: string) => {
    dispatch({ type: 'readChat', chatId });
    setActiveChatId(chatId);
  };

  const openChat = async (phone: string): Promise<string | null> => {
    let chatId = `${phone}@c.us`;
    let username: string | undefined;
    try {
      const account = await api.checkAccount(Number(phone));
      if (!account.exist || !account.chatId) return 'Этот номер не зарегистрирован в Telegram';
      chatId = account.chatId;
      username = account.username || undefined;
    } catch (error) {
      if (!(isAxiosError(error) && error.response?.status === 404)) return getErrorMessage(error);
    }
    dispatch({ type: 'openChat', chatId, name: formatPhone(phone), phone, username });
    dispatch({ type: 'readChat', chatId });
    setActiveChatId(chatId);
    return null;
  };

  const sendMessage = async (chatId: string, text: string) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    dispatch({ type: 'addPending', chatId, id: tempId, text });
    try {
      const { idMessage } = await api.sendMessage(chatId, text);
      dispatch({ type: 'sendSucceeded', chatId, tempId, idMessage });
    } catch (error) {
      console.error('[sendMessage]', error);
      dispatch({ type: 'sendFailed', chatId, tempId });
    }
  };

  const activeChat = activeChatId ? state.chats[activeChatId] : null;

  return (
    <div className={`messenger${activeChat ? ' has-active-chat' : ''}`}>
      <Sidebar
        state={state}
        activeChatId={activeChatId}
        idInstance={credentials.idInstance}
        onSelect={selectChat}
        onNewChat={() => setActiveChatId(null)}
        onLogout={onLogout}
      />
      <main className="main-pane">
        {notice && (
          <div className={`notice notice-${notice.kind}`} role="status">
            <span>{notice.text}</span>
            <button className="notice-close" onClick={dismiss} title="Закрыть">
              ×
            </button>
          </div>
        )}
        {activeChat ? (
          <ChatView
            key={activeChat.chatId}
            chat={activeChat}
            onSend={(text) => sendMessage(activeChat.chatId, text)}
            onBack={() => setActiveChatId(null)}
          />
        ) : (
          <NewChat onOpen={openChat} />
        )}
      </main>
    </div>
  );
}
