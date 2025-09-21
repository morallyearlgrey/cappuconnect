"use client"

import React, { useState } from 'react';
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import EventCard from "@/components/ui/eventcard";

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('NETWORK');
  const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated"; 
  // Sample people data
  const people = [
    {
      id: 1,
      name: "Sarayu Marri",
      title: "Undergraduate Student",
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      name: "Sarayu Marri",
      title: "Undergraduate Student", 
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      name: "Sarayu Marri",
      title: "Undergraduate Student",
      image: "/api/placeholder/60/60"
    },
    {
      id: 4,
      name: "Sarayu Marri",
      title: "Undergraduate Student",
      image: "/api/placeholder/60/60"
    },
    {
      id: 5,
      name: "Sarayu Marri",
      title: "Undergraduate Student",
      image: "/api/placeholder/60/60"
    }
  ];

  // Sample events data
  const events = [
    {
      id: 1,
      title: "NAME OF WORKSHOP",
      location: "San Francisco, CA",
      date: "October 24, 2024",
      description: "Learn about React and what it's like to be so smart and good at front-end development, haha...",
      image: "/api/placeholder/100/80",
      tags: ["SQL", "JavaScript", "React", "MongoDB"]
    },
    {
      id: 2,
      title: "NAME OF WORKSHOP",
      location: "San Francisco, CA", 
      date: "October 24, 2024",
      description: "Learn about React and what it's like to be so smart and good at front-end development, haha...",
      image: "/api/placeholder/100/80",
      tags: ["SQL", "JavaScript", "React", "MongoDB"]
    },
    {
      id: 3,
      title: "NAME OF WORKSHOP",
      location: "San Francisco, CA",
      date: "October 24, 2024", 
      description: "Learn about React and what it's like to be so smart and good at front-end development, haha...",
      image: "/api/placeholder/100/80",
      tags: ["SQL", "JavaScript", "React", "MongoDB"]
    },
    {
      id: 4,
      title: "NAME OF WORKSHOP",
      location: "San Francisco, CA",
      date: "October 24, 2024",
      description: "Learn about React and what it's like to be so smart and good at front-end development, haha...",
      image: "/api/placeholder/100/80", 
      tags: ["SQL", "JavaScript", "React", "MongoDB"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
     <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"}></Navbar>


      {/* Main Content */}
      <div className="flex h-[calc(100vh-100px)]">
        {/* People Section */}
        <div className="w-1/3 bg-[#768CA3] p-6">
          <h2 className="text-2xl font-bold text-[#25344F] mb-6">PEOPLE</h2>
          <div className="space-y-4">
            {people.map((person) => (
              <div key={person.id} className="flex items-center space-x-4 bg-white bg-opacity-30 rounded-lg p-3 hover:bg-opacity-40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#768CA3]">
                  <img 
                    src={person.image} 
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[#25344F] font-semibold text-sm">{person.name}</h3>
                  <p className="text-[#25344F] text-xs">{person.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="w-2/3 bg-[#F7F7F5] p-6 overflow-y-auto">
         <h2 className="text-2xl font-bold text-[#25344F] mb-6">EVENTS</h2>
         <div className="grid grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard
                key={event.id}
                title={event.title}
                location={event.location}
                date={event.date}
                description={event.description}
                image={event.image}
                tags={event.tags}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
  );
};

export default NetworkPage;