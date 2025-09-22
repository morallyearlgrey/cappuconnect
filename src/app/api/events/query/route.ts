///hi!
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
  id: number;               
  name: string;
  time: string;
  venue: string;
  address: string;
  host: string;
  image_url: string;
  cleaned_url: string;
  map_url: string;
  tags: string[];

  overlap: number;
  jaccard: number;
  cosine: number;
  commonTags: string[];
  attendeesCount: number;
};

type EventDoc = Document & {
  _id: ObjectId;
  id?: number;
  name?: string;
  time?: string;
  venue?: string;
  address?: string;
  host?: string;
  image_url?: string;
  cleaned_url?: string;
  map_url?: string;
  tags?: string[];
  attendees?: any[];
  commonTags?: string[];
  overlap?: number;
  jaccard?: number;
  cosine?: number;
  attendeesCount?: number;
};

type UserDoc = Document & {
  skills?: string[];
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection<UserDoc>(USERS_COLL);
    const events = db.collection<EventDoc>(EVENTS_COLL);

    const me = await users.findOne({ _id }, { projection: { skills: 1 } });
    if (!me) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const A: string[] = Array.isArray(me.skills) ? me.skills : [];
    if (!A.length) return NextResponse.json({ error: "user has no skills" }, { status: 400 });
    const aSize = A.length;

    const pipeline: Document[] = [
      { $match: { tags: { $exists: true, $ne: [] } } },
      { $match: { tags: { $in: A } } },
      { $addFields: { S_user: A, commonTags: { $setIntersection: ["$tags", A] } } },
      {
        $addFields: {
          overlap: { $size: "$commonTags" },
          unionSize: { $size: { $setUnion: ["$tags", "$S_user"] } },
          otherSize: { $size: "$tags" },
        },
      },
      {
        $addFields: {
          jaccard: { $cond: [{ $gt: ["$unionSize", 0] }, { $divide: ["$overlap", "$unionSize"] }, 0] },
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
      { $sort: { overlap: -1, jaccard: -1, attendeesCount: -1, id: -1 } },
      { $project: { S_user: 0, unionSize: 0, otherSize: 0 } },
      { $limit: limit },
    ];

    const rows: EventMatchDTO[] = (await events.aggregate<EventDoc>(pipeline).toArray()).map((r) => ({
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

      overlap: r.overlap ?? 0,
      jaccard: Number(r.jaccard?.toFixed?.(3) ?? 0),
      cosine: Number(r.cosine?.toFixed?.(3) ?? 0),
      commonTags: Array.isArray(r.commonTags) ? r.commonTags : [],
      attendeesCount: r.attendeesCount ?? 0,
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("GET /api/matches/events error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
