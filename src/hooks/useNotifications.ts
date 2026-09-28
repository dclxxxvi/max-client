import { useEffect, useRef } from 'react';
import type { GreenApi, Webhook } from '../api';

const RETRY_DELAY = 3000;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

export function useNotifications(api: GreenApi, onWebhook: (webhook: Webhook) => void) {
  const handlerRef = useRef(onWebhook);

  useEffect(() => {
    handlerRef.current = onWebhook;
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      while (!signal.aborted) {
        try {
          const notification = await api.receiveNotification(signal);
          if (!notification) continue;
          try {
            handlerRef.current(notification.body);
          } catch (error) {
            console.error('[notifications] не удалось обработать', notification.body, error);
          }
          await api.deleteNotification(notification.receiptId, signal);
        } catch (error) {
          if (signal.aborted) break;
          console.error('[notifications]', error);
          await wait(RETRY_DELAY, signal);
        }
      }
    })();

    return () => controller.abort();
  }, [api]);
}
