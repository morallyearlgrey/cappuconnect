"use client";

import React, { useState, useRef, useEffect } from 'react';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('DISCOVER');

  
  const [profiles, setProfiles] = useState([
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
  },
  // 🔽 Add more fake profiles below
  {
    id: 4,
    name: "Carlos Rivera",
    title: "Data Scientist",
    subtitle: "AI/ML Specialist",
    field: "Artificial Intelligence",
    experience: "6+ Years of Experience",
    location: "Austin, TX",
    linkedIn: "#",
    resume: "#",
    bio: "Data science wizard turning numbers into business gold. Loves training neural networks and building real-time dashboards.",
    website: "www.riveradata.ai",
    skills: ["Python", "TensorFlow", "Pandas"],
    companies: ["Tesla", "Palantir", "NVIDIA"],
    image: "/api/placeholder/200/200"
  },
  {
    id: 5,
    name: "Leila Mohammed",
    title: "Cybersecurity Engineer",
    subtitle: "Threat Intelligence Lead",
    field: "Security",
    experience: "9+ Years of Experience",
    location: "Chicago, IL",
    linkedIn: "#",
    resume: "#",
    bio: "Protecting the internet one firewall at a time. Penetration testing expert and cybersecurity consultant for Fortune 100 companies.",
    website: "www.leilacyber.com",
    skills: ["Network Security", "SIEM", "Threat Analysis"],
    companies: ["Cisco", "CrowdStrike", "IBM"],
    image: "/api/placeholder/200/200"
  },
  {
    id: 6,
    name: "Michael Jordanstein",
    title: "Creative Technologist",
    subtitle: "XR / AR / VR Developer",
    field: "Immersive Tech",
    experience: "7+ Years of Experience",
    location: "Seattle, WA",
    linkedIn: "#",
    resume: "#",
    bio: "Blending code and creativity to build immersive experiences. Known for crazy VR art installations and AR-powered retail apps.",
    website: "www.jordansteinxr.com",
    skills: ["Unity", "Three.js", "Blender"],
    companies: ["Magic Leap", "Meta", "Unity Technologies"],
    image: "/api/placeholder/200/200"
  },
  {
    id: 7,
    name: "Sophia Gupta",
    title: "Blockchain Developer",
    subtitle: "Smart Contract Architect",
    field: "Web3 & Blockchain",
    experience: "5+ Years of Experience",
    location: "Remote / Global",
    linkedIn: "#",
    resume: "#",
    bio: "Building decentralized apps and solving problems with cryptographic elegance. Heavy contributor to open-source DAOs.",
    website: "www.sophiag.dev",
    skills: ["Solidity", "Rust", "Ethereum"],
    companies: ["Chainlink", "Solana", "Uniswap"],
    image: "/api/placeholder/200/200"
  }
]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });

  const cardRef = useRef(null);

  const handleSwipe = (direction: string) => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (direction === 'right') {
      console.log('Connected!');
    } else if (direction === 'left') {
      console.log('Passed!');
    }

    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (isAnimating) return;
    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: 0,
      currentY: 0
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragState.isDragging || isAnimating) return;

    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    setDragState(prev => ({
      ...prev,
      currentX: deltaX,
      currentY: deltaY
    }));
  };

  const handleEnd = () => {
    if (!dragState.isDragging || isAnimating) return;

    const threshold = 100;

    if (Math.abs(dragState.currentX) > threshold) {
      if (dragState.currentX > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    }

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  // Native event handlers for document-level listeners
  const handleDocumentMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleDocumentMouseUp = (_e: MouseEvent) => handleEnd();

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (_e: React.TouchEvent<HTMLDivElement>) => {
    handleEnd();
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [dragState.isDragging]);

  const getCardStyle = () => {
    if (!dragState.isDragging) {
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 0.3s ease-out'
      };
    }

    const rotation = dragState.currentX * 0.1;
    return {
      transform: `translate(${dragState.currentX}px, ${dragState.currentY}px) rotate(${rotation}deg)`,
      transition: 'none'
    };
  };

  const handlePass = () => handleSwipe('left');
  const handleConnect = () => handleSwipe('right');

  interface Profile {
    id: number;
    name: string;
    title: string;
    subtitle: string;
    field: string;
    experience: string;
    location: string;
    linkedIn: string;
    resume: string;
    bio: string;
    website: string;
    skills: string[];
    companies: string[];
    image: string;
  }

  interface ProfileCardProps {
    profile: Profile;
    index: number;
    isTopCard: boolean;
  }

  const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, isTopCard }) => {
    const stackOffset = index * 10;
    const scale = 1 - index * 0.03;

    const style = isTopCard
      ? getCardStyle()
      : {
          transform: `translateY(${stackOffset}px) scale(${scale})`,
          transition: 'transform 0.3s ease-out',
          zIndex: -index,
        };

    return (
      <div
        ref={isTopCard ? cardRef : null}
        className="absolute bg-amber-200 rounded-lg p-8 w-96 shadow-xl select-none transition-transform duration-300 ease-in-out"
        style={style}
        onMouseDown={isTopCard ? handleMouseDown : undefined}
        onTouchStart={isTopCard ? handleTouchStart : undefined}
        onTouchMove={isTopCard ? handleTouchMove : undefined}
        onTouchEnd={isTopCard ? handleTouchEnd : undefined}
      >
        {/* Card Content */}
        <div className="flex gap-6 mb-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-600 rounded-lg overflow-hidden">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</h3>
            <p className="text-gray-700 font-semibold mb-1">{profile.title}</p>
            <p className="text-gray-700 font-semibold mb-3">{profile.subtitle}</p>
            <div className="space-y-1 text-sm text-gray-700 mb-4">
              <p className="font-semibold text-blue-600">{profile.field}</p>
              <p className="font-semibold text-blue-600">{profile.experience}</p>
              <p className="font-semibold text-blue-600">{profile.location}</p>
              <p>
                <a href={profile.linkedIn} className="text-blue-600 hover:underline font-semibold">LinkedIn</a>
                <span className="mx-2">|</span>
                <a href={profile.resume} className="text-blue-600 hover:underline font-semibold">Resume</a>
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-800 mb-4 leading-relaxed">{profile.bio}</p>
        <p className="text-blue-600 hover:underline cursor-pointer mb-6 font-medium">
          {profile.website}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {profile.skills.map((skill, index) => (
            <span key={index} className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium">
              {skill}
            </span>
          ))}
          {profile.companies.map((company, index) => (
            <span key={index} className="bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-medium">
              {company}
            </span>
          ))}
        </div>    
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
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

      {/* Card Stack */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-6">
        <div className="relative w-96 h-[600px] flex items-center justify-center">
          {currentCardIndex < profiles.length ? (
            profiles
              .slice(currentCardIndex, currentCardIndex + 3)
              .map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  isTopCard={index === 0}
                />
              ))
          ) : (
            <div className="text-center text-gray-500 text-xl font-semibold">
              <p className="mb-4">No more profiles!</p>
              <button
                onClick={() => {
                  setCurrentCardIndex(0);
                  setIsAnimating(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 space-y-2">
        <p className="text-gray-600 text-sm">
          Drag the card left to pass! Drag right to connect!
        </p>
        <span className="text-gray-600 font-medium">
          {currentCardIndex < profiles.length
            ? `Profile ${currentCardIndex + 1} of ${profiles.length}`
            : 'All profiles viewed'}
        </span>
      </div>
    </div>
  );
};

export default DiscoverPage;
