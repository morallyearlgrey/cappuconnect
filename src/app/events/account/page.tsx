"use client"

import React, { useState } from 'react';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('ACCOUNT');

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-0 h-[calc(100vh-200px)]">
          {/* Settings Panel */}
          <div className="w-1/2">
            <div className="bg-[#768CA3] rounded-l-lg p-6 h-full">
              <h2 className="text-2xl font-bold text-[#25344F] mb-8">SETTINGS</h2>
              <div className="space-y-4">
                <button className="w-full text-left text-[#25344F] hover:text-gray-200 py-2 px-4 rounded transition-colors">
                  Account Settings
                </button>            
              </div>
              
              <div className="mt-12 space-y-4">
                <button className="w-full text-left text-[#25344F] hover:text-gray-200 py-2 px-4 rounded transition-colors">
                  Delete Account
                </button>
                <button className="w-full text-left text-[#25344F] hover:text-gray-200 py-2 px-4 rounded transition-colors">
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Profile Panel */}
          <div className="w-1/2">
            <div className="bg-[#D5B893] rounded-r-lg p-6 h-full overflow-y-auto">
              <h2 className="text-3xl font-bold text-[#25344F] mb-6">PROFILE</h2>
              
              <div className="flex flex-col gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-[#D5B893] rounded-lg overflow-hidden">
                    <img 
                      src="/api/placeholder/128/128" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Gigachad</h3>
                  <p className="text-[#25344F] font-semibold mb-1">Head of Department of Gigachad</p>
                  <p className="text-[#25344F] font-semibold mb-3">Serum PM</p>
                  
                  <div className="space-y-1 text-sm text-[#25344F] mb-4">
                    <p><span className="font-semibold">DOB:</span> 1/1/2000</p>
                    <p><span className="font-semibold">Product Management</span></p>
                    <p><span className="font-semibold">10+ Years of Experience</span></p>
                    <p>
                      <a href="#" className="text-[#25344F] hover:underline font-semibold">LinkedIn</a>
                      <span className="mx-2">|</span>
                      <a href="#" className="text-[#25344F] hover:underline font-semibold">Resume</a>
                    </p>
                  </div>

                  <p className="text-[#25344F] mb-6 leading-relaxed">
                    I am Gigachad, I sell serum to be like me. Strong and cool.
                    My background in product development and coolness has
                    been implemented in Meta and Apple.
                  </p>

                  <p className="text-[#768CA3] mb-4 italic">Insert website if you have one</p>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-[#768CA3] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      React
                    </span>
                    <span className="bg-[#768CA3] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      Product Management
                    </span>
                    <span className="bg-[#768CA3] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      Leadership
                    </span>
                    <span className="bg-[#5F4130] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      Meta
                    </span>
                    <span className="bg-[#5F4130] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      Apple
                    </span>
                    <span className="bg-[#5F4130] text-[#D5B893] px-4 py-2 rounded-full text-sm font-medium">
                      iOS
                    </span>
                  </div>

                  {/* Edit Profile Button */}
                  <div className="flex justify-end">
                    <button className="bg-[#25344F] hover:bg-blue-600 text-[#D5B893] px-6 py-2 rounded-lg font-semibold transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;