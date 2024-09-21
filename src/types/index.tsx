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
