import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ExtendedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user: ExtendedUser;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("cappuconnect");
    
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } 
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transformedUser = {
      ...user,
      _id: user._id.toString(),
      matched: user.matched || [],
      liked: user.liked || [],
      passed: user.passed || [],
      skills: user.skills || [],
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}