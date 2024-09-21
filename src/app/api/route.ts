import transactions from '@/mock/100k.json';
import { NextResponse } from 'next/server';

export async function GET() {
  const txs = transactions;

  return NextResponse.json(txs);
}
