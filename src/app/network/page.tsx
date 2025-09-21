"use client";

import { EventCard } from "@/components/eventcard";
import PersonCard from "@/components/personcard"; // ⬅️ import PersonCard
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
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

export default function Events() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>([]);
  const [userMatches, setUserMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [matchedAttendeesCount, setMatchedAttendeesCount] = useState<{ [key: string]: number }>({});
  const [users, setUsers] = useState<User[]>([]);

  const isLoggedIn = status === "authenticated";
  const extendedSession = session as ExtendedSession | null;
    const [profile, setProfile] = useState<User | null>(null);
  

  useEffect(() => {
    if (status === "authenticated" && extendedSession?.user?.id) {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, extendedSession]);

  useEffect(() => {
    filterEvents();
  }, [events, userMatches, showAllEvents]);

  useEffect(() => {
    fetchPeopleData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUserMatches(), fetchEventData()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMatches = async () => {
    if (!extendedSession?.user?.id) return;

   try {
    const res = await fetch(`/api/users/${extendedSession.user.id}`, { method: "GET" });
    if (res.ok) {
      const userData = await res.json();
      // Make sure the API returns the user object itself
      setUserMatches(userData.matched || []);
      setProfile(userData); // <-- set the user object directly
    } else {
      console.error("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user matches:", error);
  }
};
  const fetchEventData = async () => {
    try {
      const res = await fetch("/api/events", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchPeopleData = async () => {
    try {
      const res = await fetch("/api/users", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filterEvents = () => {
    if (showAllEvents) {
      setFilteredEvents(events);
      return;
    }

    if (userMatches.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const eventsWithMatches = events.filter(event => {
      const matchedAttendees = event.attendees.filter(attendeeId => userMatches.includes(attendeeId));
      if (matchedAttendees.length > 0) {
        setMatchedAttendeesCount(prev => ({
          ...prev,
          [event._id]: matchedAttendees.length,
        }));
      }
      return matchedAttendees.length > 0;
    });

    setFilteredEvents(eventsWithMatches);
  };

  const toggleEventAttendance = async (eventId: string) => {
    if (!extendedSession?.user?.id) return;
    const userId = extendedSession.user.id;
    const action = isUserAttendingById(eventId) ? "leave" : "attend";

    try {
      const res = await fetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId, action }),
      });

      if (res.ok) {
        const result = await res.json();
        setEvents(prev =>
          prev.map(event =>
            event._id === eventId
              ? {
                  ...event,
                  attendees: result.attending
                    ? [...event.attendees, userId]
                    : event.attendees.filter(id => id !== userId),
                }
              : event
          )
        );
      }
    } catch (error) {
      console.error("Error toggling attendance:", error);
    }
  };

  const isUserAttendingById = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    return !!(event && extendedSession?.user?.id && event.attendees.includes(extendedSession.user.id));
  };

  const isUserAttending = (event: EventCardProps) => {
    return extendedSession?.user?.id && event.attendees.includes(extendedSession.user.id);
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="fixed w-screen h-screen overflow-hidden flex items-center justify-center">
        <div className="text-xl">Loading events...</div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
      return (
        <div className=" h-full bg-[var(--brown)]">
  
        <Navbar isLoggedIn={isLoggedIn} photo={"/caffeine.jpeg"} />
  
          <div className="flex flex-col items-center justify-center min-h-screen -translate-y-20">
            <h2 className="text-2xl font-[subheading-font] text-white mb-4">Please log in to view events</h2>
            <p className="text-white font-[subheading-font]">You need to be logged in to see events with your matches.</p>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-[var(--brown)]">
      <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"} />

      <div className="flex flex-row gap-x-6">
          <div className="flex flex-col w-1/3 overflow-y-scroll">
            <div className="w-full flex justify-center mt-4 flex-col place-self-center self-center items-center ">
              <div className="relative w-40 h-40 ">  
                <Image
              src="/caffeine.jpeg"
              alt={`${profile?.firstname || "User"} ${profile?.lastname || ""}`}
              fill
              className="rounded-full border-1 border-white"
              priority
            />
              </div>
              <div className="font-[subheading-font] text-2xl text-[var(--white)]">{profile?.firstname} {profile?.lastname}</div>

            </div>

        {/* People Section */}
          <div className="bg-[var(--brown)] p-6 h-screen">
            <h2 className="text-2xl font-[subheading-font] text-[var(--white)] p-2 text-center mb-6 ">CONNECTIONS</h2>
            <div className="space-y-4">
              {users
                .filter(person => extendedSession?.user?.id && person.matched?.includes(extendedSession.user.id))
                .map(person => (
                  <PersonCard
                    key={person._id}
                    firstname={person.firstname}
                    lastname={person.lastname}
                    linkedin={`https://linkedin.com/in/${person._id}`} // if you have linkedin field, use it
                    industry={person.industry || "Unknown"}
                    state={person.state || "N/A"}
                    school={person.school}
                    major={person.major}
                    experienceyears={person.experienceyears || "0"}
                    image={person.photo}
                  />
                ))}
            </div>
        </div>

          </div>


        {/* Events Section */}
        <div className="w-2/3 overflow-y-scroll h-[1000px] p-5 bg-[var(--tan)] ">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 flex-col">
            <h1 className="text-4xl font-[subheading-font] text-[var(--white)]">
              UPCOMING EVENTS
            </h1>
           
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {showAllEvents
                ? "No events available."
                : userMatches.length === 0
                ? "You don't have any matches yet. Start swiping to find matches!"
                : "None of your matches are attending upcoming events."}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 w-full">
              {filteredEvents.map(event => (
                <div key={event._id} className="relative">
                  {/* Match indicator */}
                  {!showAllEvents && matchedAttendeesCount[event._id] && (
                    <div
                      className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: "#d5b893", color: "#5f4130" }}
                    >
                      {matchedAttendeesCount[event._id]} match
                      {matchedAttendeesCount[event._id] > 1 ? "es" : ""} attending
                    </div>
                  )}

                  {/* Attendance toggle button */}
                  <div className="absolute top-4 left-4 z-10">
                    <Button
                      onClick={() => toggleEventAttendance(event._id)}
                      size="sm"
                      variant={isUserAttending(event) ? "default" : "outline"}
                      style={{
                        backgroundColor: isUserAttending(event) ? "#768ca3" : "rgba(255,255,255,0.9)",
                        borderColor: "#768ca3",
                        color: isUserAttending(event) ? "white" : "#768ca3",
                      }}
                      className="hover:scale-102 cursor-pointer transition-all"
                    >
                      {isUserAttending(event) ? "✓ Attending" : "+ Attend"}
                    </Button>
                  </div>

                  {/* Event Card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border">
                    <EventCard
                      name={event.name}
                      time={event.time}
                      cleaned_url={event.cleaned_url}
                      image_url={event.image_url}
                      tags={event.tags}
                      attendees={event.attendees}
                    />
                    <div className="p-4 rounded-b-lg bg-[var(--light-blue)]">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{event.attendees.length} attending</span>
                      </div>
                      {event.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-[var(--brown)] text-white"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
