// src/components/eventcard.tsx
"use client";

import React from "react";
import Image from "next/image";

interface EventCardProps {
  name: string;
  time: string;
  cleaned_url: string; // <-- make sure this exists here
  image_url?: string;
  tags: string[];
  attendees: string[];
}

export const EventCard = ({
  name,
  time,
  cleaned_url, // <-- destructure it here
  image_url,
  tags,
  attendees,
}: EventCardProps) => {
  return (
    <div className="relative">
      <a href={cleaned_url} target="_blank" rel="noopener noreferrer">
        <div className="text-lg font-bold">{name}</div>
      </a>
      <div>{time}</div>
      {image_url && (
        <Image src={image_url} alt={name} width={300} height={200} />
      )}
      <div className="flex gap-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-200 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
