/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, ne, sql } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { encounters, myCatProfiles, possibleMatches } from '../db/schema.js';
import type { PossibleMatch } from '../types/index.js';
import { logger } from '../lib/logger.js';

/**
 * Matching service for suggesting possible same-cat matches.
 * V1 uses a simple breed + location similarity algorithm.
 * Future versions could use image embeddings for visual similarity.
 */

interface MatchCandidate {
  catId: string;
  nickname: string;
  breed: string;
  location: string | null;
  encounterCount: number;
  lastEncounterDate: Date | null;
}

interface MatchScore {
  catId: string;
  confidence: number;
  reason: string;
}

/**
 * Find potential matching cat profiles for a given encounter.
 */
export async function findPotentialMatches(
  encounterId: string,
  userId: string
): Promise<PossibleMatch[]> {
  const db = getDb();

  // Get the encounter details
  const [encounter] = await db
    .select()
    .from(encounters)
    .where(and(
      eq(encounters.id, encounterId),
      eq(encounters.userId, userId)
    ))
    .limit(1);

  if (!encounter) {
    logger.warn('Encounter not found for matching', { encounterId });
    return [];
  }

  // Get all cat profiles for this user (excluding ones already linked)
  const existingCatId = encounter.catId;
  const catProfiles = await db
    .select({
      catId: myCatProfiles.id,
      nickname: myCatProfiles.nickname,
      breed: myCatProfiles.breed,
      location: myCatProfiles.favoriteSpot,
      encounterCount: myCatProfiles.encounterCount,
      lastEncounterDate: myCatProfiles.lastEncounterDate,
    })
    .from(myCatProfiles)
    .where(and(
      eq(myCatProfiles.userId, userId),
      existingCatId ? ne(myCatProfiles.id, existingCatId) : undefined
    ));

  if (catProfiles.length === 0) {
    logger.info('No existing cat profiles to match against', { encounterId, userId });
    return [];
  }

  // Score each potential match
  const scoredMatches = scoreMatches(encounter, catProfiles);

  // Filter to reasonable confidence threshold and sort
  const filteredMatches = scoredMatches
    .filter(m => m.confidence >= 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3); // Top 3 suggestions

  // Create PossibleMatch objects
  const results: PossibleMatch[] = filteredMatches.map((match, index) => ({
    id: `m_${encounterId}_${match.catId}_${index}`,
    currentEncounterId: encounterId,
    suggestedCatId: match.catId,
    confidence: match.confidence,
    reason: match.reason,
    status: 'pending',
  }));

  logger.info('Generated match suggestions', { 
    encounterId, 
    suggestionsCount: results.length,
    topConfidence: results[0]?.confidence 
  });

  return results;
}

/**
 * Score potential matches based on multiple factors.
 */
function scoreMatches(
  encounter: { breed: string; location: string | null; nickname: string },
  catProfiles: MatchCandidate[]
): MatchScore[] {
  return catProfiles.map(cat => {
    let score = 0;
    const reasons: string[] = [];

    // Breed match (strong signal)
    if (cat.breed === encounter.breed) {
      score += 0.5;
      reasons.push(`同为${cat.breed}`);
    }

    // Location similarity (medium signal)
    if (encounter.location && cat.location) {
      const locationSimilarity = calculateLocationSimilarity(encounter.location, cat.location);
      if (locationSimilarity > 0.7) {
        score += 0.3;
        reasons.push(`常出现在相似的地点 (${cat.location})`);
      } else if (locationSimilarity > 0.4) {
        score += 0.15;
        reasons.push(`活动地点相近`);
      }
    }

    // Nickname similarity (weak signal, but nice to have)
    const nicknameSimilarity = calculateStringSimilarity(
      encounter.nickname.toLowerCase(),
      cat.nickname.toLowerCase()
    );
    if (nicknameSimilarity > 0.8) {
      score += 0.1;
      reasons.push('昵称相似');
    }

    // Frequency bonus (cats seen more often are more likely to be recognized)
    if (cat.encounterCount >= 5) {
      score += 0.05;
    }

    // Cap at 0.95 to indicate uncertainty
    const confidence = Math.min(Math.round(score * 100) / 100, 0.95);

    return {
      catId: cat.catId,
      confidence,
      reason: reasons.length > 0 
        ? `与 ${cat.nickname} 的${reasons.join('、')}`
        : `可能是 ${cat.nickname} 的另一次记录`,
    };
  });
}

/**
 * Calculate simple string similarity (Jaccard index on character bigrams).
 */
function calculateStringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const getBigrams = (str: string): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.slice(i, i + 2));
    }
    return bigrams;
  };

  const aBigrams = getBigrams(a);
  const bBigrams = getBigrams(b);

  const intersection = new Set([...aBigrams].filter(x => bBigrams.has(x)));
  const union = new Set([...aBigrams, ...bBigrams]);

  return intersection.size / union.size;
}

/**
 * Calculate location similarity (simple substring matching).
 */
function calculateLocationSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8;

  // Check for common words
  const aWords = aLower.split(/\s+/);
  const bWords = bLower.split(/\s+/);
  const commonWords = aWords.filter(w => bWords.includes(w));
  
  return commonWords.length / Math.max(aWords.length, bWords.length);
}

/**
 * Accept a match suggestion and link the encounter to the cat profile.
 */
export async function acceptMatch(
  encounterId: string,
  suggestedCatId: string,
  userId: string
): Promise<void> {
  const db = getDb();

  // Update the encounter to link to the cat profile
  await db
    .update(encounters)
    .set({ catId: suggestedCatId })
    .where(and(
      eq(encounters.id, encounterId),
      eq(encounters.userId, userId)
    ));

  // Update the match status
  await db
    .update(possibleMatches)
    .set({ status: 'accepted' })
    .where(and(
      eq(possibleMatches.encounterId, encounterId),
      eq(possibleMatches.suggestedCatId, suggestedCatId)
    ));

  logger.info('Match accepted', { encounterId, suggestedCatId });
}

/**
 * Reject a match suggestion.
 */
export async function rejectMatch(
  encounterId: string,
  suggestedCatId: string
): Promise<void> {
  const db = getDb();

  await db
    .update(possibleMatches)
    .set({ status: 'rejected' })
    .where(and(
      eq(possibleMatches.encounterId, encounterId),
      eq(possibleMatches.suggestedCatId, suggestedCatId)
    ));

  logger.info('Match rejected', { encounterId, suggestedCatId });
}
