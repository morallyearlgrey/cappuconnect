"use client";
import React, { useState } from 'react';

// Mock user data for demonstration
const users = [
  { id: '1', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '2', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '3', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '4', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '5', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '6', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '7', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '8', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '9', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '10', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
  { id: '11', name: 'Sarayu Marri', description: 'Undergraduate Student', avatar: 'https://placehold.co/40x40/5D749B/ffffff?text=SM' },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
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
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">NETWORK</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-gray-800 dark:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">PEOPLE</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-10rem)]">
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => setActiveChat(user.id)}
                  className={`flex items-center gap-4 p-3 w-full text-left transition-colors duration-200 
                  ${activeChat === user.id 
                    ? 'bg-blue-500 text-white dark:bg-blue-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{user.name}</h3>
                    <p className="text-xs truncate">{user.description}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
