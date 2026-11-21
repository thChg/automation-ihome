import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const systemState = pgTable('system_state', {
  id: serial('id').primaryKey(),
  value: text('value').notNull(),
});
