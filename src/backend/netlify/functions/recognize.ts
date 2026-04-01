/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { recognizeRequestSchema } from '../../src/lib/validation.js';
import { ValidationError } from '../../src/lib/errors.js';
import { recognizeCat } from '../../src/services/recognition.js';
import type { RecognitionResult } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleRecognize(
  body: unknown,
  context: RequestContext
): Promise<RecognitionResult> {
  // Validate input
  const validation = recognizeRequestSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError('Invalid recognition request', validation.error.format());
  }

  const { imageBase64 } = validation.data;

  // Check image size (base64 is ~4/3 the size of binary)
  const approximateSize = imageBase64.length * 0.75;
  if (approximateSize > 10 * 1024 * 1024) { // 10MB limit
    throw new ValidationError('Image too large. Maximum size is 10MB.');
  }

  // Perform recognition
  const result = await recognizeCat(imageBase64);

  return result;
}
