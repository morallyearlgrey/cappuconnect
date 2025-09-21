"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('DISCOVER');
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // Sample profile data - you can expand this array
  const profiles = [
    {
      id: 1,
      name: "Gigachad",
      title: "Head of Department of Gigachad",
      subtitle: "Serum PM",
      field: "Product Management",
      experience: "10+ Years of Experience",
      location: "Orlando, FL",
      linkedIn: "#",
      resume: "#",
      bio: "I am Gigachad, I sell serum to be like me. Strong and cool. My background in product development and coolness has been implemented in Meta and Apple.",
      website: "www.gigachad.com",
      skills: ["React", "Product Management", "Leadership"],
      companies: ["Meta", "Apple", "iOS"],
      image: "/api/placeholder/200/200"
    },
    {
      id: 2,
      name: "Jane Smith",
      title: "Senior Software Engineer",
      subtitle: "Tech Lead",
      field: "Software Development",
      experience: "8+ Years of Experience",
      location: "San Francisco, CA",
      linkedIn: "#",
      resume: "#",
      bio: "Passionate full-stack developer with expertise in modern web technologies. Led multiple successful product launches at top tech companies.",
      website: "www.janesmith.dev",
      skills: ["JavaScript", "React", "Node.js"],
      companies: ["Google", "Spotify", "Airbnb"],
      image: "/api/placeholder/200/200"
    },
    {
      id: 3,
      name: "Alex Chen",
      title: "UX Design Director",
      subtitle: "Creative Lead",
      field: "User Experience Design",
      experience: "12+ Years of Experience",
      location: "New York, NY",
      linkedIn: "#",
      resume: "#",
      bio: "Award-winning designer focused on creating intuitive and delightful user experiences. Specializing in mobile-first design and accessibility.",
      website: "www.alexchen.design",
      skills: ["Figma", "User Research", "Design Systems"],
      companies: ["Adobe", "Netflix", "Uber"],
      image: "/api/placeholder/200/200"
    }
  ];

  const currentProfile = profiles[currentProfileIndex];

  const nextProfile = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
  };

  const prevProfile = () => {
    setCurrentProfileIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

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
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-6">
        <div className="flex items-center space-x-8">
          {/* Left Arrow */}
          <button
            onClick={prevProfile}
            className="bg-slate-600 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Profile Card */}
          <div className="bg-amber-200 rounded-lg p-8 w-96 shadow-xl">
            <div className="flex gap-6 mb-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={currentProfile.image} 
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentProfile.name}</h3>
                <p className="text-gray-700 font-semibold mb-1">{currentProfile.title}</p>
                <p className="text-gray-700 font-semibold mb-3">{currentProfile.subtitle}</p>
                
                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <p className="font-semibold text-blue-600">{currentProfile.field}</p>
                  <p className="font-semibold text-blue-600">{currentProfile.experience}</p>
                  <p className="font-semibold text-blue-600">{currentProfile.location}</p>
                  <p>
                    <a href={currentProfile.linkedIn} className="text-blue-600 hover:underline font-semibold">LinkedIn</a>
                    <span className="mx-2">|</span>
                    <a href={currentProfile.resume} className="text-blue-600 hover:underline font-semibold">Resume</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-800 mb-4 leading-relaxed">
              {currentProfile.bio}
            </p>

            {/* Website */}
            <p className="text-blue-600 hover:underline cursor-pointer mb-6 font-medium">
              {currentProfile.website}
            </p>

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {currentProfile.skills.map((skill, index) => (
                <span key={index} className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
              {currentProfile.companies.map((company, index) => (
                <span key={index} className="bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {company}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                Pass
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                Connect
              </button>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextProfile}
            className="bg-slate-600 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* Profile Counter */}
      <div className="text-center pb-6">
        <span className="text-gray-600 font-medium">
          {currentProfileIndex + 1} of {profiles.length}
        </span>
      </div>
    </div>
  );
};

export default DiscoverPage;