"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

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
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false); // 👈 added

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const USER_QUEUE = await fetch("/api/users", { cache: "no-store" });
        if (!USER_QUEUE.ok) throw new Error(`HTTP ${USER_QUEUE.status}`);
        const raw = (await USER_QUEUE.json()) as unknown[];
        const clean = (Array.isArray(raw) ? raw : [])
          .filter(isValidUser)
          .map(u => ({
            ...u,
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
    return () => {
      mounted = false;
    };
  }, []);

  // 👇 Reset bio overflow when card changes
  useEffect(() => {
    setShowFullBio(false);
  }, [idx]);

  const current = users[idx];
  const next = users[idx + 1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const opacity = useTransform(x, [-300, 0, 300], [0.65, 1, 0.65]);

  const onDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.25;
    if (power > 500) {
      const dir = info.offset.x > 0 ? "right" : "left";
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
      <main className="p-6 min-h screen" style={{ backgroundColor: "#f7f7f5" }}>
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
    <main className="p-4 pt-36">
      <div className="w-full max-w-lg mx-auto">
        <div className="relative h-[70vh]">
          {next && (
            <div className="absolute inset-0 translate-y-2 scale-[0.98] rounded-2xl bg-gray-100" />
          )}

          {current && (
            <motion.article
                style={{
                   x,
                   rotate,
                   opacity,
            backgroundColor: "#D5B893", // 👈 your hex code here
              }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={onDragEnd}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200"
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
                {/* 👇 Bio with overflow toggle */}
              <div className="text-sm text-gray-700">
                <p className={showFullBio ? "" : "line-clamp-3"}>
                {current.bio}
                </p>

              {current.bio.length > 160 && (
                <button
                  onClick={() => setShowFullBio(prev => !prev)}
                  className="text-blue-600 text-xs mt-1 underline"
                  >
                 {showFullBio ? "Show less" : "Show more"}
              </button>
            )}
          </div>


                <div className="flex flex-wrap gap-2">
                  {(current.skills || []).slice(0, 6).map(s => (
                    <span
                      key={s}
                      className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-full"
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
