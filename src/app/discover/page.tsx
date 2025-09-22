"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth"; // ✅ import from "next-auth" for the type

// Shape returned by /api/matches/query
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

// Type guard for MatchDTO
function isValidMatch(x: unknown): x is MatchDTO {
  if (!x || typeof x !== "object") return false;
  const m = x as Partial<MatchDTO>;
  return (
    typeof m.id === "string" &&
    typeof m.firstname === "string" &&
    typeof m.lastname === "string"
  );
}

// Total number of random photos in public/images_dir (user_0002.jpg to user_0100.jpg)
const TOTAL_RANDOM_PHOTOS = 99;

// Function to get a consistent random photo for a user
function getRandomPhotoForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  const photoNumber = (Math.abs(hash) % TOTAL_RANDOM_PHOTOS) + 2;
  const paddedNumber = photoNumber.toString().padStart(4, "0");
  return `/images_dir/user_${paddedNumber}.jpg`;
}

// Function to check if a photo URL is valid/accessible
function isValidPhotoUrl(url: string): boolean {
  if (!url.trim()) return false;
  const invalidPatterns = ["placeholder.jpg", "placeholder.png", "image not found", "undefined", "null"];
  const lowerUrl = url.toLowerCase();
  return !invalidPatterns.some(pattern => lowerUrl.includes(pattern));
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<MatchDTO[]>([]);
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

        const userId = (session as Session)?.user?.id;
        if (!userId) throw new Error("Missing userId on session.");

        const params = new URLSearchParams({
          userId,
          limit: "50",
          minOverlap: "1",
        });

        const res = await fetch(`/api/matches/query?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw: unknown[] = await res.json();
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
      } catch (e: unknown) {
        if (mounted) {
          if (e instanceof Error) setErr(e.message);
          else setErr("Failed to load matches");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [session, status]);

  const current = users[idx];
  const next = users[idx + 1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const opacity = useTransform(x, [-300, 0, 300], [0.65, 1, 0.65]);

  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.25;
    if (power > 500 && current?.id) {
      if (info.offset.x > 0) {
        fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: current.id }),
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

  const getPhotoForUser = (user: MatchDTO): string => {
    return user.photo && isValidPhotoUrl(user.photo) ? user.photo : getRandomPhotoForUser(user.id);
  };

  if (loading) return <main className="p-6 min-h-[60vh] grid place-items-center text-gray-600">Loading users...</main>;
  if (err) return (
    <main className="p-6 max-w-lg mx-auto">
      <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-xl">
        <div className="font-semibold mb-1">Failed to load</div>
        <div className="text-sm">{err}</div>
      </div>
    </main>
  );
  if (status === "unauthenticated") return (
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
  if (!canSwipe) return (
    <main className="p-6 min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-gray-700">
        <div className="text-lg font-semibold">No more profiles</div>
        <button onClick={resetDeck} className="px-4 py-2 rounded-lg bg-gray-900 text-white">Reset deck</button>
      </div>
    </main>
  );

  return (
    <main>
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
                  src={getPhotoForUser(current)}
                  alt={`${current.firstname} ${current.lastname}`}
                  className="h-full w-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = "/caffeine.jpeg"; }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <h2 className="text-xl font-semibold">{current.firstname} {current.lastname}</h2>
                  <p className="text-sm opacity-90">{current.industry} • {current.state}</p>
                </div>
              </div>
              <div className="h-1/3 p-4 flex flex-col gap-3">
                <p className="text-sm text-gray-700 line-clamp-3">{current.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {current.commonSkills.slice(0, 6).map(skill => (
                    <span key={skill} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button className="px-4 py-2 rounded-lg border border-gray-300" onClick={() => setIdx(i => i + 1)}>Pass</button>
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={() => setIdx(i => i + 1)}>Connect</button>
        </div>
      </div>
    </main>
  );
}
