"use client"

import React, { useState } from 'react';
import EventCard from "@/components/ui/eventcard";
import PersonCard from "@/components/ui/personcard";

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('NETWORK');

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
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 p-4">
        <div className="flex justify-center space-x-12">
          {['NETWORK', 'DISCOVER', 'ACCOUNT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-semibold px-6 py-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'text-blue-300 border-b-2 border-blue-300'
                  : 'text-white hover:text-blue-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-100px)]">

        {/* People Section */}
        <div className="w-1/3 bg-[#768CA3] p-6">
          <h2 className="text-2xl font-bold text-[#25344F] mb-6">PEOPLE</h2>
          <div className="space-y-4">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                name={person.name}
                title={person.title}
                image={person.image}
              />
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