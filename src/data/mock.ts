/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Encounter, MyCatProfile, DexEntry, KnowledgeCard } from '../types/domain';

export const MOCK_ENCOUNTERS: Encounter[] = [
  {
    id: 'e1',
    nickname: '麻糬 (Mochi)',
    breed: '三花猫',
    location: '阳光庭院',
    notes: '她对阳光中舞动的尘埃非常感兴趣。她让我摸了三秒钟的耳朵，不多不少。',
    personality: '活泼',
    timestamp: '2023-10-24T08:45:00Z',
    photoUrl: 'https://picsum.photos/seed/mochi/800/1000',
    weather: '晴朗',
  },
  {
    id: 'e2',
    nickname: '肉桂 (Cinnamon)',
    breed: '橘色虎斑',
    location: '书角小站',
    notes: '发现这一只正睡在初版书堆上。他甚至没正眼瞧我。真是一位冥想大师。',
    personality: '想睡',
    timestamp: '2023-10-24T05:30:00Z',
    photoUrl: 'https://picsum.photos/seed/cinnamon/800/1000',
    weather: '多云',
  },
  {
    id: 'e3',
    nickname: '月亮 (Luna)',
    breed: '黑猫',
    location: '花园栅栏',
    notes: 'Luna 又在花园栅栏旁等着了。她让我挠了整整一分钟的耳朵才悠哉游哉地走开。',
    personality: '高冷',
    timestamp: '2023-10-21T17:20:00Z',
    photoUrl: 'https://picsum.photos/seed/luna/800/1000',
    weather: '下雨',
  },
];

export const MOCK_MY_CATS: MyCatProfile[] = [
  {
    id: 'c1',
    nickname: '麻糬 (Mochi)',
    breed: '三花猫',
    firstEncounterDate: '2023-09-15',
    lastEncounterDate: '2023-10-24',
    encounterCount: 12,
    favoriteSpot: '阳光庭院',
    personalityTags: ['活泼', '好奇', '亲人'],
    photoUrl: 'https://picsum.photos/seed/mochi/800/1000',
    intimacyLevel: 4,
  },
  {
    id: 'c2',
    nickname: '肉桂 (Cinnamon)',
    breed: '橘色虎斑',
    firstEncounterDate: '2023-10-01',
    lastEncounterDate: '2023-10-24',
    encounterCount: 5,
    favoriteSpot: '书角小站',
    personalityTags: ['想睡', '哲学', '冷静'],
    photoUrl: 'https://picsum.photos/seed/cinnamon/800/1000',
    intimacyLevel: 2,
  },
];

export const MOCK_DEX: DexEntry[] = [
  {
    id: 'd1',
    breed: '三花猫',
    description: '三花猫是指被毛通常有 25% 到 75% 的白色，并带有大片橙色和黑色斑块的家猫。',
    rarity: 'Common',
    isDiscovered: true,
    discoveryCount: 3,
    funFact: '几乎所有的三花猫都是雌性，因为毛色与 X 染色体相关。',
    photoUrl: 'https://picsum.photos/seed/calico-dex/800/1000',
  },
  {
    id: 'd2',
    breed: '橘色虎斑',
    description: '橘色虎斑不是一个品种，而是一种被毛图案。它们以橙色、红色或黄色的被毛而闻名。',
    rarity: 'Common',
    isDiscovered: true,
    discoveryCount: 8,
    funFact: '大约 80% 的橘色虎斑猫是雄性。',
    photoUrl: 'https://picsum.photos/seed/ginger-dex/800/1000',
  },
  {
    id: 'd3',
    breed: '暹罗猫',
    description: '亚洲最早被明确认可的猫品种之一。它们以重点色被毛和蓝眼睛而闻名。',
    rarity: 'Rare',
    isDiscovered: false,
    discoveryCount: 0,
    funFact: '暹罗猫幼崽出生时完全是白色的，随着成长会逐渐显现重点色。',
    photoUrl: 'https://picsum.photos/seed/siamese-dex/800/1000',
  },
];

export const MOCK_KNOWLEDGE: KnowledgeCard[] = [
  {
    id: 'k1',
    title: 'Why do cats purr?',
    content: 'Cats purr not only when they are happy but also when they are stressed or in pain, as the frequency of the purr can help with healing.',
    category: 'Behavior',
  },
  {
    id: 'k2',
    title: 'The "Slow Blink"',
    content: 'A slow blink is a sign of trust and affection. If a cat slow blinks at you, try doing it back to show you are not a threat.',
    category: 'Behavior',
  },
];
