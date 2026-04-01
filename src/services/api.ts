/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Encounter, MyCatProfile, DexEntry, KnowledgeCard, PossibleMatch } from '../types/domain';
import { MOCK_ENCOUNTERS, MOCK_MY_CATS, MOCK_DEX, MOCK_KNOWLEDGE } from '../data/mock';

/**
 * Service layer for API calls.
 * In V1, this uses mock data and simulates network latency.
 */
export const apiService = {
  // GET /api/timeline
  getTimeline: async (): Promise<Encounter[]> => {
    await simulateLatency();
    return [...MOCK_ENCOUNTERS];
  },

  // GET /api/cats
  getMyCats: async (): Promise<MyCatProfile[]> => {
    await simulateLatency();
    return [...MOCK_MY_CATS];
  },

  // GET /api/dex
  getDex: async (): Promise<DexEntry[]> => {
    await simulateLatency();
    return [...MOCK_DEX];
  },

  // GET /api/dex/:id
  getDexEntry: async (id: string): Promise<DexEntry | undefined> => {
    await simulateLatency();
    return MOCK_DEX.find(d => d.id === id);
  },

  // GET /api/knowledge/:id
  getKnowledgeCard: async (id: string): Promise<KnowledgeCard | undefined> => {
    await simulateLatency();
    return MOCK_KNOWLEDGE.find(k => k.id === id);
  },

  // POST /api/recognize
  recognizeCat: async (photoData: string): Promise<{ breed: string; confidence: number; message: string }> => {
    await simulateLatency(1500);
    // Simulated recognition logic
    return {
      breed: '三花猫',
      confidence: 0.85,
      message: '光线太棒了！AI 识别这可能是一位三花猫朋友。',
    };
  },

  // POST /api/encounters
  saveEncounter: async (encounter: Omit<Encounter, 'id'>): Promise<Encounter> => {
    await simulateLatency(1000);
    const newEncounter = { ...encounter, id: `e${Date.now()}` };
    // In a real app, we'd save to DB here. For now, we'll just return it.
    return newEncounter;
  },

  // POST /api/matches/suggest
  getSuggestedMatches: async (encounterId: string): Promise<PossibleMatch[]> => {
    await simulateLatency();
    return [
      {
        currentEncounterId: encounterId,
        suggestedCatId: 'c1',
        confidence: 0.72,
        reason: '与麻糬 (Mochi) 的毛色图案和位置非常相似。',
      },
    ];
  },
};

const simulateLatency = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));
