/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CatBreed = '三花猫' | '橘色虎斑' | '暹罗猫' | '燕尾服猫' | '黑猫' | '白猫' | '灰猫' | '未知品种';

export interface Encounter {
  id: string;
  catId?: string;
  nickname: string;
  breed: CatBreed;
  location: string;
  notes: string;
  personality: string;
  timestamp: string;
  photoUrl: string;
  weather?: '晴朗' | '多云' | '下雨' | '寒冷';
}

export interface MyCatProfile {
  id: string;
  nickname: string;
  breed: CatBreed;
  firstEncounterDate: string;
  lastEncounterDate: string;
  encounterCount: number;
  favoriteSpot: string;
  personalityTags: string[];
  photoUrl: string;
  intimacyLevel: number; // 1-5
}

export interface DexEntry {
  id: string;
  breed: CatBreed;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  isDiscovered: boolean;
  discoveryCount: number;
  funFact: string;
  photoUrl: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  category: 'Behavior' | 'Health' | 'Fun Fact';
}

export interface PossibleMatch {
  currentEncounterId: string;
  suggestedCatId: string;
  confidence: number; // 0-1
  reason: string;
}
