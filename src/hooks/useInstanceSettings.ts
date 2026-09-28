import { useEffect, useState } from 'react';
import { getErrorMessage, type GreenApi, type InstanceSettings } from '../api';

const REQUIRED: Partial<InstanceSettings> = {
  incomingWebhook: 'yes',
  outgoingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  outgoingAPIMessageWebhook: 'yes',
};

export interface SettingsNotice {
  kind: 'info' | 'error';
  text: string;
}

export function useInstanceSettings(api: GreenApi) {
  const [notice, setNotice] = useState<SettingsNotice | null>(null);

  useEffect(() => {
    let cancelled = false;
    const show = (value: SettingsNotice | null) => !cancelled && setNotice(value);

    (async () => {
      try {
        const settings = await api.getSettings();
        if (settings.webhookUrl) {
          show({
            kind: 'error',
            text: `У инстанса задан webhookUrl (${settings.webhookUrl}) — уведомления уходят туда, а не в приложение. Очистите его в личном кабинете Green API.`,
          });
          return;
        }
        const missing = (Object.keys(REQUIRED) as (keyof InstanceSettings)[]).filter(
          (key) => settings[key] !== REQUIRED[key]
        );
        if (missing.length === 0) return;

        await api.setSettings(REQUIRED);
        show({
          kind: 'info',
          text: 'Включили получение уведомлений в настройках инстанса. Применение может занять несколько минут — сообщения, отправленные до этого, не придут.',
        });
      } catch (error) {
        show({ kind: 'error', text: `Не удалось проверить настройки инстанса: ${getErrorMessage(error)}` });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api]);

  return { notice, dismiss: () => setNotice(null) };
}
