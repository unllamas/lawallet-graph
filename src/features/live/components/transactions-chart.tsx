'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';

export interface Transaction {
  id: string;
  type: string;
  pubkey: string;
  content: {
    tokens: {
      BTC: number;
    };
  };
  created_at: number;
  tags: string[][];
}

interface Props {
  transactions: Transaction[];
}

export function TransactionsChart({ transactions }: Props) {
  const transactionData = useMemo(() => {
    if (!transactions) return [];

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      totalValue: 0,
    }));

    transactions.forEach((t) => {
      const hour = new Date(t.created_at * 1000).getHours();
      hourlyData[hour].count += 1;
      hourlyData[hour].totalValue += t.content.tokens.BTC / 1000;
    });

    return hourlyData.map((data) => ({
      ...data,
      hour: `${data.hour.toString().padStart(2, '0')}:00`,
      totalValue: parseFloat(Number(data.totalValue).toFixed(8)),
    }));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border border-border p-2 rounded-md shadow-md'>
          <p className='text-sm font-medium'>{`${label} hs.`}</p>
          {payload[0].name === 'count' && <p className='text-sm'>{`Transacciones: ${payload[0].value}`}</p>}
          {payload[0].name === 'totalValue' && (
            <p className='text-sm'>{`Total: ${formatNumber(payload[0].value.toFixed(0))} SAT`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Transacciones por Hora</CardTitle>
        <CardDescription>Número de transacciones y valor total en BTC por hora del día</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='transactions'>
          <TabsList className='mb-4'>
            <TabsTrigger value='transactions'>Número de Transacciones</TabsTrigger>
            <TabsTrigger value='value'>Valor Total (SAT)</TabsTrigger>
          </TabsList>
          <TabsContent value='transactions' className='space-y-4'>
            <ResponsiveContainer width='100%' height={350}>
              <BarChart data={transactionData}>
                <XAxis dataKey='hour' stroke='#777f88' fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke='#777f88'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatNumber(value)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='count' fill='#adfa1d' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value='value' className='space-y-4'>
            <ResponsiveContainer width='100%' height={350}>
              <LineChart data={transactionData}>
                <XAxis dataKey='hour' stroke='#777f88' fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke='#777f88'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatNumber(value)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type='monotone' dataKey='totalValue' stroke='#adfa1d' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
