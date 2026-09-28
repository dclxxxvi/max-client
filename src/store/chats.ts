import type { MessageStatus, MessageWebhook, StatusWebhook } from '../api';
import { chatIdToTitle, formatPhone } from '../utils/format';

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  outgoing: boolean;
  status?: MessageStatus;
}

export interface Chat {
  chatId: string;
  name: string;
  phone?: string;
  username?: string;
  messages: Message[];
  unread: number;
}

export interface ChatsState {
  chats: Record<string, Chat>;
  order: string[];
}

export type ChatsAction =
  | { type: 'openChat'; chatId: string; name: string; phone?: string; username?: string }
  | { type: 'readChat'; chatId: string }
  | { type: 'addPending'; chatId: string; id: string; text: string }
  | { type: 'sendSucceeded'; chatId: string; tempId: string; idMessage: string }
  | { type: 'sendFailed'; chatId: string; tempId: string }
  | { type: 'webhookMessage'; webhook: MessageWebhook; activeChatId: string | null }
  | { type: 'webhookStatus'; webhook: StatusWebhook };

export const initialChatsState: ChatsState = { chats: {}, order: [] };

const STATUS_RANK: Record<MessageStatus, number> = { failed: -1, pending: 0, sent: 1, delivered: 2, read: 3 };

const MEDIA_LABELS: Record<string, string> = {
  imageMessage: 'Фото',
  videoMessage: 'Видео',
  audioMessage: 'Аудио',
  documentMessage: 'Файл',
  stickerMessage: 'Стикер',
  locationMessage: 'Геопозиция',
  contactMessage: 'Контакт',
  pollMessage: 'Опрос',
};

export function webhookText({ messageData }: MessageWebhook) {
  const text = messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text;
  if (text != null) return text;
  const label = MEDIA_LABELS[messageData.typeMessage] ?? 'Сообщение';
  const caption = messageData.fileMessageData?.caption;
  return caption ? `[${label}] ${caption}` : `[${label}]`;
}

const hasPlaceholderName = (chat: Chat) =>
  chat.name === chatIdToTitle(chat.chatId) || (!!chat.phone && chat.name === formatPhone(chat.phone));

function upsertChat(state: ChatsState, chatId: string, update: (chat: Chat) => Chat, name?: string): ChatsState {
  const chat = state.chats[chatId] ?? { chatId, name: name ?? chatIdToTitle(chatId), messages: [], unread: 0 };
  return {
    chats: { ...state.chats, [chatId]: update(chat) },
    order: [chatId, ...state.order.filter((id) => id !== chatId)],
  };
}

function updateChat(state: ChatsState, chatId: string, update: (chat: Chat) => Chat): ChatsState {
  const chat = state.chats[chatId];
  return chat ? { ...state, chats: { ...state.chats, [chatId]: update(chat) } } : state;
}

export function chatsReducer(state: ChatsState, action: ChatsAction): ChatsState {
  switch (action.type) {
    case 'openChat': {
      const { chatId, name, phone, username } = action;
      if (!state.chats[chatId]) return upsertChat(state, chatId, (c) => ({ ...c, phone, username }), name);
      return updateChat(state, chatId, (c) => ({ ...c, phone: phone ?? c.phone, username: username ?? c.username }));
    }

    case 'readChat':
      return updateChat(state, action.chatId, (c) => (c.unread ? { ...c, unread: 0 } : c));

    case 'addPending':
      return upsertChat(state, action.chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: action.id, text: action.text, timestamp: Date.now(), outgoing: true, status: 'pending' },
        ],
      }));

    case 'sendSucceeded':
      return updateChat(state, action.chatId, (c) => {
        // Уведомление outgoingAPIMessageReceived могло прийти раньше ответа sendMessage
        if (c.messages.some((m) => m.id === action.idMessage)) {
          return { ...c, messages: c.messages.filter((m) => m.id !== action.tempId) };
        }
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === action.tempId ? { ...m, id: action.idMessage, status: 'sent' } : m
          ),
        };
      });

    case 'sendFailed':
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === action.tempId ? { ...m, status: 'failed' } : m)),
      }));

    case 'webhookMessage': {
      const { webhook, activeChatId } = action;
      const { chatId, chatName, senderName } = webhook.senderData;
      const outgoing = webhook.typeWebhook !== 'incomingMessageReceived';
      const existing = state.chats[chatId];
      if (existing?.messages.some((m) => m.id === webhook.idMessage)) return state;

      const message: Message = {
        id: webhook.idMessage,
        text: webhookText(webhook),
        timestamp: webhook.timestamp * 1000,
        outgoing,
        status: outgoing ? 'sent' : undefined,
      };
      const name = chatName || (!outgoing && senderName) || undefined;
      return upsertChat(
        state,
        chatId,
        (c) => ({
          ...c,
          name: hasPlaceholderName(c) && name ? name : c.name,
          messages: [...c.messages, message].sort((a, b) => a.timestamp - b.timestamp),
          unread: !outgoing && chatId !== activeChatId ? c.unread + 1 : c.unread,
        }),
        name
      );
    }

    case 'webhookStatus': {
      const { chatId, idMessage, status } = action.webhook;
      const next: MessageStatus = status === 'sent' || status === 'delivered' || status === 'read' ? status : 'failed';
      return updateChat(state, chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === idMessage && (next === 'failed' || STATUS_RANK[next] > STATUS_RANK[m.status ?? 'pending'])
            ? { ...m, status: next }
            : m
        ),
      }));
    }
  }
}
