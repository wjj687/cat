/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export domain types from frontend for consistency
export type CatBreed = '三花猫' | '橘色虎斑' | '暹罗猫' | '燕尾服猫' | '黑猫' | '白猫' | '灰猫' | '未知品种';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
export type Weather = '晴朗' | '多云' | '下雨' | '寒冷';
export type Personality = '活泼' | '想睡' | '高冷' | '好奇';
export type KnowledgeCategory = 'Behavior' | 'Health' | 'Fun Fact';
export type MatchStatus = 'pending' | 'accepted' | 'rejected';

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Domain entities (matching frontend expectations)
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
  weather?: Weather;
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
  intimacyLevel: number;
  encounters?: Encounter[];
}

export interface DexEntry {
  id: string;
  breed: CatBreed;
  description: string;
  rarity: Rarity;
  isDiscovered: boolean;
  discoveryCount: number;
  funFact: string;
  photoUrl: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
}

export interface PossibleMatch {
  id: string;
  currentEncounterId: string;
  suggestedCatId: string;
  confidence: number;
  reason: string;
  status?: MatchStatus;
}

// Recognition
export interface RecognitionResult {
  breed: CatBreed;
  confidence: number;
  message: string;
  alternatives?: Array<{ breed: CatBreed; confidence: number }>;
}

// Upload
export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
}

// Health
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    storage: 'connected' | 'disconnected';
  };
}

// Device/User context
export interface DeviceContext {
  deviceId: string;
  userId: string;
  fingerprint: string;
}
