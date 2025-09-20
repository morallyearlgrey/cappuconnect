// app/page.tsx - Network & Events App
"use client";
import React, { useState } from 'react';

// Types
interface User {
  id: string;
  name: string;
  description: string;
  avatar: string;
  profileImage: string;
  bio: string;
  skills: string[];
  connectedDate: string;
}

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  tags: string[];
  attendees: User[];
  eventImage: string;
}

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

// Mock data - Your connected network
const connectedUsers: User[] = [
  { 
    id: '1', 
    name: 'Sarah Chen', 
    description: 'Full Stack Developer', 
    avatar: 'https://placehold.co/40x40/3B82F6/ffffff?text=SC',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    bio: 'Passionate full-stack developer with 3+ years experience in React and Node.js',
    skills: ['React', 'Node.js', 'TypeScript', 'Python'],
    connectedDate: '2024-09-15'
  },
];

// Create events with attendee references that will be populated later
const createNetworkEvents = (users: User[]): Event[] => [
  {
    id: '1',
    title: 'React Advanced Patterns Workshop',
    location: 'San Francisco, CA',
    date: 'October 24, 2024',
    description: 'Deep dive into advanced React patterns including compound components, render props, and custom hooks.',
    tags: ['React', 'JavaScript', 'Frontend'],
    attendees: [users[0]], // Only Sarah
    eventImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'Data Science & ML Meetup',
    location: 'San Francisco, CA',
    date: 'October 28, 2024',
    description: 'Monthly meetup for data scientists to share insights and network.',
    tags: ['Data Science', 'Machine Learning', 'Python'],
    attendees: [users[0]], // Only Sarah
    eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Product Strategy Summit',
    location: 'Palo Alto, CA',
    date: 'November 5, 2024',
    description: 'Strategic planning and product management best practices for tech companies.',
    tags: ['Product Management', 'Strategy', 'Leadership'],
    attendees: [users[0]], // Only Sarah
    eventImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop'
  },
  {
    id: '4',
    title: 'Full Stack Developer Conference',
    location: 'San Jose, CA',
    date: 'November 12, 2024',
    description: 'Two-day conference covering frontend, backend, and DevOps technologies.',
    tags: ['Full Stack', 'Web Development', 'DevOps'],
    attendees: [users[0]], // Only Sarah
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'UX Design Workshop',
    location: 'Berkeley, CA',
    date: 'November 18, 2024',
    description: 'Hands-on workshop covering user research, wireframing, and prototyping.',
    tags: ['UX Design', 'Prototyping', 'User Research'],
    attendees: [users[0]], // Only Sarah
    eventImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=300&fit=crop'
  },
];

// Components
function NavBar({ brandName, imageSrcPath, selectedTab, onTabChange }: NavBarProps) {
  const navItems = [
    { key: "network", label: "Network" }, 
    { key: "discover", label: "Discover" }, 
    { key: "Account", label: "Account" }
  ];

  return (
    <nav className="w-full" style={{ backgroundColor: "#5f4130" }}>
      <div className="flex justify-between items-center px-6 py-4">
        {/* Nav items on the left */}
        <ul className="flex space-x-8">
          {navItems.map((item) => (
            <li
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className="cursor-pointer"
            >
              <a
                className="text-3xl font-bold transition-colors duration-200 hover:text-amber-200"
                style={{
                  color: selectedTab === item.key ? "#e3c7a0" : "#d5b893",
                  fontFamily: "'Inter', sans-serif",
                  textDecoration: "none",
                }}
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Brand/logo on the right */}
        <a
          className="flex items-center text-3xl font-bold"
          href="#"
          style={{ 
            color: "#d5b893", 
            fontFamily: "'Inter', sans-serif", 
            textDecoration: "none" 
          }}
          onClick={(e) => e.preventDefault()}
        >
          <img
            src={imageSrcPath}
            width="60"
            height="60"
            className="mr-3"
            alt="Brand Logo"
          />
          {brandName}
        </a>
      </div>
    </nav>
  );
}
const Sidebar = ({ users, activeUser, onUserSelect }: { 
  users: User[], 
  activeUser: string | null, 
  onUserSelect: (userId: string | null) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 text-gray-800 bg-white rounded-lg shadow-md"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed top-20 left-0 w-64 bg-slate-600 shadow-lg z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* Fixed Header */}
        <div className="bg-slate-600 border-b border-slate-500 px-4 py-4">
          <h2 className="text-xl font-bold text-white tracking-wide">PEOPLE</h2>
        </div>
        
        {/* Fixed All Network Button */}
        <div className="bg-slate-600 px-3 py-2 border-b border-slate-500">
          <button
            onClick={() => onUserSelect(null)}
            className={`flex items-center gap-3 p-3 w-full text-left rounded transition-colors duration-200 ${
              activeUser === null 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-200 hover:bg-slate-500'
            }`}
          >
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              ALL
            </div>
            <div>
              <h3 className="text-sm font-semibold">All Network Events</h3>
              <p className="text-xs opacity-75">View all events</p>
            </div>
          </button>
        </div>

        {/* Scrollable People List */}
        <div className="flex-1 overflow-y-auto bg-slate-600">
          <div className="px-3 py-2">
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => onUserSelect(user.id)}
                    className={`flex items-center gap-3 p-3 w-full text-left rounded transition-colors duration-200 ${
                      activeUser === user.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-200 hover:bg-slate-500'
                    }`}
                  >
                    <img src={user.profileImage} alt={user.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold">{user.name}</h3>
                      <p className="text-xs opacity-75">{user.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  return (
    <div className="bg-amber-100 border border-amber-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Event Header */}
      <div className="bg-amber-200 px-4 py-2">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">NAME OF WORKSHOP</h3>
      </div>
      
      {/* Event Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="w-20 h-16 bg-amber-200 rounded flex items-center justify-center">
            <img 
              src={event.eventImage} 
              alt={event.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-1 ml-4">
            <p className="text-xs text-gray-700 font-medium">{event.location}</p>
            <p className="text-xs text-gray-700">{event.date}</p>
          </div>
        </div>
        
        <h4 className="font-bold text-gray-800 text-sm mb-2">{event.title}</h4>
        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{event.description}</p>
        
        {/* Attending Connections */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {event.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                <img src={attendee.avatar} alt={attendee.name} className="h-4 w-4 rounded-full" />
                <span className="text-xs text-blue-700 font-medium">{attendee.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors font-medium">
          View Event Details
        </button>
      </div>
    </div>
  );
};

const UserProfile = ({ user, userEvents }: { user: User, userEvents: Event[] }) => (
  <div className="mb-6">
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Profile Header with Background Image */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute -bottom-12 left-6">
          <img 
            src={user.profileImage} 
            alt={user.name} 
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>
      </div>
      
      <div className="pt-16 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600 text-lg">{user.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Connected on {new Date(user.connectedDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">About</h3>
          <p className="text-gray-600">{user.bio}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          Message {user.name.split(' ')[0]}
        </button>
      </div>
    </div>

    <h3 className="text-xl font-bold text-gray-800 mb-4">
      {user.name.split(' ')[0]}'s Upcoming Events ({userEvents.length})
    </h3>
  </div>
);

// Main App Component
const NetworkApp = () => {
  const [activeTab, setActiveTab] = useState('network');
  const [activeUser, setActiveUser] = useState<string | null>(null);

  // Create events with proper user references
  const networkEvents = createNetworkEvents(connectedUsers);
  
  const selectedUser = connectedUsers.find(user => user.id === activeUser);
  
  const eventsToShow = activeUser 
    ? networkEvents.filter(event => event.attendees.some(attendee => attendee.id === activeUser))
    : networkEvents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavBar 
        brandName="CappuConnect" 
        imageSrcPath="https://placehold.co/60x60/8B4513/ffffff?text=☕" 
        selectedTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex">
        {/* Only show sidebar on Network tab */}
        {activeTab === 'network' && (
          <Sidebar users={connectedUsers} activeUser={activeUser} onUserSelect={setActiveUser} />
        )}
        
        <div className={`flex-1 ${activeTab === 'network' ? 'md:ml-64' : ''} p-6`}>
          {/* Network Tab Content */}
          {activeTab === 'network' && (
            <div className="h-full flex">
              {/* Events Section */}
              <div className="flex-1 bg-gray-100">
                {/* Events Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <h2 className="text-2xl font-bold text-gray-800 tracking-wide">EVENTS</h2>
                </div>
                
                {/* Events Content */}
                <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 160px)' }}>
                  {selectedUser ? (
                    <div>
                      <button 
                        onClick={() => setActiveUser(null)}
                        className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        ← Back to All Network Events
                      </button>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {selectedUser.name.split(' ')[0]}'s Events ({eventsToShow.length})
                      </h3>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-gray-600">
                        Events that your {connectedUsers.length} connection{connectedUsers.length !== 1 ? 's' : ''} {connectedUsers.length === 1 ? 'is' : 'are'} attending.
                      </p>
                    </div>
                  )}

                  {eventsToShow.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500 text-lg">
                        {selectedUser 
                          ? `${selectedUser.name.split(' ')[0]} isn't attending any upcoming events.`
                          : "No upcoming events from your network."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventsToShow.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discover Tab Content */}
          {activeTab === 'discover' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Discover Events</h1>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">🔍 Discover new events and expand your network</p>
                <p className="text-gray-400">Feature coming soon...</p>
              </div>
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'account' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Account</h1>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="your.email@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      rows={3} 
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkApp;