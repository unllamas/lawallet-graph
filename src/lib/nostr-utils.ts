import NDK, { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';

import { RELAYS } from '@/config/constants';

export const ndk = new NDK({ explicitRelayUrls: RELAYS });

/**
 * Connects to NDK
 * @returns Connected NDK instance
 */
export async function connectToNDK(): Promise<NDK> {
  await ndk.connect();

  return ndk;
}

export async function fetchNostrEvent(filter: NDKFilter): Promise<NDKEvent | null> {
  const ndk = await connectToNDK();
  const event = await ndk.fetchEvent(filter);

  return event || null;
}

export async function fetchNostrEvents(filter: NDKFilter): Promise<NDKEvent[]> {
  const ndk = await connectToNDK();
  const events = await ndk.fetchEvents(filter);

  return Array.from(events);
}

export function extractSafeEventData(event: NDKEvent) {
  // const parsedContent = JSON.parse(event.content);
  return {
    id: event.id,
    pubkey: event.pubkey,
    kind: event.kind,
    content: event.content,
    created_at: event.created_at,
    tags: event.tags,
  };
}
