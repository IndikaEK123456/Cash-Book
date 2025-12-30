
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PAYPAL = 'PAYPAL'
}

export interface OutPartyEntry {
  id: string;
  date: string;
  cash: number;
  card: number;
  paypal: number;
}

export interface MainEntry {
  id: string;
  date: string;
  isCard: boolean;
  isPayPal: boolean;
  roomNo: string;
  description: string;
  cashIn: number;
  cashOut: number;
}

export interface AppState {
  outPartyEntries: OutPartyEntry[];
  mainEntries: MainEntry[];
  initialBalance: number;
}

export type DeviceView = 'LAPTOP' | 'ANDROID' | 'IPHONE';

export interface ExchangeRates {
  usdToLkr: number;
  eurToLkr: number;
}
