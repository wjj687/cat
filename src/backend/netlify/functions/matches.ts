/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { findPotentialMatches, acceptMatch, rejectMatch } from '../../src/services/matching.js';
import { matchSuggestSchema, matchResolveSchema } from '../../src/lib/validation.js';
import { ValidationError, NotFoundError } from '../../src/lib/errors.js';
import type { PossibleMatch } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleMatchSuggest(
  body: unknown,
  context: RequestContext
): Promise<PossibleMatch[]> {
  // Validate input
  const validation = matchSuggestSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError('Invalid match suggest request', validation.error.format());
  }

  const { encounterId } = validation.data;
  const { userId } = context;

  // Find potential matches
  const matches = await findPotentialMatches(encounterId, userId);

  return matches;
}

export async function handleMatchResolve(
  matchId: string,
  body: unknown,
  context: RequestContext
): Promise<{ success: boolean }> {
  // Validate input
  const validation = matchResolveSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError('Invalid match resolve request', validation.error.format());
  }

  const { action } = validation.data;
  const { userId } = context;

  // Parse matchId to extract encounterId and suggestedCatId
  // Format: m_{encounterId}_{catId}_{index}
  const parts = matchId.split('_');
  if (parts.length < 3) {
    throw new ValidationError('Invalid match ID format');
  }

  const encounterId = parts[1];
  const suggestedCatId = parts[2];

  if (action === 'accept') {
    await acceptMatch(encounterId, suggestedCatId, userId);
  } else {
    await rejectMatch(encounterId, suggestedCatId);
  }

  return { success: true };
}
