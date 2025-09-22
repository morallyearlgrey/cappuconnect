"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import Image from "next/image";

interface UserProfile {
  _id: string;
  firstname?: string;
  lastname?: string;
  image?: string;
  skills?: string[];
  school?: string;
  bio?: string;
  linkedin?: string;
  industry?: string;
  major?: string;
  experience?: number; // years of experience
}

// Extended session type to include user id
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const AccountPage = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn || !session) {
        setLoading(false);
        return;
      }

      // Type assertion to handle NextAuth session types
      const userSession = session as ExtendedSession;
      if (!userSession.user) {
        setLoading(false);
        return;
      }

      try {
        // Use email as identifier instead of id, or get id from session token/jwt
        const userId = userSession.user.id || userSession.user.email;
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, session]);

  // Helper function to safely get user image
  const getUserImage = (sessionData: typeof session): string => {
    return (sessionData as ExtendedSession)?.user?.image || "/caffeine.jpeg";
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen overflow-x-hidden fixed">
        <Navbar isLoggedIn={isLoggedIn} photo={getUserImage(session)} />
        
        <div className="inset-0 fixed bg-[var(--brown)] -z-10">
          <Image src="/caffeine.jpeg" alt="photo" fill className="object-cover opacity-30 -z-11" priority />
        </div>

        <div className="flex items-center justify-center h-screen w-screen  -translate-y-20">
          <div className="bg-[var(--white)] w-[50rem] h-[30rem] flex items-center justify-center shadow-lg rounded-2xl border-4 border-[var(--white)]">
            <div className="flex flex-col items-center justify-center p-20">
              <h1 className="text-3xl text-[var(--tan)] font-bold mb-6">ACCESS DENIED</h1>
              <p className="text-xl font-semibold text-[var(--dark-blue)]">Please log in to view your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen overflow-x-hidden fixed">
        <Navbar isLoggedIn={isLoggedIn} photo={getUserImage(session)} />
        
        <div className="inset-0 fixed bg-[var(--brown)] -z-10">
          <Image src="/caffeine.jpeg" alt="photo" fill className="object-cover opacity-30 -z-11" priority />
        </div>

        <div className="flex items-center justify-center h-screen w-screen -translate-y-20">
          <div className="bg-[var(--white)] w-[50rem] h-[30rem] flex items-center justify-center shadow-lg rounded-2xl border-4 border-[var(--tan)]">
            <div className="flex flex-col items-center justify-center p-20">
              <h1 className="text-3xl text-[var(--tan)] font-bold mb-6">LOADING</h1>
              <p className="text-xl font-semibold text-[var(--dark-blue)]">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden fixed">
      <Navbar isLoggedIn={isLoggedIn} photo={getUserImage(session)} />

      <div className="inset-0 fixed bg-[var(--brown)] -z-10">
        <Image src="/caffeine.jpeg" alt="photo" fill className="object-cover opacity-30 -z-11" priority />
      </div>

      <div className="flex items-center justify-center h-screen w-screen -translate-y-20">
        <div className="bg-[var(--white)] w-[70rem] h-[32rem] flex items-center justify-center shadow-lg rounded-2xl border-4 border-[var(--white)]">
          {profile && (
            <div className="flex flex-row w-full h-full items-center">
              {/* Profile Image Section */}
              <div className="relative w-1/2 h-full flex items-center justify-center p-8">
                <div className="w-64 h-64 rounded-lg overflow-hidden bg-gray-200 shadow-lg">
                  <img
                    src={profile.image || "/caffeine.jpeg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info Section */}
              <div className="w-1/2 h-full flex flex-col justify-center p-8  overflow-y-auto">
                <h1 className="text-4xl text-[var(--tan)] font-[subheading-font] mb-6">
                  WELCOME {profile.firstname?.toUpperCase()} {profile.lastname?.toUpperCase()}!
                </h1>

                <div className="space-y-3">

                  {profile.industry && (
                    <p className="text-[var(--dark-blue)] text-xl font-[subheading-font]">{profile.industry}</p>
                  )}

                  {profile.major && (
                    <div className="flex flex-row">
                       <p className="text-[var(--dark-blue)] text-lg font-[body-font]">Degree in {profile.major} from {profile.school}</p>
                      </div>

                  )}
                                   

                  {profile.bio && (
                    <div className="my-4">
                      <h3 className="text-[var(--tan)] text-xl font-[subheading-font] mb-2">PROFILE DESCRIPTION</h3>
                      <p className="text-[var(--dark-blue)] text-base leading-relaxed font-[body-font]">{profile.bio}</p>
                    </div>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="my-4">
                      <h3 className="text-[var(--tan)] font-bold mb-2">SKILLS</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-[var(--light-blue)] text-[var(--white)] px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[var(--light-blue)] text-white px-4 py-2 rounded-lg font-semibold hover:scale-102 transition-transform cursor-pointer"
                      >
                        LinkedIn
                      </a>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;