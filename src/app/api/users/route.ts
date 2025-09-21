// Route handlers for a Next.js (App Router) API route that talks to MongoDB.
// Exposes GET (list users), POST (create user), PUT (update user), and a LOGIN helper.

// These types help with type-safe request/response handling in Next.js App Router.
import { NextRequest, NextResponse } from "next/server";

// `clientPromise` should be a singleton MongoClient promise (from "@/lib/mongodb").
// Centralizing the client prevents opening a new TCP connection per request.
import clientPromise from "@/lib/mongodb";

// bcrypt is used for *slow, salted* password hashing (critical for security).
import { hash } from "bcrypt";

// MongoDB `ObjectId` helper is needed when querying by the primary key (_id).
import { ObjectId } from "mongodb";

// bcrypt compare to check a plaintext password against a stored hash.
import { compare } from "bcrypt";

const current_table = "users_tag_spam"

/**
 * getDB()
 * - Awaits the shared MongoClient
 * - Ensures connection is established (no-op if already connected by the singleton)
 * - Returns the DB handle for the "cappuconnect" database
 */
async function getDB() {
  const client = await clientPromise;   // resolves to MongoClient
  await client.connect();               // safe if already connected (driver tracks state)
  return client.db("cappuconnect");     // choose your logical database
}

/**
 * GET /api/<route>
 * - Fetch all users, but exclude the password field.
 * - 200 with JSON list on success, 500 on error.
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDB();

    // Query all docs in "users". The empty filter {} matches all documents.
    // The `projection` option excludes `password` field from the result set.
    const users = await db
      .collection(current_table)
      .find({}, { projection: { password: 0 } })
      .toArray();

    // NextResponse.json serializes to JSON and sets headers/status.
    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("GET users error:", err);
    // Return a generic error (don’t leak internals); status 500.
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/<route>
 * - Create a new user document.
 * - Validates required fields.
 * - Enforces unique email (by checking first; ideally also add a unique index).
 * - Hashes the password before insert.
 * - Returns the created document (without password) and its insertedId.
 */
export async function POST(req: NextRequest) {
  try {
    const db = await getDB();
    const body = await req.json(); // Parse JSON body
    console.log("incomoing json request is the following")
    console.log(req)
    console.log("\nEnd of Request Json")
    console.log("incomoing body request is the following")
    console.log(body)
    console.log("\nEnd of Request body")

    // Pull out the fields we care about (basic validation follows).
    const { firstname, lastname, email, password, state, linkedin } = body;

    // Minimal presence validation; consider using a schema validator (e.g., zod) for robustness.
    if (!firstname || !lastname || !email || !password || !state || !linkedin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize the email (lowercase) for consistent querying.
    const normalizedEmail = email.toLowerCase();

    // Check for existing user by email. (Also add a unique index server-side to prevent races.)
    const existingUser = await db.collection(current_table).findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password with bcrypt. The number (12) is the cost factor (work factor).
    // Higher = more secure but slower. 10–12 is common for web apps; tune based on perf.
    const hashedPassword = await hash(password, 12);

    // Build the new document. We keep all original fields but overwrite `email` and `password`.
    const newUser = {
      ...body,
      email: normalizedEmail,
      password: hashedPassword,
      matched: [],  // add empty arrays
      liked: [],
      passed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the document; MongoDB will generate an _id (ObjectId).
    const result = await db.collection(current_table).insertOne(newUser);

    // Omit password from the returned payload by destructuring it away.
    const { password: _omit, ...userWithoutPassword } = newUser;

    // Return the safe user data plus the inserted id.
    return NextResponse.json({ id: result.insertedId, ...userWithoutPassword }, { status: 201 });
  } catch (err) {
    console.error("POST user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

/**
 * PUT /api/<route>
 * - Update user fields by userId (Mongo _id).
 * - If `password` is included, it is re-hashed before saving.
 * - Always updates `updatedAt`.
 * - Returns the updated document (without password).
 */
export async function PUT(req: NextRequest) {
  try {
    const db = await getDB();
    const body = await req.json();

    // Accepts a `userId` to locate the user; everything else is considered updatable data.
    const { userId, password, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // If caller wants to change password, re-hash it first.
    if (password) {
      updateData.password = await hash(password, 12);
    }

    // Track updates
    updateData.updatedAt = new Date();

    // findOneAndUpdate:
    // - filter by _id
    // - $set to only change provided fields
    // - returnDocument: "after" returns the *updated* doc instead of the original
    const result = await db
      .collection(current_table)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    // If no match, the user wasn’t found.
    if (!result?.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from the response
    const { password: _omit, ...userWithoutPassword } = result.value;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (err) {
    console.error("PUT user error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * LOGIN (helper)
 * - Validates email & password.
 * - Looks up user by normalized email, compares bcrypt hash.
 * - Returns the user (without password) on success.
 *
 * NOTE: In Next.js App Router, HTTP verbs must be named GET/POST/PUT/DELETE, etc.
 * If you want a login endpoint, place this in a separate route (e.g., /api/auth/login)
 * and export `POST` from that file. Exporting `LOGIN` here won’t be auto-routed.
 */
export async function LOGIN(req: NextRequest) {
  try {
    const db = await getDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Fetch user by email. This should include the hashed password to compare.
    const user = await db.collection(current_table).findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    // Compare the plaintext password to the stored hash.
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Never return the password hash to the client.
    const { password: _omit, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
