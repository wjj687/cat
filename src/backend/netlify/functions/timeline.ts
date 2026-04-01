/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, desc, and } from 'drizzle-orm';
import { getDb } from '../../src/lib/db.js';
import { encounters } from '../../src/db/schema.js';
import { timelineQuerySchema } from '../../src/lib/validation.js';
import { ValidationError } from '../../src/lib/errors.js';
import type { Encounter, PaginationMeta } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleTimeline(
  query: Record<string, string>,
  context: RequestContext
): Promise<{ encounters: Encounter[]; pagination: PaginationMeta }> {
  const db = getDb();
  const { userId } = context;

  // Validate query params
  const validation = timelineQuerySchema.safeParse(query);
  if (!validation.success) {
    throw new ValidationError('Invalid query parameters', validation.error.format());
  }

  const { limit, offset, catId } = validation.data;

  // Build query
  let dbQuery = db
    .select()
    .from(encounters)
    .where(eq(encounters.userId, userId))
    .orderBy(desc(encounters.createdAt));

  if (catId) {
    dbQuery = db
      .select()
      .from(encounters)
      .where(and(
        eq(encounters.userId, userId),
        eq(encounters.catId, catId)
      ))
      .orderBy(desc(encounters.createdAt));
  }

  // Get total count
  const allEncounters = await dbQuery;
  const total = allEncounters.length;

  // Apply pagination
  const paginatedEncounters = allEncounters.slice(offset, offset + limit);

  const mappedEncounters: Encounter[] = paginatedEncounters.map(e => ({
    id: e.id,
    catId: e.catId || undefined,
    nickname: e.nickname,
    breed: e.breed as Encounter['breed'],
    location: e.location || '',
    notes: e.notes || '',
    personality: e.personality || '',
    timestamp: e.createdAt.toISOString(),
    photoUrl: e.photoUrl || '',
    weather: e.weather as Encounter['weather'] || undefined,
  }));

  return {
    encounters: mappedEncounters,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}
