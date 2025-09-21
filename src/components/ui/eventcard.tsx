"use client";

import React from "react";

interface EventCardProps {
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
  tags: string[];
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  description,
  image,
  tags,
}) => {
  return (
    <div className="bg-[var(--light-blue)] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col max-h-80 overflow-y-auto">
      <div className="mb-3">
        <h3 className="font-bold text-[#25344F] text-sm mb-2">{title}</h3>
        <div className="w-32 h-20 bg-[var(--light-blue)] rounded overflow-hidden mb-2">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="text-right text-xs text-[#25344F] mb-3">
        <p>{location}</p>
        <p>{date}</p>
      </div>

      <p className="text-[#25344F] text-xs mb-4 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap gap-1 mt-auto">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className={`px-2 py-1 rounded text-xs font-medium ${
              tag === 'SQL' || tag === 'JavaScript' 
                ? 'bg-[#768CA3] text-[#D5B893]' 
                : 'bg-[#5F4130] text-[#D5B893]'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EventCard;