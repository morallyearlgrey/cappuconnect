"use client";

import Image from "next/image";

interface EventCardProps {
  name: string;
  time: string; // make sure this is a pre-formatted string from your API
  image?: string | null;
}

export function EventCard({ name, time, image }: EventCardProps) {
  const fallbackImage = "/caffeine.jpeg";
  const imageUrl = image && image.trim() !== "" ? image : fallbackImage;

  return (
    <div className="rounded-t-xl border bg-[var(--light-blue)] shadow-md overflow-hidden">
      <Image
        src={imageUrl }
        alt={name}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
        priority={false}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-white">{time}</p>
      </div>
    </div>
  );
}
