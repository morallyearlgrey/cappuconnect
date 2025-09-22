// lib/config.ts
// this is basically what allows easy configurations for the database useage for mongo
// and allows quick swaps from production to test
import { z } from "zod";

const Env = z.object({
  MONGODB_URI: z.string().min(1),
  DB_NAME: z.string().min(1).default("cappuconnect"),
  USERS_COLLECTION: z.string().optional(),
  EVENTS_COLLECTION: z.string().optional(),
  // legacy fallback
  USER_TABLE: z.string().optional(),
});

const env = Env.parse(process.env);

export const DB_NAME = env.DB_NAME.trim();

// Prefer USERS_COLLECTION; fall back to legacy USER_TABLE; default "users"
export const USERS_COLL = (env.USERS_COLLECTION ?? env.USER_TABLE ?? "users").trim();

// Default events collection name
export const EVENTS_COLL = (env.EVENTS_COLLECTION ?? "events").trim();
