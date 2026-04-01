/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.js';

// Connection pool for serverless environment
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // For serverless: use connection pooling with prepared statements disabled
    // to work better with connectionless environments
    client = postgres(connectionString, {
      prepare: false,
      max: 10, // Limit pool size for serverless
      idle_timeout: 20,
      connect_timeout: 10,
    });

    db = drizzle(client, { schema });
  }

  return db;
}

// For tests and cleanup
export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}
