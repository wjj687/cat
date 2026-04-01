/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, desc, and } from 'drizzle-orm';
import { getDb } from '../../src/lib/db.js';
import { encounters, myCatProfiles, userDexDiscoveries, dexEntries } from '../../src/db/schema.js';
import { 
  createEncounterSchema, 
  updateEncounterSchema,
  timelineQuerySchema,
  type TimelineQueryInput 
} from '../../src/lib/validation.js';
import { ValidationError, NotFoundError } from '../../src/lib/errors.js';
import { logger } from '../../src/lib/logger.js';
import type { Encounter, PaginationMeta } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleEncounters(
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

export async function handleCreateEncounter(
  body: unknown,
  context: RequestContext
): Promise<Encounter> {
  const db = getDb();
  const { userId } = context;

  // Validate input
  const validation = createEncounterSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError('Invalid encounter data', validation.error.format());
  }

  const data = validation.data;

  // Create encounter
  const [encounter] = await db
    .insert(encounters)
    .values({
      id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      catId: data.suggestedCatId,
      nickname: data.nickname,
      breed: data.breed,
      location: data.location,
      notes: data.notes,
      personality: data.personality,
      weather: data.weather,
      photoUrl: data.photoUrl,
      recognitionConfidence: data.recognitionConfidence?.toString(),
    })
    .returning();

  // Update or create cat profile
  await updateCatProfile(userId, data.suggestedCatId, data);

  // Update dex discovery
  await updateDexDiscovery(userId, data.breed);

  logger.info('Created new encounter', { 
    encounterId: encounter.id, 
    userId, 
    breed: data.breed,
    catId: data.suggestedCatId 
  });

  return {
    id: encounter.id,
    catId: encounter.catId || undefined,
    nickname: encounter.nickname,
    breed: encounter.breed as Encounter['breed'],
    location: encounter.location || '',
    notes: encounter.notes || '',
    personality: encounter.personality || '',
    timestamp: encounter.createdAt.toISOString(),
    photoUrl: encounter.photoUrl || '',
    weather: encounter.weather as Encounter['weather'] || undefined,
  };
}

export async function handleEncounterDetail(
  id: string,
  body: unknown,
  context: RequestContext
): Promise<Encounter> {
  const db = getDb();
  const { userId } = context;

  // Validate input
  const validation = updateEncounterSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError('Invalid update data', validation.error.format());
  }

  const data = validation.data;

  // Check encounter exists and belongs to user
  const [existing] = await db
    .select()
    .from(encounters)
    .where(and(
      eq(encounters.id, id),
      eq(encounters.userId, userId)
    ))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Encounter');
  }

  // Update encounter
  const [updated] = await db
    .update(encounters)
    .set({
      nickname: data.nickname,
      location: data.location,
      notes: data.notes,
      personality: data.personality,
      weather: data.weather,
      catId: data.catId,
    })
    .where(eq(encounters.id, id))
    .returning();

  logger.info('Updated encounter', { encounterId: id, userId });

  return {
    id: updated.id,
    catId: updated.catId || undefined,
    nickname: updated.nickname,
    breed: updated.breed as Encounter['breed'],
    location: updated.location || '',
    notes: updated.notes || '',
    personality: updated.personality || '',
    timestamp: updated.createdAt.toISOString(),
    photoUrl: updated.photoUrl || '',
    weather: updated.weather as Encounter['weather'] || undefined,
  };
}

// Helper: Update or create cat profile
async function updateCatProfile(
  userId: string,
  existingCatId: string | undefined,
  data: { nickname: string; breed: string; location?: string; personality?: string; photoUrl: string }
): Promise<void> {
  const db = getDb();

  if (existingCatId) {
    // Update existing profile
    const [existing] = await db
      .select()
      .from(myCatProfiles)
      .where(eq(myCatProfiles.id, existingCatId))
      .limit(1);

    if (existing) {
      await db
        .update(myCatProfiles)
        .set({
          lastEncounterDate: new Date(),
          encounterCount: existing.encounterCount + 1,
          intimacyLevel: Math.min(existing.intimacyLevel + 1, 5),
          updatedAt: new Date(),
        })
        .where(eq(myCatProfiles.id, existingCatId));
      return;
    }
  }

  // Create new profile
  await db.insert(myCatProfiles).values({
    id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    nickname: data.nickname,
    breed: data.breed,
    firstEncounterDate: new Date(),
    lastEncounterDate: new Date(),
    encounterCount: 1,
    favoriteSpot: data.location,
    personalityTags: data.personality ? [data.personality] : [],
    photoUrl: data.photoUrl,
    intimacyLevel: 1,
  });
}

// Helper: Update dex discovery
async function updateDexDiscovery(userId: string, breed: string): Promise<void> {
  const db = getDb();

  // Find dex entry for this breed
  const [dexEntry] = await db
    .select()
    .from(dexEntries)
    .where(eq(dexEntries.breed, breed))
    .limit(1);

  if (!dexEntry) return;

  // Check if already discovered
  const [existing] = await db
    .select()
    .from(userDexDiscoveries)
    .where(and(
      eq(userDexDiscoveries.userId, userId),
      eq(userDexDiscoveries.dexEntryId, dexEntry.id)
    ))
    .limit(1);

  if (existing) {
    // Update discovery count
    await db
      .update(userDexDiscoveries)
      .set({
        discoveryCount: existing.discoveryCount + 1,
        lastDiscoveredAt: new Date(),
      })
      .where(eq(userDexDiscoveries.id, existing.id));
  } else {
    // Create new discovery
    await db.insert(userDexDiscoveries).values({
      id: `ud_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      dexEntryId: dexEntry.id,
      discoveryCount: 1,
    });
  }
}
