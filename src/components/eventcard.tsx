// src/components/eventcard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

interface EventCardProps {
  name: string;
  time: string;
  cleaned_url: string;
  image_url?: string;
  tags: string[]
  attendees: string[];    // array of attendee IDs
}

export const EventCard = ({
    name,
    time,
    cleaned_url,
    image_url,
    tags,
    attendees
}: EventCardProps) => {
    
  const [imageError, setImageError] = useState(false);

  // Determine which image to use
  const getImageSrc = () => {
    if (imageError || !image_url || image_url === "Image not found") {
      return "/caffeine.jpeg";
    }
    return image_url;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-[var(--light-blue)] rounded-t-lg overflow-hidden">
      <div className="flex flex-col">
        <div className="relative w-full h-48">
          <Image
            className="w-full h-full object-cover"
            src={getImageSrc()}
            alt={name}
            width={400}
            height={200}
            onError={handleImageError}
            priority={false}
            // Add unoptimized prop to bypass Next.js image optimization for external URLs
            unoptimized={!imageError && !!image_url && !image_url.startsWith('/')}
          />
        </div>
        
        {/* Event Details */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2" style={{ color: '#5f4130' }}>
            {name}
          </h3>
          
          <p className="text-sm" style={{ color: '#5f4130' }}>
            <span className="font-medium">Date:</span> {time}
          </p>
          
          
          <div className="pt-2">
            <a 
              href={cleaned_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[var(--brown)] hover:text-[var(--white)] underline"
            >
              View on Meetup →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};