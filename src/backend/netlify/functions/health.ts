/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDb } from '../../src/lib/db.js';
import { isStorageConfigured } from '../../src/services/storage.js';
import type { HealthStatus } from '../../src/types/index.js';

export async function handleHealth(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  
  // Check database connection
  let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
  try {
    const db = getDb();
    // Simple query to test connection
    await db.query.users.findFirst();
    databaseStatus = 'connected';
  } catch {
    databaseStatus = 'disconnected';
  }

  // Check storage configuration
  const storageStatus = isStorageConfigured() ? 'connected' : 'disconnected';

  // Determine overall health
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (databaseStatus === 'disconnected') {
    status = 'unhealthy';
  } else if (storageStatus === 'disconnected') {
    status = 'degraded';
  }

  return {
    status,
    version: process.env.API_VERSION || '1.0.0',
    timestamp,
    services: {
      database: databaseStatus,
      storage: storageStatus,
    },
  };
}
