'use client';

import React, { useMemo, useState } from 'react';

import fetcher from '@/config/fetcher';
import useSWR from 'swr';
import { Note } from '@/types';
import { timeAgo } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionsChart } from './components/transactions-chart';

export function LivePage() {
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'inbound' | 'outbound' | 'internal'>('all');

  const { data: transactions, error } = useSWR<Note[]>('/api/transactions', fetcher, {
    refreshInterval: 5000, // Refrescar cada 5 segundos
  });

  const largestTransaction = useMemo(() => {
    if (!transactions) return 0;
    return Math.max(...transactions.map((t: Note) => t.content.tokens.BTC));
  }, [transactions]);

  const errorRate = useMemo(() => {
    if (!transactions) return 0;
    const errorTransactions = transactions.filter((t: Note) => t.type.includes('error'));
    return (errorTransactions.length / transactions.length) * 100;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((tx) => {
      if (transactionFilter === 'all') return true;
      return tx.type.startsWith(transactionFilter);
    });
  }, [transactions, transactionFilter]);

  if (error) return <div>Error al cargar los datos</div>;
  if (!transactions) return <div>Cargando...</div>;

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Transacciones en Vivo</h1>
      </div>

      <div className='flex gap-4 mb-4'>
        <Card className='flex-1'>
          <CardHeader>
            <CardDescription>Total de Transacciones</CardDescription>
            <CardTitle>{transactions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='flex-1'>
          <CardHeader>
            <CardDescription>Transacción Más Grande</CardDescription>
            <CardTitle>{(largestTransaction / 1000).toFixed(0)} SAT</CardTitle>
          </CardHeader>
        </Card>
        <Card className='flex-1'>
          <CardHeader>
            <CardDescription>Tasa de Error</CardDescription>
            <CardTitle>{errorRate.toFixed(2)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className='mb-4'>
        <TransactionsChart transactions={transactions} />
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Últimas Transacciones</CardTitle>
          <Select value={transactionFilter} onValueChange={(value: any) => setTransactionFilter(value)}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filtrar por tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas</SelectItem>
              <SelectItem value='inbound'>Entrantes</SelectItem>
              <SelectItem value='outbound'>Salientes</SelectItem>
              <SelectItem value='internal'>Internas</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad (SAT)</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions?.map((tx: Note) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id.slice(0, 8)}...</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{(tx.content.tokens.BTC / 1000).toFixed(0)}</TableCell>
                  <TableCell>{timeAgo(tx.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
