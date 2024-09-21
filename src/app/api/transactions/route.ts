import { NextResponse } from 'next/server';
import { NDKFilter } from '@nostr-dev-kit/ndk';
import { fetchNostrEvents } from '@/lib/nostr-utils';
import { LEDGER } from '@/config/constants';
import { TransactionTypes, Note } from '@/types';

const transactionTypes: TransactionTypes[] = [
  'internal-transaction-ok',
  'internal-transaction-error',
  'inbound-transaction-ok',
  'inbound-transaction-error',
  'outbound-transaction-ok',
  'outbound-transaction-error',
];

export async function GET(): Promise<NextResponse<Note[] | any>> {
  try {
    const filter: NDKFilter = {
      kinds: [1112 as number],
      authors: [LEDGER],
      '#t': transactionTypes,
      limit: 100,
    };

    const events = await fetchNostrEvents(filter);

    const notes: Note[] = Array.from(events)?.map((event) => ({
      id: event?.id!,
      type: event?.tags.find((tag) => tag[0] === 't')?.[1] as TransactionTypes,
      pubkey: event?.pubkey,
      content: JSON.parse(event?.content),
      created_at: event?.created_at!,
      tags: event?.tags,
    }));

    // Sort notes from newest to oldest
    const sortedNotes = notes?.sort((a, b) => b?.created_at! - a?.created_at!);

    return NextResponse.json(sortedNotes);
  } catch (error) {
    console.error('Error fetching transactions:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
