// app/api/matches/events/route.ts
// legit copy and paste from query people.
// sends back the people we want to connect with
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId, Document } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { DB_NAME, USERS_COLL, EVENTS_COLL } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 10;

export type EventMatchDTO = {
  mongoId: string;          // event _id
  id: number;               // your int id
  name: string;
  time: string;
  venue: string;
  address: string;
  host: string;
  image_url: string;
  cleaned_url: string;
  map_url: string;
  tags: string[];

  // scores
  overlap: number;
  jaccard: number;
  cosine: number;
  commonTags: string[];
  attendeesCount: number;
};

export async function GET(req: NextRequest) {
  try {
    // Require a logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use session user by default; allow ?userId override if you ever need it
    const userId = req.nextUrl.searchParams.get("userId") || session.user.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }
    const _id = new ObjectId(userId);

    const limit = Math.max(
      1,
      Math.min(500, Number(req.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT))
    );
    const minOverlap = Math.max(1, Number(req.nextUrl.searchParams.get("minOverlap") ?? 1));

    // DB handles
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLL);
    const events = db.collection(EVENTS_COLL);

    // 1) Load the source user (to get their skills)
    const me = await users.findOne(
      { _id },
      { projection: { skills: 1 } }
    );
    if (!me) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const A: string[] = Array.isArray((me as any).skills) ? (me as any).skills : [];
    if (!A.length) return NextResponse.json({ error: "user has no skills" }, { status: 400 });
    const aSize = A.length;

    // 2) Aggregate over EVENTS: overlap(user.skills, event.tags)
    const pipeline: Document[] = [
      { $match: { tags: { $exists: true, $ne: [] } } },
      { $match: { tags: { $in: A } } }, // prefilter: share ANY tag
      {
        $addFields: {
          S_user: A,
          commonTags: { $setIntersection: ["$tags", A] },
        },
      },
      {
        $addFields: {
          overlap: { $size: "$commonTags" },
          unionSize: { $size: { $setUnion: ["$tags", "$S_user"] } },
          otherSize: { $size: "$tags" },
        },
      },
      {
        $addFields: {
          jaccard: {
            $cond: [{ $gt: ["$unionSize", 0] }, { $divide: ["$overlap", "$unionSize"] }, 0],
          },
          cosine: {
            $cond: [
              { $and: [{ $gt: ["$otherSize", 0] }, { $gt: [aSize, 0] }] },
              { $divide: ["$overlap", { $sqrt: { $multiply: ["$otherSize", aSize] } }] },
              0,
            ],
          },
          attendeesCount: { $size: { $ifNull: ["$attendees", []] } },
        },
      },
      { $match: { overlap: { $gte: minOverlap } } },
      // Sort: strongest semantic match first, then popularity, then ID
      { $sort: { overlap: -1, jaccard: -1, attendeesCount: -1, id: -1 } },
      {
        $project: {
          S_user: 0, unionSize: 0, otherSize: 0,
          // keep only the fields you want to return
          // (leave all other event fields implicit unless needed)
        },
      },
      { $limit: limit },
    ];

    const rows: EventMatchDTO[] = (await events.aggregate(pipeline).toArray()).map((r: any) => ({
      mongoId: r._id.toString(),
      id: r.id ?? 0,
      name: r.name ?? "",
      time: r.time ?? "",
      venue: r.venue ?? "",
      address: r.address ?? "",
      host: r.host ?? "",
      image_url: r.image_url ?? "",
      cleaned_url: r.cleaned_url ?? "",
      map_url: r.map_url ?? "",
      tags: Array.isArray(r.tags) ? r.tags : [],

      overlap: r.overlap || 0,
      jaccard: Number(r.jaccard?.toFixed?.(3) ?? r.jaccard ?? 0),
      cosine: Number(r.cosine?.toFixed?.(3) ?? r.cosine ?? 0),
      commonTags: Array.isArray(r.commonTags) ? r.commonTags : [],
      attendeesCount: r.attendeesCount ?? 0,
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("GET /api/matches/events error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
