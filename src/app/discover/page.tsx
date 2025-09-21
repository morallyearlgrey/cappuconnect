// events/discover page. This is the page for doing the swipping stuff
"use client"; // This file uses React hooks on the client. Required in Next.js App Router.

// React hooks + Framer Motion for swipe physics/animation.
import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";


// temp variable to assume we are the user
const kai_temp_id = "68cf6b837edad86a28bb857f";

// Shape of a user object as returned by /api/users (no password here).
// This is grabbed from the specific system to get users without any filters
// we need to repalce this going forward with the priority system
// 
// for now, we need to get the system so that we can do personal edits to our current user
//
type UserDTO = {
  _id: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  experienceyears: string;
  firstname: string;
  lastname: string;
  industry: string;
  linkedin: string;
  major: string;
  photo: string;
  resume: string;
  school: string;
  skills: string[];
  state: string;
};

// (Optional) quick console fetch helper – not used in the UI.
// You can remove this, or keep it around for debugging.
function DebugUsers() {
  useEffect(() => {
    (async () => {
      try {
        // cache: "no-store" = always hit the API (no Next.js caching)
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const users = await res.json();
        console.log("Fetched users:", users);
        console.log("Count:", Array.isArray(users) ? users.length : 0);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    })();
  }, []);
}

// Type guard: checks unknown → UserDTO at runtime (defensive parsing).
function isValidUser(u: unknown): u is UserDTO {
  if (!u || typeof u !== "object") return false;
  const x = u as any;
  return (
    typeof x._id === "string" &&
    typeof x.firstname === "string" && x.firstname.trim().length > 0 &&
    typeof x.lastname  === "string" && x.lastname.trim().length  > 0 &&
    typeof x.bio       === "string" && x.bio.trim().length       > 0 &&
    typeof x.photo     === "string" && x.photo.trim().length     > 0 &&
    Array.isArray(x.skills)
  );
}

export default function DiscoverPage() {
  // users: cleaned/validated queue; idx: pointer to the current top card
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [idx, setIdx] = useState(0);

  // Loading/error states for nice UX
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { data: session, status } = useSession();
      const isLoggedIn = status === "authenticated"; 

  // Initial load: fetch users, validate, normalize a few fields, then store.
  useEffect(() => {
    let mounted = true; // prevents state updates after unmount
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Fetch the latest users (no caching)
        const USER_QUEUE = await fetch("/api/users", { cache: "no-store" });
        if (!USER_QUEUE.ok) throw new Error(`HTTP ${USER_QUEUE.status}`);

        // Parse response and validate shape with the type guard
        const raw = (await USER_QUEUE.json()) as unknown[];
        const clean = (Array.isArray(raw) ? raw : [])
          .filter(isValidUser) // narrows to UserDTO[]
          .map(u => ({
            ...u,
            // Trim some key display fields for neatness
            firstname: u.firstname.trim(),
            lastname: u.lastname.trim(),
            bio: u.bio.trim(),
            photo: u.photo.trim(),
          }));

        if (mounted) {
          setUsers(clean);
          setIdx(0);
          console.log("Loaded users:", clean);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // Cleanup: mark unmounted to avoid setState warnings if the fetch finishes late
    return () => {
      mounted = false;
    };
  }, []);

  // Current card and the “next” card (for a subtle stacked look)
  const current = users[idx];
  const next = users[idx + 1];

  // Framer Motion: horizontal position (x) drives rotation & opacity
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]); // tilt more as you drag further
  const opacity = useTransform(x, [-300, 0, 300], [0.65, 1, 0.65]); // fade a little on edges

  // When drag ends, decide if it counts as a swipe (based on distance + velocity).
  const onDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    // “Power” = drag distance + some velocity; tweak multiplier for sensitivity
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.25;

    if (power > 500) {
      // Considered a swipe; direction by x sign
      const dir = info.offset.x > 0 ? "right" : "left";

      // (Optional) report swipe to your API
      // this is where we need to add to our current system

      // fetch("/api/swipes", { method: "POST", headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ targetUserId: current?._id, dir }) });

      // api call to add to our list:
      if (dir === "right" && current?._id) {
      // fire-and-forget; optionally await and handle 'mutual' response
        fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: current._id }),
        }).catch(() => {});
    }


      // Move to next card, reset animation state
      setIdx(i => i + 1);
      x.set(0);
    } else {
      // Not strong enough → snap back
      x.set(0);
    }
  };

  // Reset deck back to the first card
  const resetDeck = () => setIdx(0);

  // Whether there are cards left to swipe
  const canSwipe = useMemo(() => users.length > 0 && idx < users.length, [users.length, idx]);

  // Loading view
  if (loading) {
    return (
      <main className="p-6 min-h-[60vh] grid place-items-center text-gray-600">
        Loading users...
      </main>
    );
  }

  // Error view
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

  // Empty deck view
  if (!canSwipe) {
    return (
      <main className="p-6 min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-gray-700">
          <div className="text-lg font-semibold">No more profiles</div>
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

  // Main swipe UI
  return (
    <main className="bg-[#5F4130] overflow-x-hidden">
                <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"}></Navbar>


      <div className="w-full max-w-lg mx-auto p-4">
        <div className="relative h-[70vh]">
          {/* Subtle “stacked” preview of the next card */}
          {next && (
            <div className="absolute inset-0 translate-y-2 scale-[0.98] rounded-2xl bg-gray-100" />
          )}

          {/* Top card – draggable horizontally */}
          {current && (
            <motion.article
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }} // free horizontal drag
              dragElastic={0.2}                         // resistance (lower = stiffer)
              onDragEnd={onDragEnd}
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-[#D5B893] border border-gray-200"
            >
              {/* Photo header */}
              <div className="h-2/3 bg-gray-100 relative">
                <img
                  src={current.photo || "/placeholder.jpg"}
                  alt={`${current.firstname} ${current.lastname}`}
                  className="h-full w-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
                {/* Name, industry, state overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <h2 className="text-xl font-semibold">
                    {current.firstname} {current.lastname}
                  </h2>
                  <p className="text-sm opacity-90">
                    {current.industry} • {current.state}
                  </p>
                </div>
              </div>

              {/* Bio + skills + links */}
              <div className="h-1/3 p-4 flex flex-col gap-3">
                <p className="text-sm text-[#25344F] line-clamp-3">{current.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {(current.skills || []).slice(0, 6).map(s => (
                    <span
                      key={s}
                      className="text-xs bg-[#768CA3] border border-[#25344F] px-2 py-1 rounded-full text-white"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-3">
                  {current.linkedin && (
                    <a
                      href={current.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-gray-900"
                    >
                      LinkedIn
                    </a>
                  )}
                  {current.resume && (
                    <a
                      href={current.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-white"
                    >
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          )}
        </div>

        {/* Simple action buttons as an alternative to dragging */}
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded-lg border border-[#D5B893] bg-[#D5B893] text-[#5F4130]"
            onClick={() => {
              // Simulate a “left swipe”
              setIdx(i => i + 1);
            }}
          >
            Pass
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#768CA3] text-[#25344F]"
            onClick={() => {
              // Simulate a “right swipe”
              setIdx(i => i + 1);
            }}
          >
            Connect
          </button>
        </div>
      </div>
    </main>
  );
}


