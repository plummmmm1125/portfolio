import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const siteVisitors = sqliteTable('site_visitors', {
  visitorHash: text('visitor_hash').primaryKey(),
  firstSeenAt: integer('first_seen_at').notNull(),
});
