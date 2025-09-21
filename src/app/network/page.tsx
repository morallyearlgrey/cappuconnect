"use client"

import React, { useState } from 'react';
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";


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
        <div className="w-1/3 bg-slate-400 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">PEOPLE</h2>
          <div className="space-y-4">
            {people.map((person) => (
              <div key={person.id} className="flex items-center space-x-4 bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                  <img 
                    src={person.image} 
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{person.name}</h3>
                  <p className="text-blue-200 text-xs">{person.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="w-2/3 bg-white p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">EVENTS</h2>
          <div className="grid grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-amber-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow aspect-square flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">{event.title}</h3>
                  <div className="w-16 h-12 bg-gray-300 rounded overflow-hidden ml-2">
                    <img 
                      src={event.image} 
                      alt="Event"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-600 mb-3">
                  <p>{event.location}</p>
                  <p>{event.date}</p>
                </div>

                <p className="text-gray-700 text-xs mb-4 leading-relaxed flex-1">
                  {event.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-auto">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tag === 'SQL' || tag === 'JavaScript' 
                          ? 'bg-blue-400 text-white' 
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;