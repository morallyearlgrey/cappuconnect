// events/discover page. This is the page for doing the swipping stuff
"use client"; // This file uses React hooks on the client. Required in Next.js App Router.

// React hooks + Framer Motion for swipe physics/animation.
import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

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
    <main className="p-4">
      <div className="w-full max-w-lg mx-auto">
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
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-200"
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
                <p className="text-sm text-gray-700 line-clamp-3">{current.bio}</p>
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

        {/* Simple action buttons as an alternative to dragging */}
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300"
            onClick={() => {
              // Simulate a “left swipe”
              setIdx(i => i + 1);
            }}
          >
            Pass
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
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



// gets users from the database
// "use client";  // 👈 this tells Next.js this is a Client Component

// import { useEffect } from "react";

// export default function DebugUsers() {
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/users", { cache: "no-store" });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const users = await res.json();
//         console.log("Fetched users:", users);
//         console.log("Count:", Array.isArray(users) ? users.length : 0);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//       }
//     })();
//   }, []);

//   return <div>Open your browser console to see users.</div>;
// }



// "use client";

// import React, { useState, useRef, useEffect } from 'react';

// const DiscoverPage = () => {
//   const [activeTab, setActiveTab] = useState('DISCOVER');


  


  
//   const [profiles, setProfiles] = useState([
//   {
//     id: 1,
//     name: "Gigachad",
//     title: "Head of Department of Gigachad",
//     subtitle: "Serum PM",
//     field: "Product Management",
//     experience: "10+ Years of Experience",
//     location: "Orlando, FL",
//     linkedIn: "#",
//     resume: "#",
//     bio: "I am Gigachad, I sell serum to be like me. Strong and cool. My background in product development and coolness has been implemented in Meta and Apple.",
//     website: "www.gigachad.com",
//     skills: ["React", "Product Management", "Leadership"],
//     companies: ["Meta", "Apple", "iOS"],
//     image: "/api/placeholder/200/200"
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     title: "Senior Software Engineer",
//     subtitle: "Tech Lead",
//     field: "Software Development",
//     experience: "8+ Years of Experience",
//     location: "San Francisco, CA",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Passionate full-stack developer with expertise in modern web technologies. Led multiple successful product launches at top tech companies.",
//     website: "www.janesmith.dev",
//     skills: ["JavaScript", "React", "Node.js"],
//     companies: ["Google", "Spotify", "Airbnb"],
//     image: "/api/placeholder/200/200"
//   },
//   {
//     id: 3,
//     name: "Alex Chen",
//     title: "UX Design Director",
//     subtitle: "Creative Lead",
//     field: "User Experience Design",
//     experience: "12+ Years of Experience",
//     location: "New York, NY",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Award-winning designer focused on creating intuitive and delightful user experiences. Specializing in mobile-first design and accessibility.",
//     website: "www.alexchen.design",
//     skills: ["Figma", "User Research", "Design Systems"],
//     companies: ["Adobe", "Netflix", "Uber"],
//     image: "/api/placeholder/200/200"
//   },
//   // 🔽 Add more fake profiles below
//   {
//     id: 4,
//     name: "Carlos Rivera",
//     title: "Data Scientist",
//     subtitle: "AI/ML Specialist",
//     field: "Artificial Intelligence",
//     experience: "6+ Years of Experience",
//     location: "Austin, TX",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Data science wizard turning numbers into business gold. Loves training neural networks and building real-time dashboards.",
//     website: "www.riveradata.ai",
//     skills: ["Python", "TensorFlow", "Pandas"],
//     companies: ["Tesla", "Palantir", "NVIDIA"],
//     image: "/api/placeholder/200/200"
//   },
//   {
//     id: 5,
//     name: "Leila Mohammed",
//     title: "Cybersecurity Engineer",
//     subtitle: "Threat Intelligence Lead",
//     field: "Security",
//     experience: "9+ Years of Experience",
//     location: "Chicago, IL",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Protecting the internet one firewall at a time. Penetration testing expert and cybersecurity consultant for Fortune 100 companies.",
//     website: "www.leilacyber.com",
//     skills: ["Network Security", "SIEM", "Threat Analysis"],
//     companies: ["Cisco", "CrowdStrike", "IBM"],
//     image: "/api/placeholder/200/200"
//   },
//   {
//     id: 6,
//     name: "Michael Jordanstein",
//     title: "Creative Technologist",
//     subtitle: "XR / AR / VR Developer",
//     field: "Immersive Tech",
//     experience: "7+ Years of Experience",
//     location: "Seattle, WA",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Blending code and creativity to build immersive experiences. Known for crazy VR art installations and AR-powered retail apps.",
//     website: "www.jordansteinxr.com",
//     skills: ["Unity", "Three.js", "Blender"],
//     companies: ["Magic Leap", "Meta", "Unity Technologies"],
//     image: "/api/placeholder/200/200"
//   },
//   {
//     id: 7,
//     name: "Sophia Gupta",
//     title: "Blockchain Developer",
//     subtitle: "Smart Contract Architect",
//     field: "Web3 & Blockchain",
//     experience: "5+ Years of Experience",
//     location: "Remote / Global",
//     linkedIn: "#",
//     resume: "#",
//     bio: "Building decentralized apps and solving problems with cryptographic elegance. Heavy contributor to open-source DAOs.",
//     website: "www.sophiag.dev",
//     skills: ["Solidity", "Rust", "Ethereum"],
//     companies: ["Chainlink", "Solana", "Uniswap"],
//     image: "/api/placeholder/200/200"
//   }
// ]);

//   const [currentCardIndex, setCurrentCardIndex] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [dragState, setDragState] = useState({
//     isDragging: false,
//     startX: 0,
//     startY: 0,
//     currentX: 0,
//     currentY: 0
//   });

//   const cardRef = useRef(null);

//   const handleSwipe = (direction: string) => {
//     if (isAnimating) return;

//     setIsAnimating(true);

//     if (direction === 'right') {
//       console.log('Connected!');
//     } else if (direction === 'left') {
//       console.log('Passed!');
//     }

//     setTimeout(() => {
//       setCurrentCardIndex(prev => prev + 1);
//       setIsAnimating(false);
//     }, 300);
//   };

//   const handleStart = (clientX: number, clientY: number) => {
//     if (isAnimating) return;
//     setDragState({
//       isDragging: true,
//       startX: clientX,
//       startY: clientY,
//       currentX: 0,
//       currentY: 0
//     });
//   };

//   const handleMove = (clientX: number, clientY: number) => {
//     if (!dragState.isDragging || isAnimating) return;

//     const deltaX = clientX - dragState.startX;
//     const deltaY = clientY - dragState.startY;

//     setDragState(prev => ({
//       ...prev,
//       currentX: deltaX,
//       currentY: deltaY
//     }));
//   };

//   const handleEnd = () => {
//     if (!dragState.isDragging || isAnimating) return;

//     const threshold = 100;

//     if (Math.abs(dragState.currentX) > threshold) {
//       if (dragState.currentX > 0) {
//         handleSwipe('right');
//       } else {
//         handleSwipe('left');
//       }
//     }

//     setDragState({
//       isDragging: false,
//       startX: 0,
//       startY: 0,
//       currentX: 0,
//       currentY: 0
//     });
//   };

//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => handleStart(e.clientX, e.clientY);
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => handleMove(e.clientX, e.clientY);
//   const handleMouseUp = () => handleEnd();

//   // Native event handlers for document-level listeners
//   const handleDocumentMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
//   const handleDocumentMouseUp = (_e: MouseEvent) => handleEnd();

//   const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const touch = e.touches[0];
//     handleStart(touch.clientX, touch.clientY);
//   };

//   const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const touch = e.touches[0];
//     handleMove(touch.clientX, touch.clientY);
//   };

//   const handleTouchEnd = (_e: React.TouchEvent<HTMLDivElement>) => {
//     handleEnd();
//   };

//   useEffect(() => {
//     if (dragState.isDragging) {
//       document.addEventListener('mousemove', handleDocumentMouseMove);
//       document.addEventListener('mouseup', handleDocumentMouseUp);
//     }

//     return () => {
//       document.removeEventListener('mousemove', handleDocumentMouseMove);
//       document.removeEventListener('mouseup', handleDocumentMouseUp);
//     };
//   }, [dragState.isDragging]);

//   const getCardStyle = () => {
//     if (!dragState.isDragging) {
//       return {
//         transform: 'translate(0px, 0px) rotate(0deg)',
//         transition: 'transform 0.3s ease-out'
//       };
//     }

//     const rotation = dragState.currentX * 0.1;
//     return {
//       transform: `translate(${dragState.currentX}px, ${dragState.currentY}px) rotate(${rotation}deg)`,
//       transition: 'none'
//     };
//   };

//   const handlePass = () => handleSwipe('left');
//   const handleConnect = () => handleSwipe('right');

//   interface Profile {
//     id: number;
//     name: string;
//     title: string;
//     subtitle: string;
//     field: string;
//     experience: string;
//     location: string;
//     linkedIn: string;
//     resume: string;
//     bio: string;
//     website: string;
//     skills: string[];
//     companies: string[];
//     image: string;
//   }

//   interface ProfileCardProps {
//     profile: Profile;
//     index: number;
//     isTopCard: boolean;
//   }

//   const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, isTopCard }) => {
//     const stackOffset = index * 10;
//     const scale = 1 - index * 0.03;

//     const style = isTopCard
//       ? getCardStyle()
//       : {
//           transform: `translateY(${stackOffset}px) scale(${scale})`,
//           transition: 'transform 0.3s ease-out',
//           zIndex: -index,
//         };

//     return (
//       <div
//         ref={isTopCard ? cardRef : null}
//         className="absolute bg-amber-200 rounded-lg p-8 w-96 shadow-xl select-none transition-transform duration-300 ease-in-out"
//         style={style}
//         onMouseDown={isTopCard ? handleMouseDown : undefined}
//         onTouchStart={isTopCard ? handleTouchStart : undefined}
//         onTouchMove={isTopCard ? handleTouchMove : undefined}
//         onTouchEnd={isTopCard ? handleTouchEnd : undefined}
//       >
//         {/* Card Content */}
//         <div className="flex gap-6 mb-6">
//           <div className="flex-shrink-0">
//             <div className="w-32 h-32 bg-gray-600 rounded-lg overflow-hidden">
//               <img
//                 src={profile.image}
//                 alt={profile.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           </div>
//           <div className="flex-1">
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</h3>
//             <p className="text-gray-700 font-semibold mb-1">{profile.title}</p>
//             <p className="text-gray-700 font-semibold mb-3">{profile.subtitle}</p>
//             <div className="space-y-1 text-sm text-gray-700 mb-4">
//               <p className="font-semibold text-blue-600">{profile.field}</p>
//               <p className="font-semibold text-blue-600">{profile.experience}</p>
//               <p className="font-semibold text-blue-600">{profile.location}</p>
//               <p>
//                 <a href={profile.linkedIn} className="text-blue-600 hover:underline font-semibold">LinkedIn</a>
//                 <span className="mx-2">|</span>
//                 <a href={profile.resume} className="text-blue-600 hover:underline font-semibold">Resume</a>
//               </p>
//             </div>
//           </div>
//         </div>
//         <p className="text-gray-800 mb-4 leading-relaxed">{profile.bio}</p>
//         <p className="text-blue-600 hover:underline cursor-pointer mb-6 font-medium">
//           {profile.website}
//         </p>
//         <div className="flex flex-wrap gap-2 mb-6">
//           {profile.skills.map((skill, index) => (
//             <span key={index} className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium">
//               {skill}
//             </span>
//           ))}
//           {profile.companies.map((company, index) => (
//             <span key={index} className="bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-medium">
//               {company}
//             </span>
//           ))}
//         </div>    
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Navigation */}
//       <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 p-4">
//         <div className="flex justify-center space-x-12">
//           {['NETWORK', 'DISCOVER', 'ACCOUNT'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`text-lg font-semibold px-6 py-2 transition-all duration-200 ${
//                 activeTab === tab
//                   ? 'text-blue-300 border-b-2 border-blue-300'
//                   : 'text-white hover:text-blue-200'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Card Stack */}
//       <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-6">
//         <div className="relative w-96 h-[600px] flex items-center justify-center">
//           {currentCardIndex < profiles.length ? (
//             profiles
//               .slice(currentCardIndex, currentCardIndex + 3)
//               .map((profile, index) => (
//                 <ProfileCard
//                   key={profile.id}
//                   profile={profile}
//                   index={index}
//                   isTopCard={index === 0}
//                 />
//               ))
//           ) : (
//             <div className="text-center text-gray-500 text-xl font-semibold">
//               <p className="mb-4">No more profiles!</p>
//               <button
//                 onClick={() => {
//                   setCurrentCardIndex(0);
//                   setIsAnimating(false);
//                 }}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
//               >
//                 Start Over
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="text-center pb-6 space-y-2">
//         <p className="text-gray-600 text-sm">
//           Drag the card left to pass! Drag right to connect!
//         </p>
//         <span className="text-gray-600 font-medium">
//           {currentCardIndex < profiles.length
//             ? `Profile ${currentCardIndex + 1} of ${profiles.length}`
//             : 'All profiles viewed'}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default DiscoverPage;
