/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { getDb } from '../../src/lib/db.js';
import { knowledgeCards } from '../../src/db/schema.js';
import { NotFoundError } from '../../src/lib/errors.js';
import type { KnowledgeCard } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleKnowledgeCard(
  id: string,
  context: RequestContext
): Promise<KnowledgeCard> {
  const db = getDb();

  const [card] = await db
    .select()
    .from(knowledgeCards)
    .where(eq(knowledgeCards.id, id))
    .limit(1);

  if (!card) {
    throw new NotFoundError('Knowledge card');
  }

  return {
    id: card.id,
    title: card.title,
    content: card.content,
    category: card.category as KnowledgeCard['category'],
  };
}
