// lib/collections.ts


// practice use case for importing system

// // app/api/events/list/route.ts (example)
// import { NextRequest, NextResponse } from "next/server";
// import { getCollections } from "@/lib/collections";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest) {
//   const { events } = await getCollections();
//   const rows = await events.find({}, { projection: { _id: 1, type: 1, createdAt: 1 } }).limit(50).toArray();
//   return NextResponse.json(rows);
// }


// app/api/matches/query/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { ObjectId } from "mongodb";
// import { getCollections } from "@/lib/collections";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest) {
//   const { users } = await getCollections();
//   // ... use `users` as usual
//   // const me = await users.findOne({ _id: new ObjectId(id) }, { projection: { ... } });
//   return NextResponse.json([]);
// }

import clientPromise from "@/lib/mongodb";
import { DB_NAME, USERS_COLL, EVENTS_COLL } from "@/lib/config";
import { ObjectId } from "mongodb";

export type UserDoc = {
  _id: ObjectId | string;
  firstname?: string; lastname?: string; email?: string;
  skills?: string[]; bio?: string; photo?: string;
  state?: string; industry?: string; experienceyears?: string;
  matched?: (ObjectId | string)[]; passed?: (ObjectId | string)[];
  updatedAt?: Date; createdAt?: Date;
};

export type EventDoc = {
  _id: ObjectId | string;
  userId: ObjectId | string;
  type: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
};


export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export async function getCollections() {
  const db = await getDb();
  const users = db.collection<UserDoc>(USERS_COLL);
  const events = db.collection<EventDoc>(EVENTS_COLL);

  // Dev-only sanity: warn if collection names don’t exist yet
  if (process.env.NODE_ENV !== "production") {
    const names = new Set<string>();
    for await (const c of db.listCollections({}, { nameOnly: true })) names.add(c.name);
    if (!names.has(USERS_COLL)) console.warn(`⚠️ Collection "${USERS_COLL}" not found (will be created on first write).`);
    if (!names.has(EVENTS_COLL)) console.warn(`⚠️ Collection "${EVENTS_COLL}" not found (will be created on first write).`);
  }

  return { users, events };
}
