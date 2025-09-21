// app/api/events/route.ts
// Next.js App Router route for your `events` collection (schema unchanged).
// Focus: GET queries with filters, projection, sort, pagination, and a sample aggregation.

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/** Reuse your client and return DB handle */
async function getDB() {
  const client = await clientPromise;
  await client.connect();
  return client.db("cappuconnect");
}

/**
 * GET /api/events
 *
 * Query params (all optional, combine as needed):
 * - id: number (your pre-determined external id, NOT _id)
 * - _id: string (Mongo ObjectId) if you ever want to fetch by the native id
 * - name: string (case-insensitive substring match)
 * - host: string (case-insensitive substring match)
 * - venue: string (case-insensitive substring match)
 * - tags: string (case-insensitive substring match inside the tags *string*)
 * - time: string (exact match on your time string)
 * - timeContains: string (substring match inside your time string)
 * - clean: string (substring match inside cleaned_url)
 * - from / to: string boundaries to filter lexicographically on your time field.
 *              ⚠ Works well only if your time strings are ISO-like (YYYY-MM-DD...).
 * - sortBy: one of ["time","name","host","venue","id"] (defaults to "time")
 * - direction: "asc" | "desc" (default "asc")
 * - page: number (default 1)
 * - pageSize: number (default 20, max 200)
 * - withCounts: "1" to also return total count and an attendeeCount aggregation.
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(req.url);

    // ---------- 1) Build a filter ----------
    const filter: Record<string, any> = {};

    // By external numeric id
    const idParam = searchParams.get("id");
    if (idParam) {
      const idNum = Number(idParam);
      if (!Number.isNaN(idNum)) filter.id = idNum;
    }

    // By native Mongo _id (useful sometimes)
    const oidParam = searchParams.get("_id");
    if (oidParam) {
      try {
        filter._id = new ObjectId(oidParam);
      } catch {
        return NextResponse.json({ error: "Invalid _id" }, { status: 400 });
      }
    }

    // Case-insensitive substring matches using regex (simple and effective)
    const like = (field: string, value: string | null) => {
      if (value && value.trim()) {
        filter[field] = { $regex: value.trim(), $options: "i" };
      }
    };

    like("name", searchParams.get("name"));
    like("host", searchParams.get("host"));
    like("venue", searchParams.get("venue"));
    like("tags", searchParams.get("tags"));           // your tags is a string
    like("cleaned_url", searchParams.get("clean"));
    like("time", searchParams.get("timeContains"));   // substring in your time string

    // Exact time string match (e.g., if you store a canonical text)
    const timeExact = searchParams.get("time");
    if (timeExact && timeExact.trim()) {
      filter.time = timeExact.trim();
    }

    // String-based range on `time` (works best if time is ISO-like)
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from || to) {
      // If `time` is already used above, convert to $and to combine conditions
      if (filter.time && typeof filter.time === "object") {
        // already has a regex; push both into $and
        const timeCond = filter.time;
        delete filter.time;
        filter.$and = [{ time: timeCond }];
      } else if (filter.time && typeof filter.time === "string") {
        // exact and range conflict; turn into $and
        const exact = filter.time;
        delete filter.time;
        filter.$and = [{ time: exact }];
      }

      const range: Record<string, any> = {};
      if (from) range.$gte = from;
      if (to) range.$lt = to;

      if (filter.$and) {
        filter.$and.push({ time: range });
      } else {
        filter.time = range;
      }
    }

    // ---------- 2) Projection (choose fields to include/exclude) ----------
    // Keep it simple; you can exclude large fields if needed.
    const projection: Record<string, 0 | 1> = {
      // example: exclude image_url if you want lightweight lists
      // image_url: 0
    };

    // ---------- 3) Sorting ----------
    const sortBy = (searchParams.get("sortBy") || "time").toString();
    const direction = (searchParams.get("direction") || "asc").toLowerCase() === "desc" ? -1 : 1;

    const allowedSort = new Set(["time", "name", "host", "venue", "id"]);
    const sort: Record<string, 1 | -1> = allowedSort.has(sortBy) ? { [sortBy]: direction } : { time: 1 };

    // ---------- 4) Pagination ----------
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1), 200);
    const skip = (page - 1) * pageSize;

    // ---------- 5) Main query ----------
    const cursor = db
      .collection("events")
      .find(filter, { projection })
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const docs = await cursor.toArray();

    // ---------- 6) Optional counts + example aggregation ----------
    // Pass withCounts=1 to include: total count for the filter AND attendeeCount per doc.
    const withCounts = searchParams.get("withCounts") === "1";

    if (!withCounts) {
      return NextResponse.json(docs, { status: 200 });
    }

    // total count for the current filter (for paginated UIs)
    const total = await db.collection("events").countDocuments(filter);

    // Example aggregation to compute attendeeCount without changing your stored schema:
    // - $match: apply same filter
    // - $addFields: add attendeeCount = $size of attendees array
    // - $sort / $skip / $limit replicate the same pagination as above
    const pipeline = [
      { $match: filter },
      { $addFields: { attendeeCount: { $size: { $ifNull: ["$attendees", []] } } } },
      { $sort: sort },
      { $skip: skip },
      { $limit: pageSize },
      // Optionally project only a subset:
      // { $project: { name: 1, time: 1, venue: 1, attendeeCount: 1 } }
    ];

    const withAgg = await db.collection("events").aggregate(pipeline).toArray();

    return NextResponse.json(
      {
        page,
        pageSize,
        total,
        results: withAgg, // same page of docs but includes attendeeCount
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
