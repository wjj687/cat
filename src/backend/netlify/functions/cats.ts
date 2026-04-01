/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, desc } from 'drizzle-orm';
import { getDb } from '../../src/lib/db.js';
import { myCatProfiles, encounters } from '../../src/db/schema.js';
import { NotFoundError } from '../../src/lib/errors.js';
import type { MyCatProfile, Encounter } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleCats(context: RequestContext): Promise<MyCatProfile[]> {
  const db = getDb();
  const { userId } = context;

  const profiles = await db
    .select()
    .from(myCatProfiles)
    .where(eq(myCatProfiles.userId, userId))
    .orderBy(desc(myCatProfiles.lastEncounterDate));

  return profiles.map(profile => ({
    id: profile.id,
    nickname: profile.nickname,
    breed: profile.breed as MyCatProfile['breed'],
    firstEncounterDate: profile.firstEncounterDate?.toISOString() || '',
    lastEncounterDate: profile.lastEncounterDate?.toISOString() || '',
    encounterCount: profile.encounterCount,
    favoriteSpot: profile.favoriteSpot || '',
    personalityTags: profile.personalityTags || [],
    photoUrl: profile.photoUrl || '',
    intimacyLevel: profile.intimacyLevel,
  }));
}

export async function handleCatDetail(
  id: string,
  context: RequestContext
): Promise<MyCatProfile> {
  const db = getDb();
  const { userId } = context;

  // Get cat profile
  const [profile] = await db
    .select()
    .from(myCatProfiles)
    .where(eq(myCatProfiles.id, id))
    .limit(1);

  if (!profile || profile.userId !== userId) {
    throw new NotFoundError('Cat profile');
  }

  // Get associated encounters
  const catEncounters = await db
    .select()
    .from(encounters)
    .where(eq(encounters.catId, id))
    .orderBy(desc(encounters.createdAt));

  const mappedEncounters: Encounter[] = catEncounters.map(e => ({
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
    id: profile.id,
    nickname: profile.nickname,
    breed: profile.breed as MyCatProfile['breed'],
    firstEncounterDate: profile.firstEncounterDate?.toISOString() || '',
    lastEncounterDate: profile.lastEncounterDate?.toISOString() || '',
    encounterCount: profile.encounterCount,
    favoriteSpot: profile.favoriteSpot || '',
    personalityTags: profile.personalityTags || [],
    photoUrl: profile.photoUrl || '',
    intimacyLevel: profile.intimacyLevel,
    encounters: mappedEncounters,
  };
}
