/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  createEncounterSchema,
  updateEncounterSchema,
  recognizeRequestSchema,
  paginationSchema,
} from '../../src/lib/validation.js';

describe('Validation Schemas', () => {
  describe('createEncounterSchema', () => {
    it('should validate a valid encounter', () => {
      const validEncounter = {
        nickname: 'Mochi',
        breed: '三花猫',
        location: 'Garden',
        notes: 'Very friendly',
        personality: '活泼',
        weather: '晴朗',
        photoUrl: 'https://example.com/cat.jpg',
        recognitionConfidence: 0.85,
      };

      const result = createEncounterSchema.safeParse(validEncounter);
      expect(result.success).toBe(true);
    });

    it('should reject invalid breed', () => {
      const invalidEncounter = {
        nickname: 'Mochi',
        breed: 'InvalidBreed',
        photoUrl: 'https://example.com/cat.jpg',
      };

      const result = createEncounterSchema.safeParse(invalidEncounter);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incompleteEncounter = {
        nickname: 'Mochi',
      };

      const result = createEncounterSchema.safeParse(incompleteEncounter);
      expect(result.success).toBe(false);
    });

    it('should accept minimal valid encounter', () => {
      const minimalEncounter = {
        nickname: 'Mochi',
        breed: '三花猫',
        photoUrl: 'https://example.com/cat.jpg',
      };

      const result = createEncounterSchema.safeParse(minimalEncounter);
      expect(result.success).toBe(true);
    });
  });

  describe('recognizeRequestSchema', () => {
    it('should validate valid recognition request', () => {
      const validRequest = {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
        filename: 'cat.jpg',
      };

      const result = recognizeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty image', () => {
      const invalidRequest = {
        imageBase64: '',
        filename: 'cat.jpg',
      };

      const result = recognizeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject image too large', () => {
      const largeRequest = {
        imageBase64: 'x'.repeat(11_000_000), // Exceeds max
        filename: 'cat.jpg',
      };

      const result = recognizeRequestSchema.safeParse(largeRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should parse string numbers', () => {
      const result = paginationSchema.safeParse({ limit: '50', offset: '10' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should cap limit at 100', () => {
      const result = paginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const result = paginationSchema.safeParse({ offset: -1 });
      expect(result.success).toBe(false);
    });
  });
});
