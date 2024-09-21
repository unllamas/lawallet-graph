'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { formatNumber } from '@/lib/utils';

const chartConfig = {
  visitors: {
    label: 'Volume',
  },
  // internal: {
  //   label: 'Internal',
  //   color: 'hsl(var(--chart-3))',
  // },
  inbound: {
    label: 'Inbound',
    color: 'hsl(var(--chart-2))',
  },
  outbound: {
    label: 'Outbound',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function VolumeTransactionsChart(props: { data: any; timeRange: string }) {
  const { data, timeRange } = props;

  const filteredData = data?.filter((item: { date: string | number | Date }) => {
    const date = new Date(item.date);
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    now.setDate(now.getDate() - daysToSubtract);
    return date >= now;
  });

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle>Volumen</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={filteredData}>
            <defs>
              {/* <linearGradient id='fillInternal' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-internal)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-internal)' stopOpacity={0.1} />
              </linearGradient> */}
              <linearGradient id='fillInbound' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-inbound)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-inbound)' stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='fillOutbound' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-outbound)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-outbound)' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => {
                    const amount = formatNumber(Number((Number(value) / 10000000000).toFixed(2)));
                    return (
                      <div className='flex gap-2'>
                        <p className='pr-2 bg-red-500'>
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                        </p>
                        <div className='flex gap-2'>
                          <p>{amount}</p>
                          <p className='ml-1 text-xs text-muted-foreground'>BTC</p>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Area dataKey='inbound' type='natural' fill='url(#fillInbound)' stroke='var(--color-inbound)' stackId='a' />
            {/* <Area
              dataKey='internal'
              type='natural'
              fill='url(#fillInternal)'
              stroke='var(--color-internal)'
              stackId='a'
            /> */}
            <Area
              dataKey='outbound'
              type='natural'
              fill='url(#fillOutbound)'
              stroke='var(--color-outbound)'
              stackId='a'
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
