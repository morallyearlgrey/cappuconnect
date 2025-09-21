// src/components/eventcard.tsx
"use client";

import React from "react";
import Image from "next/image";

interface EventCardProps {
  id: number;
  name: string;
  host: string;
  address?: string;
  cleaned_url: string;
  image_url?: string;
  attendees: string[];    // array of attendee IDs
}

export const EventCard = ({
  id,
  name,
  host,
  address,
  cleaned_url,
  image_url,
  attendees,
}: EventCardProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/caffeine.jpeg";
  };

  return (
    <div className="bg-[var(--tan)] rounded-lg overflow-hidden">
      <div className="flex flex-col">
        {/* Event Image */}
        <div className="relative w-full h-48">
          <Image
            className="w-full h-full object-cover"
            src={image_url && image_url !== "Image not found" ? image_url : "/caffeine.jpeg"} 
            alt={name}
            width={400}
            height={200}
            onError={handleImageError}
            priority={false}
          />
        </div>
        
        {/* Event Details */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2" style={{ color: '#5f4130' }}>
            {name}
          </h3>
          
          <p className="text-sm" style={{ color: '#5f4130' }}>
            <span className="font-medium">Host:</span> {host}
          </p>
          
          {address && address !== "undefined" && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Address:</span> {address}
            </p>
          )}
          
          <div className="pt-2">
            <a 
              href={cleaned_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View on Meetup →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};