// event tinder shit
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";

import { EventCard } from "@/components/eventcard";
import PersonCard from "@/components/personcard"; // ⬅️ import PersonCard
//import { useEffect, useState } from "react";
//import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
//import { Navbar } from "@/components/navbar";
import Image from "next/image";


interface EventCardProps {
  _id: string;
  name: string;
  time: string;
  host: string;
  address?: string;
  cleaned_url: string;
  image_url?: string;
  map_url?: string;
  tags: string[];
  attendees: string[];
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  matched: string[];
  photo?: string;
  industry?: string;
  state?: string;
  school?: string;
  major?: string;
  experienceyears?: string;
}

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface ExtendedSession {
  user: ExtendedUser;
}





type EventDTO = {
  // mapped for the UI
  id: string;                 // use event mongo _id as string
  name: string;
  image_url?: string;
  venue?: string;
  time?: string;
  address?: string;
  host?: string;
  tags?: string[];

  // scores returned by /api/events/query
  overlap: number;
  jaccard: number;
  cosine: number;
  commonTags: string[];
};

function isValidEvent(x: any): x is EventDTO {
  return x && typeof x.id === "string" && typeof x.name === "string";
}

export default function DiscoverEventsPage() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  

  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();

    (async () => {
      if (status === "loading") return;

      try {
        setLoading(true);
        setErr(null);

        const userId = (session as any)?.user?.id as string | undefined;
        if (!userId) throw new Error("Missing userId on session.");

        const params = new URLSearchParams({
          userId,
          limit: "50",
          minOverlap: "1",
        });

        const res = await fetch(`/api/events/query?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = (await res.json()) as any[];

        // Normalize: /api/events/query returns something like:
        // { mongoId, id (int), name, image_url, venue, time, address, host, tags, overlap, jaccard, cosine, commonTags }
        const clean = (Array.isArray(raw) ? raw : [])
          .map((r) => ({
            id: String(r.mongoId ?? r._id ?? r.id), // prefer mongoId
            name: String(r.name ?? ""),
            image_url: String(r.image_url ?? ""),
            venue: String(r.venue ?? ""),
            time: String(r.time ?? ""),
            address: String(r.address ?? ""),
            host: String(r.host ?? ""),
            tags: Array.isArray(r.tags) ? r.tags : [],
            overlap: Number(r.overlap ?? 0),
            jaccard: Number(r.jaccard ?? 0),
            cosine: Number(r.cosine ?? 0),
            commonTags: Array.isArray(r.commonTags) ? r.commonTags : [],
          }))
          .filter(isValidEvent);

        if (mounted) {
          setEvents(clean);
          setIdx(0);
          console.log("Loaded events:", clean);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load events");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [session, status]);

  const current = events[idx];
  const next = events[idx + 1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const opacity = useTransform(x, [-300, 0, 300], [0.65, 1, 0.65]);

  const onDragEnd = (
    _: PointerEvent | MouseEvent | TouchEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.25;
    if (power > 500) {
      // If you later want to record "like/pass", post here with current.id

      // 
      const dir = info.offset.x > 0 ? "right" : "left";

      console.log("swiped");
      console.log(current.id);
      console.log(current.name);

      if (dir === "right" && current?.id) {

        const userId = session?.user.id;
        const eventId = current.id;
        const action = "attend";

        console.log(`Wanting to let you now that ${userId} is planning to ${action} event ${eventId}`)

        const res = fetch(`/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, userId, action }),
        });
        console.log("did i post?")


      }
      setIdx((i) => i + 1);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const resetDeck = () => setIdx(0);
  const canSwipe = useMemo(() => events.length > 0 && idx < events.length, [events.length, idx]);

  if (loading) {
    return (
      <main className="p-6 min-h-[60vh] grid place-items-center text-gray-600">
        Loading events...
      </main>
    );
  }

  if (err) {
    return (
      <main className="p-6 max-w-lg mx-auto">
        <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-xl">
          <div className="font-semibold mb-1">Failed to load</div>
          <div className="text-sm">{err}</div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-full bg-[var(--brown)]">
        <Navbar isLoggedIn={isLoggedIn} photo={"/caffeine.jpeg"} />
        <div className="flex flex-col items-center justify-center min-h-screen -translate-y-20">
          <h2 className="text-2xl text-white mb-4">Please log in to view events</h2>
          <p className="text-white">You need to be logged in to see events tailored to your skills.</p>
        </div>
      </div>
    );
  }

  if (!canSwipe) {
    return (
      <main className="p-6 min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-gray-700">
          <div className="text-lg font-semibold">No more events</div>
          <button
            onClick={resetDeck}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
          >
            Reset deck
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"} />
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="relative h-[70vh]">
          {next && <div className="absolute inset-0 translate-y-2 scale-[0.98] rounded-2xl bg-gray-100" />}

          {current && (
            <motion.article
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-200"
            >
              <div className="h-2/3 bg-gray-100 relative">
                <img
                  src={current.image_url || "/placeholder.jpg"}
                  alt={current.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <h2 className="text-xl font-semibold">{current.name}</h2>
                  <p className="text-sm opacity-90">
                    {current.venue || "—"} • {current.time || ""}
                  </p>
                </div>
              </div>
              <div className="h-1/3 p-4 flex flex-col gap-3">
                <div className="text-sm text-gray-700">
                  {current.address || current.host || ""}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(current.commonTags ?? []).slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300"
            onClick={() => setIdx((i) => i + 1)}
          >
            Pass
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
            onClick={() => setIdx((i) => i + 1)}
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}
