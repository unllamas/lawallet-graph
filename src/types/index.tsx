export type Transaction = {
  created_at: number;
  tags: [string, string][];
  content: string;
};

export type NormalizedTransaction = {
  date: string;
  internal: number;
  inbound: number;
  outbound: number;
};

export type TransactionType = 'internal' | 'inbound' | 'outbound';

export type TransactionTypes =
  | 'internal-transaction-start'
  | 'inbound-transaction-start'
  | 'internal-transaction-ok'
  | 'internal-transaction-error'
  | 'inbound-transaction-ok'
  | 'inbound-transaction-error'
  | 'outbound-transaction-ok'
  | 'outbound-transaction-error';

export interface Note {
  id: string;
  type: TransactionTypes;
  pubkey: string;
  content: any;
  created_at: number;
  tags: string[][];
}
