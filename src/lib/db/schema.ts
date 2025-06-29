import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  image: varchar({ length: 255 }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().$onUpdateFn(() => new Date()).notNull(),
});


export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectName: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 512 }).notNull(),
  description: varchar({ length: 1000 }),
  githubUrl: varchar({ length: 512 }),
  buildTime: integer().notNull(),
  email: varchar({ length: 255 }).notNull().references(() => usersTable.email),
  created_at: timestamp().defaultNow().notNull(),
});
