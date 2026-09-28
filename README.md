# MAX Client

Веб-клиент мессенджера MAX, работающий через [Green API](https://green-api.com). Позволяет войти по данным инстанса, начать чат по номеру телефона, отправлять и получать текстовые сообщения со статусами доставки.

## Возможности

- Вход по `idInstance` и `apiTokenInstance` с проверкой, что инстанс авторизован
- Создание чата по номеру телефона
- Отправка сообщений и отображение статусов (отправлено / доставлено / прочитано)
- Получение входящих в реальном времени через `receiveNotification` (long polling)
- Автоматическая проверка и включение нужных настроек уведомлений инстанса
- Сохранение данных входа и истории чатов в `localStorage`

## Стек

React 19, TypeScript, Vite, axios, ESLint, Prettier.

## Требования

- Node.js 20.19+ или 22.12+
- Инстанс Green API в статусе `authorized` (создаётся и авторизуется в [личном кабинете](https://console.green-api.com))

> Поле `webhookUrl` у инстанса должно быть пустым — иначе уведомления уходят на внешний адрес и не попадают в приложение.

## Запуск

```bash
git clone https://github.com/dclxxxvi/max-client.git
cd max-client
npm install
npm run dev
```

Откройте адрес, который выведет Vite (по умолчанию http://localhost:5173), и введите `idInstance` и `apiTokenInstance`. Поле `apiUrl` можно оставить пустым — адрес будет определён по `idInstance`.

## Скрипты

| Команда           | Описание                                    |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Dev-сервер с HMR                            |
| `npm run build`   | Проверка типов и production-сборка в `dist` |
| `npm run preview` | Локальный просмотр production-сборки        |
| `npm run lint`    | Проверка ESLint                             |
| `npm run format`  | Форматирование Prettier                     |
