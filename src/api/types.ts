export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface SendMessageResponse {
  idMessage: string;
}

export interface StateInstanceResponse {
  stateInstance: 'notAuthorized' | 'authorized' | 'blocked' | 'starting' | 'yellowCard';
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  username?: string;
  phoneNumber: number;
}

export type YesNo = 'yes' | 'no';

export interface InstanceSettings {
  webhookUrl: string;
  incomingWebhook: YesNo;
  outgoingWebhook: YesNo;
  outgoingMessageWebhook: YesNo;
  outgoingAPIMessageWebhook: YesNo;
}

interface SenderData {
  chatId: string;
  sender: string;
  chatName?: string;
  senderName?: string;
}

interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
  fileMessageData?: { caption?: string; fileName?: string };
}

export interface MessageWebhook {
  typeWebhook: 'incomingMessageReceived' | 'outgoingMessageReceived' | 'outgoingAPIMessageReceived';
  idMessage: string;
  timestamp: number;
  senderData: SenderData;
  messageData: MessageData;
}

export interface StatusWebhook {
  typeWebhook: 'outgoingMessageStatus';
  idMessage: string;
  chatId: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup';
}

export type Webhook = MessageWebhook | StatusWebhook | { typeWebhook: string };

export interface Notification {
  receiptId: number;
  body: Webhook;
}
