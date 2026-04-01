/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db.js';
import { devices, users } from '../db/schema.js';
import type { DeviceContext } from '../types/index.js';
import { logger } from './logger.js';

/**
 * Simple device-based authentication for V1.
 * Creates anonymous user accounts linked to device fingerprints.
 * No passwords, no email - just a simple device identifier.
 */

/**
 * Get or create a user for the given device context.
 */
export async function getOrCreateUser(deviceContext: DeviceContext): Promise<string> {
  const db = getDb();
  const { deviceId, fingerprint } = deviceContext;

  // Try to find existing device
  const [existingDevice] = await db
    .select()
    .from(devices)
    .where(eq(devices.id, deviceId))
    .limit(1);

  if (existingDevice) {
    // Update last seen
    await db
      .update(devices)
      .set({ lastSeen: new Date() })
      .where(eq(devices.id, deviceId));

    // Get or create user for this device
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.deviceId, deviceId))
      .limit(1);

    if (existingUser) {
      logger.debug('Found existing user', { userId: existingUser.id, deviceId });
      return existingUser.id;
    }

    // Create new user for existing device
    const userId = generateUserId();
    await db.insert(users).values({
      id: userId,
      deviceId,
    });

    logger.info('Created new user for existing device', { userId, deviceId });
    return userId;
  }

  // Create new device and user
  await db.insert(devices).values({
    id: deviceId,
    fingerprint,
    createdAt: new Date(),
    lastSeen: new Date(),
  });

  const userId = generateUserId();
  await db.insert(users).values({
    id: userId,
    deviceId,
  });

  logger.info('Created new device and user', { userId, deviceId });
  return userId;
}

/**
 * Verify that a user exists and return their ID.
 */
export async function verifyUser(userId: string): Promise<boolean> {
  const db = getDb();
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return !!user;
}

/**
 * Generate a unique user ID.
 */
function generateUserId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract device context from request headers.
 */
export function extractDeviceContext(headers: Headers): DeviceContext | null {
  const deviceId = headers.get('X-Device-Id');
  const fingerprint = headers.get('X-Device-Fingerprint');

  if (!deviceId || !fingerprint) {
    return null;
  }

  return {
    deviceId,
    fingerprint,
    userId: '', // Will be populated after auth
  };
}
