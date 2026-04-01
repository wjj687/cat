/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RecognitionResult, CatBreed } from '../types/index.js';
import { ServiceUnavailableError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Recognition service adapter.
 * V1 uses a mock/stub implementation.
 * Future versions can integrate with Google Vision, AWS Rekognition, or custom ML models.
 */

export interface RecognitionProvider {
  recognize(imageBase64: string): Promise<RecognitionResult>;
}

// Mock provider for V1 development and testing
class MockRecognitionProvider implements RecognitionProvider {
  async recognize(imageBase64: string): Promise<RecognitionResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock breed detection based on image size (just for variety)
    const breeds: CatBreed[] = ['三花猫', '橘色虎斑', '暹罗猫', '燕尾服猫', '黑猫', '白猫', '灰猫'];
    const messages = [
      '光线太棒了！AI 识别这可能是一位三花猫朋友。',
      '这是一只橘色虎斑猫，看起来很有精神！',
      '暹罗猫的特征非常明显，那双眼睛真迷人。',
      '燕尾服猫的优雅气质一览无遗。',
      '神秘的黑猫，在阴影中若隐若现。',
      '纯洁的白猫，像一团棉花糖。',
      '优雅的灰猫，有着独特的魅力。',
    ];

    const seed = imageBase64.length % breeds.length;
    const primaryBreed = breeds[seed];
    const confidence = 0.7 + Math.random() * 0.25;

    // Generate alternatives
    const alternatives: Array<{ breed: CatBreed; confidence: number }> = [];
    const altBreed = breeds[(seed + 1) % breeds.length];
    alternatives.push({
      breed: altBreed,
      confidence: Math.max(0.05, 1 - confidence - 0.05),
    });

    return {
      breed: primaryBreed,
      confidence: Math.round(confidence * 100) / 100,
      message: messages[seed],
      alternatives,
    };
  }
}

// Factory to get the appropriate provider
export function getRecognitionProvider(): RecognitionProvider {
  const provider = process.env.RECOGNITION_PROVIDER || 'mock';

  switch (provider) {
    case 'mock':
      return new MockRecognitionProvider();
    // Future providers:
    // case 'google':
    //   return new GoogleVisionProvider();
    // case 'aws':
    //   return new AWSRekognitionProvider();
    default:
      logger.warn(`Unknown recognition provider: ${provider}, falling back to mock`);
      return new MockRecognitionProvider();
  }
}

// Main recognition function
export async function recognizeCat(imageBase64: string): Promise<RecognitionResult> {
  const provider = getRecognitionProvider();
  
  try {
    logger.info('Starting cat recognition', { provider: process.env.RECOGNITION_PROVIDER || 'mock' });
    const result = await provider.recognize(imageBase64);
    logger.info('Cat recognition completed', { breed: result.breed, confidence: result.confidence });
    return result;
  } catch (error) {
    logger.error('Cat recognition failed', {}, error as Error);
    throw new ServiceUnavailableError('Recognition service');
  }
}
