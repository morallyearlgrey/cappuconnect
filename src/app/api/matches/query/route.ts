import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Config you can tweak
const DB_NAME = "cappuconnect";
const COLL = "users_tag_spam";
const DEFAULT_LIMIT = 10;

export async function GET(req: NextRequest) {
  try {
    let userId = req.nextUrl.searchParams.get("userId");
    userId = "68d051df54ca4d057ba91bed";

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    let _id: ObjectId;
    try {
      _id = new ObjectId(userId);
    } catch {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }

    const limit = Math.max(1, Math.min(500, Number(req.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT)));
    const minOverlap = Math.max(1, Number(req.nextUrl.searchParams.get("minOverlap") ?? 1));

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(COLL);

    // 1) Load the source user (Alice or whoever) and grab their skills
    const me = await users.findOne({ _id }, { projection: { firstname: 1, lastname: 1, email: 1, skills: 1, updatedAt: 1,
  bio: 1, photo: 1, state: 1, industry: 1, experienceyears: 1 } });
    if (!me) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const A: string[] = Array.isArray(me.skills) ? me.skills : [];
    if (!A.length) return NextResponse.json({ error: "user has no skills" }, { status: 400 });
    const aSize = A.length;

    // 2) Run the overlap/Jaccard/Cosine ranking fully in Mongo
    const pipeline = [
      { $match: { _id: { $ne: _id }, skills: { $exists: true, $ne: [] } } },
      // prefilter: must share at least one exact skill from the fixed list
      { $match: { skills: { $in: A } } },
      {
        $addFields: {
          S_test: A,
          commonSkills: { $setIntersection: ["$skills", A] },
        },
      },
      {
        $addFields: {
          overlap: { $size: "$commonSkills" },
          unionSize: { $size: { $setUnion: ["$skills", "$S_test"] } },
          otherSize: { $size: "$skills" },
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
        },
      },
      { $match: { overlap: { $gte: minOverlap } } },
      { $sort: { overlap: -1, jaccard: -1, updatedAt: -1 } },
      {
        $project: {
          password: 0,
          S_test: 0,
          unionSize: 0,
          otherSize: 0,
        },
      },
      { $limit: limit },
    ] as const;

    const rows = (await users.aggregate(pipeline).toArray()).map((r: any) => ({
      id: r._id.toString(),
  firstname: r.firstname ?? "",
  lastname: r.lastname ?? "",
  email: r.email ?? "",
  bio: r.bio ?? "",
  photo: r.photo ?? "",
  state: r.state ?? "",
  industry: r.industry ?? "",
  experienceyears: r.experienceyears ?? "",
  overlap: r.overlap,
  jaccard: Number(r.jaccard?.toFixed?.(3) ?? r.jaccard ?? 0),
  cosine: Number(r.cosine?.toFixed?.(3) ?? r.cosine ?? 0),
  commonSkills: r.commonSkills ?? [],
    }));

    return NextResponse.json(rows, {status: 200});
  } catch (err) {
    console.error("matches/query error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
