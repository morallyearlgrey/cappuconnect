"use client"; // Required for client-side React hooks in Next.js App Router

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";


// temp variable to assume we are the user
const kai_temp_id = "68cf6b837edad86a28bb857f";

// shape returned by /api/matches/query (after optional API tweak above)
type MatchDTO = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  bio?: string;
  photo?: string;
  state?: string;
  industry?: string;
  experienceyears?: string;
  overlap: number;
  jaccard: number;
  cosine: number;
  commonSkills: string[];
};

function isValidMatch(x: any): x is MatchDTO {
  return x && typeof x.id === "string" && typeof x.firstname === "string" && typeof x.lastname === "string";
}

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

// Type guard: unknown → UserDTO
function isValidUser(u: unknown): u is UserDTO {
  if (!u || typeof u !== "object") return false;
  const x = u as Record<string, unknown>;
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated"; 

  // update shit
  
  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();

    (async () => {
      // wait until we know auth state
      if (status === "loading") return;

      try {
        setLoading(true);
        setErr(null);

        // grab the current user's mongo _id from the session
        const userId = (session as any)?.user?.id as string | undefined;
        if (!userId) {
          throw new Error("Missing userId on session. Ensure session.user.id is your Mongo _id.");
        }

        const params = new URLSearchParams({
          userId,
          limit: "50",       // tweak as you like
          minOverlap: "1",   // bump to 2/3 to hide weak matches
        });

        const res = await fetch(`/api/matches/query?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = (await res.json()) as unknown[];
        const raw = (await res.json()) as unknown[];
        const clean = (Array.isArray(raw) ? raw : [])
          .filter(isValidMatch)
          .map(u => ({
            ...u,
            firstname: u.firstname.trim(),
            lastname: u.lastname.trim(),
            bio: (u.bio ?? "").trim(),
            photo: (u.photo ?? "").trim(),
          }));

        if (mounted) {
          setUsers(clean);
          setIdx(0);
          console.log("Loaded matches:", clean);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load matches");
      } finally {
        if (mounted) setLoading(false);
      }
    })();


    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [session, status]);

  // Initial load: fetch users, validate, normalize a few fields, then store.
  // useEffect(() => {
  //   let mounted = true; // prevents state updates after unmount
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       setErr(null);

  //       // Fetch the latest users (no caching)
  //       const USER_QUEUE = await fetch("/api/matches/query", { cache: "no-store" });
  //       console.log(USER_QUEUE);
  //       if (!USER_QUEUE.ok) throw new Error(`HTTP ${USER_QUEUE.status}`);

  //       // Parse response and validate shape with the type guard
  //       const raw = (await USER_QUEUE.json()) as unknown[];
  //       const clean = (Array.isArray(raw) ? raw : [])
  //         .filter(isValidUser) // narrows to UserDTO[]
  //         .map(u => ({
  //           ...u,
  //           // Trim some key display fields for neatness
  //           firstname: u.firstname.trim(),
  //           lastname: u.lastname.trim(),
  //           bio: u.bio.trim(),
  //           photo: u.photo.trim(),
  //         }));

  //       if (mounted) {
  //         setUsers(clean);
  //         setIdx(0);
  //         console.log("Loaded users:", clean);
  //       }
  //     } catch (e: any) {
  //       if (mounted) setErr(e?.message || "Failed to load users");
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   })();
  //   // Cleanup: mark unmounted to avoid setState warnings if the fetch finishes late
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  // Current card and the “next” card (for a subtle stacked look)
  const current = users[idx];
  const next = users[idx + 1];

  // Framer Motion swipe state
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const opacity = useTransform(x, [-300, 0, 300], [0.65, 1, 0.65]);

  const onDragEnd = (
    _: PointerEvent | MouseEvent | TouchEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.25;

    if (power > 500) {
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


      setIdx(i => i + 1);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const resetDeck = () => setIdx(0);
  const canSwipe = useMemo(() => users.length > 0 && idx < users.length, [users.length, idx]);

  if (loading) {
    return (
      <main className="p-6 min-h-[60vh] grid place-items-center text-gray-600">
        Loading users...
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
          <h2 className="text-2xl font-[subheading-font] text-white mb-4">
            Please log in to view events
          </h2>
          <p className="text-white font-[subheading-font]">
            You need to be logged in to see events with your matches.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <main className="">
      <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"} />

      <div className="w-full max-w-lg mx-auto p-4">
        <div className="relative h-[70vh]">
          {next && (
            <div className="absolute inset-0 translate-y-2 scale-[0.98] rounded-2xl bg-gray-100" />
          )}

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
                  src={current.photo || "/placeholder.jpg"}
                  alt={`${current.firstname} ${current.lastname}`}
                  className="h-full w-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <h2 className="text-xl font-semibold">
                    {current.firstname} {current.lastname}
                  </h2>
                  <p className="text-sm opacity-90">
                    {current.industry} • {current.state}
                  </p>
                </div>
              </div>

              <div className="h-1/3 p-4 flex flex-col gap-3">
                <p className="text-sm text-gray-700 line-clamp-3">{current.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {current.skills.slice(0, 6).map(skill => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-full"
                    >
                      {skill}
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
                      className="text-sm underline text-gray-600"
                    >
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300"
            onClick={() => setIdx(i => i + 1)}
          >
            Pass
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
            onClick={() => setIdx(i => i + 1)}
          >
            Connect
          </button>
        </div>
      </div>
    </main>
  );
}
