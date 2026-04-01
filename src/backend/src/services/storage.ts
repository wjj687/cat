/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../lib/logger.js';
import type { UploadSignature } from '../types/index.js';

/**
 * Cloudinary storage service for image uploads.
 * Provides signed upload URLs for direct browser-to-Cloudinary uploads.
 */

// Configure Cloudinary
function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('Cloudinary configuration incomplete - upload signing will fail');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return true;
}

// Check if storage is configured
export function isStorageConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Generate a signed upload signature for direct browser uploads.
 * The client can use this to upload directly to Cloudinary without exposing the API secret.
 */
export function generateUploadSignature(): UploadSignature {
  if (!configureCloudinary()) {
    throw new Error('Cloudinary is not properly configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'miaomiao/encounters';
  
  // Parameters to sign
  const paramsToSign = {
    timestamp: timestamp.toString(),
    folder,
    allowed_formats: 'jpg,jpeg,png,webp',
    transformation: 'c_limit,w_2000,h_2000', // Limit max dimensions
  };

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  logger.info('Generated upload signature', { folder, timestamp });

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  };
}

/**
 * Delete an image from Cloudinary.
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!configureCloudinary()) {
    throw new Error('Cloudinary is not properly configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      logger.info('Image deleted successfully', { publicId });
    } else {
      logger.warn('Image deletion returned unexpected result', { publicId, result });
    }
  } catch (error) {
    logger.error('Failed to delete image', { publicId }, error as Error);
    throw error;
  }
}

/**
 * Get optimized image URL with transformations.
 */
export function getOptimizedUrl(publicId: string, width?: number): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return '';
  }

  const transformations = width ? `w_${width},c_fill,q_auto,f_auto` : 'q_auto,f_auto';
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Extract public ID from a Cloudinary URL.
 */
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/v\d+\/(.+)$/);
  return match ? match[1] : null;
}
