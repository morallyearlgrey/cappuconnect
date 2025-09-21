import type { DefaultSession } from "next-auth";

// Inline augmentation (visible only to this file during type-check)
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & { id: string };
  }
  interface User {
    id: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
// app/api/match/route.ts
// app/api/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }
    console.error("match:", session.user.id, "->", targetUserId);

    const viewerId = new ObjectId(session.user.id);
    const targetId = new ObjectId(String(targetUserId));
    if (viewerId.equals(targetId)) {
      return NextResponse.json({ error: "Cannot match yourself" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cappuconnect");
    const users = db.collection("users");

    // Ensure target exists (optional)
    const targetExists = await users.findOne({ _id: targetId }, { projection: { _id: 1 } });
    if (!targetExists) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Core MongoDB call: add to matched (no dupes), optionally remove from passed
    await users.updateOne(
      { _id: viewerId },
      {
        $addToSet: { matched: targetId },
        $pull: { passed: { $in: [targetId] } }, // TS-safe even if 'passed' is loosely typed
        $set: { updatedAt: new Date() },
      }
    );

    // (Optional) compute mutual
    const mutual = !!(await users.findOne({ _id: targetId, matched: viewerId }, { projection: { _id: 1 } }));
    return NextResponse.json({ ok: true, mutual });
  } catch (err) {
    console.error("POST /api/match error:", err);
    return NextResponse.json({ error: "Failed to record match" }, { status: 500 });
  }
}
