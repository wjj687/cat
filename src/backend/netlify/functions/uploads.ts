/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateUploadSignature, isStorageConfigured } from '../../src/services/storage.js';
import { ServiceUnavailableError } from '../../src/lib/errors.js';
import type { UploadSignature } from '../../src/types/index.js';

interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

export async function handleUploadSign(context: RequestContext): Promise<UploadSignature> {
  // Check if storage is configured
  if (!isStorageConfigured()) {
    throw new ServiceUnavailableError('Image upload service is not configured');
  }

  // Generate signed upload parameters
  const signature = generateUploadSignature();

  return signature;
}
