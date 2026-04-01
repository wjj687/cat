/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, sql } from 'drizzle-orm';
import { getDb } from '../../src/lib/db.js';
import { dexEntries, userDexDiscoveries } from '../../src/db/schema.js';
import { NotFoundError } from '../../src/lib/errors.js';
import type { DexEntry } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleDex(context: RequestContext): Promise<DexEntry[]> {
  const db = getDb();
  const { userId } = context;

  // Get all dex entries with user's discovery status
  const entries = await db
    .select({
      id: dexEntries.id,
      breed: dexEntries.breed,
      description: dexEntries.description,
      rarity: dexEntries.rarity,
      funFact: dexEntries.funFact,
      photoUrl: dexEntries.photoUrl,
      discoveryCount: sql<number>`COALESCE(${userDexDiscoveries.discoveryCount}, 0)`,
      firstDiscoveredAt: userDexDiscoveries.firstDiscoveredAt,
    })
    .from(dexEntries)
    .leftJoin(
      userDexDiscoveries,
      sql`${userDexDiscoveries.dexEntryId} = ${dexEntries.id} AND ${userDexDiscoveries.userId} = ${userId}`
    )
    .orderBy(dexEntries.rarity, dexEntries.breed);

  return entries.map(entry => ({
    id: entry.id,
    breed: entry.breed as DexEntry['breed'],
    description: entry.description,
    rarity: entry.rarity as DexEntry['rarity'],
    isDiscovered: entry.discoveryCount > 0,
    discoveryCount: entry.discoveryCount,
    funFact: entry.funFact || '',
    photoUrl: entry.photoUrl || '',
  }));
}

export async function handleDexEntry(
  id: string,
  context: RequestContext
): Promise<DexEntry> {
  const db = getDb();
  const { userId } = context;

  const [entry] = await db
    .select({
      id: dexEntries.id,
      breed: dexEntries.breed,
      description: dexEntries.description,
      rarity: dexEntries.rarity,
      funFact: dexEntries.funFact,
      photoUrl: dexEntries.photoUrl,
      discoveryCount: sql<number>`COALESCE(${userDexDiscoveries.discoveryCount}, 0)`,
    })
    .from(dexEntries)
    .leftJoin(
      userDexDiscoveries,
      sql`${userDexDiscoveries.dexEntryId} = ${dexEntries.id} AND ${userDexDiscoveries.userId} = ${userId}`
    )
    .where(eq(dexEntries.id, id))
    .limit(1);

  if (!entry) {
    throw new NotFoundError('Dex entry');
  }

  return {
    id: entry.id,
    breed: entry.breed as DexEntry['breed'],
    description: entry.description,
    rarity: entry.rarity as DexEntry['rarity'],
    isDiscovered: entry.discoveryCount > 0,
    discoveryCount: entry.discoveryCount,
    funFact: entry.funFact || '',
    photoUrl: entry.photoUrl || '',
  };
}
