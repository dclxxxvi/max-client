import axios from 'axios';
import type {
  CheckAccountResponse,
  Credentials,
  InstanceSettings,
  Notification,
  SendMessageResponse,
  StateInstanceResponse,
} from './types';

export type * from './types';

export const DEFAULT_API_URL = 'https://4100.api.green-api.com';

const RECEIVE_TIMEOUT = 20;

export function createGreenApi({ apiUrl, idInstance, apiTokenInstance }: Credentials) {
  const client = axios.create({
    baseURL: `${apiUrl.replace(/\/+$/, '')}/waInstance${idInstance}`,
    timeout: (RECEIVE_TIMEOUT + 10) * 1000,
  });

  const url = (method: string, ...params: (string | number)[]) =>
    [method, apiTokenInstance, ...params].map((p) => encodeURIComponent(p)).join('/');

  return {
    getStateInstance: async () => (await client.get<StateInstanceResponse>(url('getStateInstance'))).data,

    getSettings: async () => (await client.get<InstanceSettings>(url('getSettings'))).data,

    setSettings: async (settings: Partial<InstanceSettings>) =>
      (await client.post<{ saveSettings: boolean }>(url('setSettings'), settings)).data,

    // Telegram: номер телефона -> chatId пользователя (входящие приходят с этим chatId, а не с номером)
    checkAccount: async (phoneNumber: number) =>
      (await client.post<CheckAccountResponse>(url('checkAccount'), { phoneNumber })).data,

    sendMessage: async (chatId: string, message: string) =>
      (await client.post<SendMessageResponse>(url('sendMessage'), { chatId, message })).data,

    // Пустая очередь: null (200) или 408 по истечении receiveTimeout
    receiveNotification: async (signal?: AbortSignal) => {
      const response = await client.get<Notification | null | ''>(url('receiveNotification'), {
        params: { receiveTimeout: RECEIVE_TIMEOUT },
        signal,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 408,
      });
      return response.status === 408 || !response.data ? null : response.data;
    },

    deleteNotification: async (receiptId: number, signal?: AbortSignal) =>
      (await client.delete<{ result: boolean }>(url('deleteNotification', receiptId), { signal })).data,
  };
}

export type GreenApi = ReturnType<typeof createGreenApi>;

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403)
      return 'Неверный idInstance или apiTokenInstance';
    if (error.response?.status === 466) return 'Исчерпан лимит запросов тарифа';
    if (error.response) return `Ошибка сервера: ${error.response.status}`;
    return 'Нет соединения с сервером';
  }
  return 'Неизвестная ошибка';
};
