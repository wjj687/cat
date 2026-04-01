/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, text, timestamp, integer, decimal, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const rarityEnum = pgEnum('rarity', ['Common', 'Uncommon', 'Rare', 'Legendary']);
export const weatherEnum = pgEnum('weather', ['晴朗', '多云', '下雨', '寒冷']);
export const knowledgeCategoryEnum = pgEnum('knowledge_category', ['Behavior', 'Health', 'Fun Fact']);
export const matchStatusEnum = pgEnum('match_status', ['pending', 'accepted', 'rejected']);

// Devices (anonymous identity)
export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  fingerprint: text('fingerprint').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow(),
});

// Users (linked to device for V1)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').references(() => devices.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Encounters (the core entity)
export const encounters = pgTable('encounters', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  catId: text('cat_id').references(() => myCatProfiles.id),
  nickname: text('nickname').notNull(),
  breed: text('breed').notNull(),
  location: text('location'),
  notes: text('notes'),
  personality: text('personality'),
  weather: weatherEnum('weather'),
  photoUrl: text('photo_url'),
  photoStorageKey: text('photo_storage_key'),
  recognitionConfidence: decimal('recognition_confidence', { precision: 3, scale: 2 }),
  recognitionProvider: text('recognition_provider'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// My Cat Profiles (aggregated view of encounters)
export const myCatProfiles = pgTable('my_cat_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  nickname: text('nickname').notNull(),
  breed: text('breed').notNull(),
  firstEncounterDate: timestamp('first_encounter_date', { withTimezone: true }),
  lastEncounterDate: timestamp('last_encounter_date', { withTimezone: true }),
  encounterCount: integer('encounter_count').default(0),
  favoriteSpot: text('favorite_spot'),
  personalityTags: text('personality_tags').array(),
  photoUrl: text('photo_url'),
  intimacyLevel: integer('intimacy_level').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Dex Entries (static/reference data)
export const dexEntries = pgTable('dex_entries', {
  id: text('id').primaryKey(),
  breed: text('breed').unique().notNull(),
  description: text('description').notNull(),
  rarity: rarityEnum('rarity').notNull(),
  funFact: text('fun_fact'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// User Dex Discoveries (junction table)
export const userDexDiscoveries = pgTable('user_dex_discoveries', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  dexEntryId: text('dex_entry_id').references(() => dexEntries.id).notNull(),
  discoveryCount: integer('discovery_count').default(1),
  firstDiscoveredAt: timestamp('first_discovered_at', { withTimezone: true }).defaultNow(),
  lastDiscoveredAt: timestamp('last_discovered_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueUserDex: primaryKey({ columns: [table.userId, table.dexEntryId] }),
}));

// Knowledge Cards (static/reference data)
export const knowledgeCards = pgTable('knowledge_cards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: knowledgeCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Possible Matches (suggestions, not automatic)
export const possibleMatches = pgTable('possible_matches', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id').references(() => encounters.id).notNull(),
  suggestedCatId: text('suggested_cat_id').references(() => myCatProfiles.id).notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  reason: text('reason'),
  status: matchStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Uploaded Images (tracking)
export const uploadedImages = pgTable('uploaded_images', {
  id: text('id').primaryKey(),
  uploadedBy: text('uploaded_by').references(() => users.id).notNull(),
  storageProvider: text('storage_provider').default('cloudinary'),
  storagePublicId: text('storage_public_id').notNull(),
  storageUrl: text('storage_url').notNull(),
  originalFilename: text('original_filename'),
  mimeType: text('mime_type'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const devicesRelations = relations(devices, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  device: one(devices, {
    fields: [users.deviceId],
    references: [devices.id],
  }),
  encounters: many(encounters),
  catProfiles: many(myCatProfiles),
  dexDiscoveries: many(userDexDiscoveries),
  uploadedImages: many(uploadedImages),
}));

export const encountersRelations = relations(encounters, ({ one, many }) => ({
  user: one(users, {
    fields: [encounters.userId],
    references: [users.id],
  }),
  catProfile: one(myCatProfiles, {
    fields: [encounters.catId],
    references: [myCatProfiles.id],
  }),
  possibleMatches: many(possibleMatches),
}));

export const myCatProfilesRelations = relations(myCatProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [myCatProfiles.userId],
    references: [users.id],
  }),
  encounters: many(encounters),
  suggestedMatches: many(possibleMatches, { relationName: 'suggestedCat' }),
}));

export const dexEntriesRelations = relations(dexEntries, ({ many }) => ({
  userDiscoveries: many(userDexDiscoveries),
}));

export const userDexDiscoveriesRelations = relations(userDexDiscoveries, ({ one }) => ({
  user: one(users, {
    fields: [userDexDiscoveries.userId],
    references: [users.id],
  }),
  dexEntry: one(dexEntries, {
    fields: [userDexDiscoveries.dexEntryId],
    references: [dexEntries.id],
  }),
}));

export const possibleMatchesRelations = relations(possibleMatches, ({ one }) => ({
  encounter: one(encounters, {
    fields: [possibleMatches.encounterId],
    references: [encounters.id],
  }),
  suggestedCat: one(myCatProfiles, {
    fields: [possibleMatches.suggestedCatId],
    references: [myCatProfiles.id],
  }),
}));
