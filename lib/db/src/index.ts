import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../localfluence.db");

const client = createClient({
  url: process.env.DATABASE_URL || `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

export * from "./schema";
