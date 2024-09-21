'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { countStrategy, formatNumber, normalizeTransactions, timeAgo, volumeStrategy } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArrowDown from '@/components/icons/arrow-down';
import ArrowUp from '@/components/icons/arrow-up';

import { CountTransactionsChart } from './components/count-transactions-chart';
import { VolumeTransactionsChart } from './components/volume-transactions-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import fetcher from '@/config/fetcher';

type TransactionType = 'all' | 'inbound' | 'internal' | 'outbound';
type TimeRange = '90d' | '30d' | '7d';

export function HomePage() {
  const [currency] = useState('SAT');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [transactionType, setTransactionType] = useState<TransactionType>('all');

  const { data: transactions } = useSWR('/api', fetcher);

  // Memoizar el filtrado de transacciones
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions?.filter((tx: any) => {
      const txType = tx.tags.find((tag: any) => tag[0] === 't')?.[1];
      return transactionType === 'all' || txType?.startsWith(transactionType);
    });
  }, [transactionType, transactions]);

  // Memoizar cálculos costosos
  const totalTransactionVolume = useMemo(() => {
    return filteredTransactions.reduce((total: any, transaction: { content: string }) => {
      const amount = JSON.parse(transaction.content).tokens.BTC;
      return total + amount;
    }, 0);
  }, [filteredTransactions]);

  const totalTransactions = useMemo(() => filteredTransactions.length, [filteredTransactions]);

  const normalizedTransactionData = useMemo(
    () => normalizeTransactions(filteredTransactions, countStrategy),
    [filteredTransactions],
  );

  const normalizedTransactionVolume = useMemo(
    () => normalizeTransactions(filteredTransactions, volumeStrategy),
    [filteredTransactions],
  );

  const top5Transactions = useMemo(() => {
    return filteredTransactions
      .filter((transaction: { tags: any[] }) => {
        const transactionType = transaction.tags.find((tag) => tag[0] === 't')?.[1];
        return !transactionType?.includes('internal');
      })
      .map((transaction) => {
        const btcAmount = JSON.parse(transaction.content).tokens.BTC;
        const transactionType = transaction.tags.find((tag: any) => tag[0] === 't')?.[1];

        return {
          id: transaction?.id,
          type: transactionType,
          amount: btcAmount,
          created_at: transaction.created_at,
        };
      })
      .sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className='container p-4'>
      <div className='flex justify-between'>
        <h1 className='text-2xl font-bold mb-4'>LaWallet Dashboard</h1>
        <div className='flex gap-2'>
          <Select value={transactionType} onValueChange={(value: TransactionType) => setTransactionType(value)}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              <SelectItem value='inbound'>Inbound</SelectItem>
              <SelectItem value='outbound'>Outbound</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className='w-[160px] rounded-lg sm:ml-auto' aria-label='Select a value'>
              <SelectValue placeholder='Last 3 months' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='7d' className='rounded-lg'>
                Last 7 days
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                Last 30 days
              </SelectItem>
              <SelectItem value='90d' className='rounded-lg'>
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex gap-4 mb-4'>
        <Card className='flex-1'>
          <CardHeader className='p-6'>
            <CardDescription>Total de cuentas</CardDescription>
            <CardTitle>{formatNumber(NaN)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='flex-1'>
          <CardHeader className='p-6'>
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle>{formatNumber(totalTransactions)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='flex-1'>
          <CardHeader className='p-6'>
            <CardDescription>Total Volume ({currency})</CardDescription>
            <CardTitle>{formatNumber(Number((totalTransactionVolume / 1000).toFixed(0)))}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className='flex gap-4 mb-4'>
        <CountTransactionsChart data={normalizedTransactionData} timeRange={timeRange} />
        <VolumeTransactionsChart data={normalizedTransactionVolume} timeRange={timeRange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[500px]'></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top5Transactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {tx.type === 'inbound-transaction-ok' ? (
                      <ArrowDown color='text-green-500' className='size-4 text-green-500' />
                    ) : (
                      <ArrowUp className='size-4' />
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>{tx.id}</TableCell>
                  <TableCell>{timeAgo(tx.created_at)}</TableCell>
                  <TableCell className='text-right'>{formatNumber(Number((tx.amount / 1000).toFixed(0)))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
