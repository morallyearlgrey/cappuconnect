import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcrypt";
import { ObjectId } from "mongodb";
import { compare } from "bcrypt";

async function getDB() {
  const client = await clientPromise;
  await client.connect();
  return client.db("cappuconnect");
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("GET users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDB();
    const body = await req.json();
    const { firstname, lastname, email, password, state, linkedin } = body;

    if (!firstname || !lastname || !email || !password || !state || !linkedin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = {
      ...body,
      email: email.toLowerCase(),
      password: hashedPassword,
      matched: [],  // add empty arrays
      liked: [],
      passed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ id: result.insertedId, ...userWithoutPassword }, { status: 201 });
  } catch (err) {
    console.error("POST user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const db = await getDB();
    const body = await req.json();
    const { userId, password, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (password) {
      updateData.password = await hash(password, 12);
    }

    updateData.updatedAt = new Date();

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result?.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = result.value;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (err) {
    console.error("PUT user error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}


export async function LOGIN(req: NextRequest) {
  try {
    const db = await getDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // remove password before sending back
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}