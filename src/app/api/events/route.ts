// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("cappuconnect");
    
    const events = await db.collection("events")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform MongoDB documents to match your interface
    const transformedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      attendees: event.attendees || [],
      tags: event.tags || [],
      address: event.address || event.venue || "TBD",
      image_url: event.image_url === "Image not found" ? null : event.image_url,
    }));
    
    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST route for toggling attendance
export async function POST(request: NextRequest) {
  try {
    const { eventId, userId, action } = await request.json();
    
    if (!eventId || !userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cappuconnect");
    
    const updateOperation = action === "attend" 
      ? { $addToSet: { attendees: userId } } // addToSet prevents duplicates
      : { $pull: { attendees: userId } };
    
    const result = await db.collection("events").updateOne(
      { _id: new ObjectId(eventId) },
      updateOperation
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      attending: action === "attend",
      message: action === "attend" ? "Added to event" : "Removed from event"
    });
    
  } catch (error) {
    console.error("Failed to update event attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}