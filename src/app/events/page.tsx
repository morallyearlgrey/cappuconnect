"use client";

import { EventCard } from "@/components/eventcard";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

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
  attendees: string[]; // array of user IDs
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  matched: string[]; // array of user IDs
  photo?: string;
  industry?: string;
}

// Extended session type
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
    const isLoggedIn = status === "authenticated"; 
  const [users, setUsers] = useState<User[]>([]);

  
  // Type assertion for session
  const extendedSession = session as ExtendedSession | null;

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
        setUserMatches(userData.matched || []);
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
      console.error("Error fetching data:", error);
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
        body: JSON.stringify({
          eventId,
          userId,
          action,
        }),
      });

      if (res.ok) {
        const result = await res.json();

        setEvents(prev =>
          prev.map(event => {
            if (event._id === eventId) {
              const updatedAttendees = result.attending
                ? [...event.attendees, extendedSession.user.id]
                : event.attendees.filter(id => id !== extendedSession.user.id);
              return { ...event, attendees: updatedAttendees };
            }
            return event;
          })
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
      <div className="fixed w-screen h-screen overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view events</h2>
          <p>You need to be logged in to see events with your matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

     <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"}></Navbar>
      <div className="flex flex-row gap-x-3">
      {/* Main Content */}
        <div className="w-1/3 overflow-y-scroll">
          {/* People Section */}
          <div className=" bg-[#768CA3] p-6 h-screen">
            <h2 className="text-2xl font-bold text-[#25344F] mb-6">PEOPLE</h2>
            <div className="space-y-4">
              {users.filter(
                (person) =>
                  extendedSession?.user?.id && person.matched?.includes(extendedSession.user.id)
              ).map((person) => (
                <div key={person._id} className="flex items-center space-x-4 bg-white bg-opacity-30 rounded-lg p-3 hover:bg-opacity-40 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#768CA3]">
                    <img 
                      src={person.photo || "/caffeine.jpeg"}
                      alt={person.firstname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[#25344F] font-semibold text-sm">{person.firstname} {person.lastname}</h3>
                    <p className="text-[#25344F] text-xs">{person.industry}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

        <div className="w-2/3 overflow-y-scroll h-screen">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 flex-col">
            <h1 className="text-4xl font-bold" style={{ color: "#5f4130" }}>
              Events with Your Matches
            </h1>

            <div className="flex gap-4 items-center">
              <div className="text-sm text-gray-600">You have {userMatches.length} matches</div>
            </div>
          </div>


          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {showAllEvents
                  ? "No events available."
                  : userMatches.length === 0
                  ? "You don't have any matches yet. Start swiping to find matches!"
                  : "None of your matches are attending upcoming events."}
              </div>
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
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow">
                    <EventCard
                      name={event.name}
                      time={event.time}
                      cleaned_url={event.cleaned_url}
                      image_url={event.image_url}
                      tags={event.tags}
                      attendees={event.attendees}
                    />

                    {/* Additional event info */}
                    <div className="p-4 border-t">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{event.attendees.length} attending</span>
                      </div>

                      {/* Show tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ backgroundColor: "#d5b893", color: "#5f4130" }}
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
