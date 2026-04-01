/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDb } from '../lib/db.js';
import { dexEntries, knowledgeCards } from './schema.js';

/**
 * Seed static/reference data for the application.
 * Run this after migrations to populate dex entries and knowledge cards.
 */

const dexSeedData = [
  {
    breed: '三花猫',
    description: '三花猫是指被毛通常有 25% 到 75% 的白色，并带有大片橙色和黑色斑块的家猫。',
    rarity: 'Common' as const,
    funFact: '几乎所有的三花猫都是雌性，因为毛色与 X 染色体相关。',
    photoUrl: 'https://picsum.photos/seed/calico-dex/800/1000',
  },
  {
    breed: '橘色虎斑',
    description: '橘色虎斑不是一个品种，而是一种被毛图案。它们以橙色、红色或黄色的被毛而闻名。',
    rarity: 'Common' as const,
    funFact: '大约 80% 的橘色虎斑猫是雄性。',
    photoUrl: 'https://picsum.photos/seed/ginger-dex/800/1000',
  },
  {
    breed: '暹罗猫',
    description: '亚洲最早被明确认可的猫品种之一。它们以重点色被毛和蓝眼睛而闻名。',
    rarity: 'Rare' as const,
    funFact: '暹罗猫幼崽出生时完全是白色的，随着成长会逐渐显现重点色。',
    photoUrl: 'https://picsum.photos/seed/siamese-dex/800/1000',
  },
  {
    breed: '燕尾服猫',
    description: '燕尾服猫是指具有黑白双色被毛的猫，看起来像穿着正式的燕尾服。',
    rarity: 'Common' as const,
    funFact: '燕尾服猫在许多文化中被认为是好运的象征。',
    photoUrl: 'https://picsum.photos/seed/tuxedo-dex/800/1000',
  },
  {
    breed: '黑猫',
    description: '全黑色的猫，在许多文化中具有神秘色彩。',
    rarity: 'Uncommon' as const,
    funFact: '在日本，黑猫被认为是带来好运和繁荣的象征。',
    photoUrl: 'https://picsum.photos/seed/black-dex/800/1000',
  },
  {
    breed: '白猫',
    description: '全白色的猫，通常有蓝色或金色的眼睛。',
    rarity: 'Uncommon' as const,
    funFact: '蓝眼睛的白猫中有 60-80% 是聋子。',
    photoUrl: 'https://picsum.photos/seed/white-dex/800/1000',
  },
  {
    breed: '灰猫',
    description: '灰色的猫，毛色从浅灰到深炭灰不等。',
    rarity: 'Common' as const,
    funFact: '俄罗斯蓝猫是最著名的灰猫品种之一。',
    photoUrl: 'https://picsum.photos/seed/gray-dex/800/1000',
  },
  {
    breed: '未知品种',
    description: '无法确定具体品种的猫咪，每一只都是独特的！',
    rarity: 'Legendary' as const,
    funFact: '混种猫通常比纯种猫更健康，寿命更长。',
    photoUrl: 'https://picsum.photos/seed/unknown-dex/800/1000',
  },
];

const knowledgeSeedData = [
  {
    title: 'Why do cats purr?',
    content: 'Cats purr not only when they are happy but also when they are stressed or in pain, as the frequency of the purr can help with healing.',
    category: 'Behavior' as const,
  },
  {
    title: 'The "Slow Blink"',
    content: 'A slow blink is a sign of trust and affection. If a cat slow blinks at you, try doing it back to show you are not a threat.',
    category: 'Behavior' as const,
  },
  {
    title: 'Cats and Water',
    content: 'Most cats dislike water because their fur doesn\'t insulate well when wet. However, some breeds like Turkish Van actually love swimming!',
    category: 'Fun Fact' as const,
  },
  {
    title: 'Whisker Fatigue',
    content: 'Cats can experience whisker fatigue from deep food bowls. Use shallow dishes to prevent stress on their sensitive whiskers.',
    category: 'Health' as const,
  },
  {
    title: 'Napping Champions',
    content: 'Cats sleep 12-16 hours a day on average. This conserves energy for hunting - even if the only thing they hunt is a toy mouse!',
    category: 'Fun Fact' as const,
  },
  {
    title: 'Catnip Sensitivity',
    content: 'About 50-70% of cats are affected by catnip. The response is hereditary - if a cat\'s parents liked catnip, they probably will too.',
    category: 'Behavior' as const,
  },
  {
    title: 'Hydration Matters',
    content: 'Cats have a low thirst drive and get most moisture from food. Wet food can help prevent kidney and urinary issues.',
    category: 'Health' as const,
  },
  {
    title: 'Tail Language',
    content: 'A straight-up tail with a hook at the end means your cat is happy to see you. It\'s like a friendly wave!',
    category: 'Behavior' as const,
  },
];

export async function seed() {
  const db = getDb();

  console.log('🌱 Starting database seed...');

  // Seed dex entries
  console.log('📚 Seeding dex entries...');
  for (const entry of dexSeedData) {
    try {
      await db.insert(dexEntries).values({
        id: `dex_${entry.breed.replace(/\s+/g, '_').toLowerCase()}`,
        ...entry,
      }).onConflictDoNothing({
        target: dexEntries.breed,
      });
    } catch (error) {
      console.warn(`Failed to seed dex entry for ${entry.breed}:`, error);
    }
  }

  // Seed knowledge cards
  console.log('🎓 Seeding knowledge cards...');
  for (let i = 0; i < knowledgeSeedData.length; i++) {
    const card = knowledgeSeedData[i];
    try {
      await db.insert(knowledgeCards).values({
        id: `k_${i + 1}`,
        ...card,
      }).onConflictDoNothing({
        target: knowledgeCards.id,
      });
    } catch (error) {
      console.warn(`Failed to seed knowledge card ${card.title}:`, error);
    }
  }

  console.log('✅ Database seed completed!');
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
