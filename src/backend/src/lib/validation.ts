/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// Cat breeds supported by the app
const catBreeds = ['三花猫', '橘色虎斑', '暹罗猫', '燕尾服猫', '黑猫', '白猫', '灰猫', '未知品种'] as const;

// Weather options
const weatherOptions = ['晴朗', '多云', '下雨', '寒冷'] as const;

// Personality options
const personalityOptions = ['活泼', '想睡', '高冷', '好奇'] as const;

// Rarity levels
const rarityLevels = ['Common', 'Uncommon', 'Rare', 'Legendary'] as const;

// Knowledge categories
const knowledgeCategories = ['Behavior', 'Health', 'Fun Fact'] as const;

// Match statuses
const matchStatuses = ['pending', 'accepted', 'rejected'] as const;

// Pagination schema
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Device identification schema
export const deviceContextSchema = z.object({
  deviceId: z.string().min(1).max(255),
  fingerprint: z.string().min(1).max(500),
});

// Recognition request schema
export const recognizeRequestSchema = z.object({
  imageBase64: z.string().min(100).max(10_000_000), // Reasonable limits for base64
  filename: z.string().min(1).max(255),
});

// Encounter creation schema
export const createEncounterSchema = z.object({
  nickname: z.string().min(1).max(100),
  breed: z.enum(catBreeds),
  location: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  personality: z.enum(personalityOptions).optional(),
  weather: z.enum(weatherOptions).optional(),
  photoUrl: z.string().url().max(1000),
  recognitionConfidence: z.number().min(0).max(1).optional(),
  suggestedCatId: z.string().uuid().optional(),
});

// Encounter update schema
export const updateEncounterSchema = z.object({
  nickname: z.string().min(1).max(100).optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  personality: z.enum(personalityOptions).optional(),
  weather: z.enum(weatherOptions).optional(),
  catId: z.string().uuid().optional().nullable(),
});

// Timeline query schema
export const timelineQuerySchema = paginationSchema.extend({
  catId: z.string().uuid().optional(),
});

// Match suggestion request schema
export const matchSuggestSchema = z.object({
  encounterId: z.string().uuid(),
});

// Match resolve schema
export const matchResolveSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

// Dex entry ID param
export const dexEntryParamsSchema = z.object({
  id: z.string().uuid(),
});

// Knowledge card ID param
export const knowledgeCardParamsSchema = z.object({
  id: z.string().uuid(),
});

// Cat profile ID param
export const catProfileParamsSchema = z.object({
  id: z.string().uuid(),
});

// Encounter ID param
export const encounterParamsSchema = z.object({
  id: z.string().uuid(),
});

// Match ID param
export const matchParamsSchema = z.object({
  id: z.string().uuid(),
});

// Type exports
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DeviceContextInput = z.infer<typeof deviceContextSchema>;
export type RecognizeRequestInput = z.infer<typeof recognizeRequestSchema>;
export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
export type TimelineQueryInput = z.infer<typeof timelineQuerySchema>;
export type MatchSuggestInput = z.infer<typeof matchSuggestSchema>;
export type MatchResolveInput = z.infer<typeof matchResolveSchema>;
