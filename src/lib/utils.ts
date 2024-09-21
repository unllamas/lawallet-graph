import { NormalizedTransaction, Transaction, TransactionType } from '@/types';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const secondsAgo = Math.floor((now - timestamp * 1000) / 1000);

  const minutes = Math.floor(secondsAgo / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (secondsAgo < 60) {
    return 'now';
  } else if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else if (days < 7) {
    return `${days}d`;
  } else {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year === currentYear) {
      return `${day} ${month}`;
    } else {
      return `${day} ${month} ${year}`;
    }
  }
}

export const isObjectEmpty = (objectName: any) => {
  return Object.keys(objectName).length === 0;
};

export function formatNumber(num: number): string {
  // Convertir el número a una cadena de texto
  let numStr = Math.abs(num).toString();

  // Separar la parte entera de la decimal (si existe)
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Formatear la parte entera
  const regex = /\B(?=(\d{3})+(?!\d))/g;
  integerPart = integerPart.replace(regex, '.');

  // Reconstruir el número con la parte decimal (si existe)
  numStr = integerPart + (decimalPart ? ',' + decimalPart : '');

  // Añadir el signo negativo si es necesario
  return num < 0 ? '-' + numStr : numStr;
}

// Función auxiliar para obtener la fecha formateada
export const getFormattedDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString().split('T')[0];
};

// Función auxiliar para obtener el tipo de transacción
export const getTransactionType = (transaction: Transaction): TransactionType | undefined => {
  const type = transaction.tags.find((tag) => tag[0] === 't')?.[1];
  if (type?.includes('internal')) return 'internal';
  if (type?.includes('inbound')) return 'inbound';
  if (type?.includes('outbound')) return 'outbound';
  return undefined;
};

// Estrategia para contar transacciones
export const countStrategy = (acc: number) => acc + 1;

// Estrategia para sumar volúmenes
export const volumeStrategy = (acc: number, transaction: NDKEvent) => {
  const amount = JSON.parse(transaction.content).tokens.BTC;
  return acc + amount;
};

// Función genérica para normalizar transacciones
export const normalizeTransactions = (data: any, strategy: any) => {
  const byDate: Record<string, NormalizedTransaction> = {};

  data.forEach((transaction: any) => {
    const date = getFormattedDate(transaction.created_at);
    const type = getTransactionType(transaction);

    if (!byDate[date]) {
      byDate[date] = { date, internal: 0, inbound: 0, outbound: 0 };
    }

    if (type) {
      byDate[date][type] = strategy(byDate[date][type], transaction);
    }
  });

  return Object.values(byDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
