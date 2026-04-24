import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

export const profilesTable = sqliteTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  name: text("name").notNull().default(""),
  bio: text("bio"),
  city: text("city"),
  area: text("area"),
  category: text("category"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  followers: integer("followers").default(0),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  companyName: text("company_name"),
  industry: text("industry"),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profilesTable.$inferSelect;
