"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface CarouselItemType {
  feature: string;
  desc: string;
  photo: string;
}

interface EventType {
  _id: string;
  name: string;
  time: string;
  host: string;
  address?: string;
  cleaned_url: string;
  image_url?: string;
  map_url?: string;
  tags: string[];
  attendees: string[];
}

interface StatsType {
  users: number;
  events: number;
  attendees: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const carouselRef = useRef<HTMLDivElement | null>(null);

  const carouselList: CarouselItemType[] = [
    {
      feature: "DISCOVER",
      desc: "Brew your network by swiping through professionals with similar backgrounds, curated by our vector cosine similarity algorithm.",
      photo: "/discovercarousel.png",
    },
    {
      feature: "NETWORK",
      desc: "Stir through curated upcoming events, where you can sign up and join your connections in attending what everyone’s excited about.",
      photo: "/networkcarousel.png",
    },
  ];

  const [stats, setStats] = useState<StatsType>({ users: 0, events: 0, attendees: 0 });

  // Fetch stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();

        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();

        const totalAttendees = eventsData.events.reduce(
          (sum: number, event: EventType) => sum + (event.attendees?.length || 0),
          0
        );

        setStats({
          users: usersData.length,
          events: eventsData.events.length,
          attendees: totalAttendees,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col max-w-screen overflow-hidden bg-[var(--white)]">
      <div className="relative w-full h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5f4130]" />
        </div>

        <div className="absolute top-0 left-0 w-full z-20">
          <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-[200px] font-[heading-font] text-[var(--dark-blue)]">
            CappuConnect
          </h1>
          <div className="font-[subheading-font] text-4xl text-[var(--white)]">
            Where connections brew opportunities.
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-row gap-4 py-8">
              <Link href="/auth/register" passHref>
                <Button className="bg-[var(--dark-blue)] hover:bg-[var(--light-blue)] cursor-pointer text-[var(--tan)] font-semibold p-6 rounded-lg transition-all duration-300 hover:scale-105 font-[subheading-font] text-2xl">
                  GET STARTED
                </Button>
              </Link>
              <Link href="/auth/signin" passHref>
                <Button className="bg-[var(--white)] text-[var(--tan)] hover:bg-[var(--light-blue)] cursor-pointer font-semibold p-6 rounded-lg transition-all duration-300 hover:scale-105 font-[subheading-font] text-2xl">
                  SIGN IN
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-row gap-4 py-8">
              <Link href="/discover" passHref>
                <Button className="bg-[var(--dark-blue)] hover:bg-[var(--light-blue)] cursor-pointer text-[var(--tan)] font-semibold p-6 rounded-lg transition-all duration-300 hover:scale-105 font-[subheading-font] text-2xl">
                  DISCOVER
                </Button>
              </Link>
              <Link href="/network" passHref>
                <Button className="bg-[var(--white)] text-[var(--tan)] hover:bg-[var(--light-blue)] cursor-pointer font-semibold p-6 rounded-lg transition-all duration-300 hover:scale-105 font-[subheading-font] text-2xl">
                  NETWORK
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="bg-[var(--brown)] h-50"></div>
      </div>

      <div
        ref={carouselRef}
        className="relative z-10 flex justify-center w-full py-20 -translate-y-20"
      >
        <Carousel
          opts={{ align: "center" }}
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-7xl"
        >
          <CarouselContent>
            {carouselList.map((item, index) => (
              <CarouselItem
                key={index}
                className="flex w-full justify-center items-start cursor-grab py-3"
              >
                <div className="p-2 w-full max-w-md md:max-w-lg lg:max-w-xl">
                  <div className="group relative w-full overflow-hidden p-[3px] bg-transparent transition-transform hover:scale-102 rounded-sm">
                    <div
                      className="animated-border absolute inset-0 p-20 bg-[conic-gradient(var(--ieee-bright-yellow)_20deg,transparent_120deg)] transition-all duration-300 animate-spin -z-10 rounded-sm"
                      style={{ animationDuration: "6s" }}
                    />
                    <Card className="relative z-10 p-0 rounded-sm border-none w-full aspect-[3/2] transition shadow-md overflow-hidden group">
                      <CardContent className="flex flex-col h-full w-full p-0">
                        <div className="relative h-2/3 w-full">
                          <Image
                            src={item.photo}
                            alt="Photo"
                            fill
                            className="object-cover rounded-none"
                            priority
                          />
                        </div>
                        <div className="bg-[var(--tan)] flex flex-col p-5 h-1/3">
                          <span className="font-[subheading-font] text-3xl text-center mb-2 text-[var(--brown)]">
                            {item.feature}
                          </span>
                          <span className="font-[body-font] text-center text-base text-[var(--brown)]">
                            {item.desc}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div
        className="w-full flex flex-col items-center justify-center text-center px-4 -translate-y-20"
        style={{ minHeight: "60vh" }}
      >
        <h2 className="text-5xl text-[var(--brown)] font-[subheading-font] mb-8">
          WHO ARE WE?
        </h2>

        <div className="flex flex-row gap-10 justify-center mb-8">
          <div className="bg-[var(--dark-blue)] text-[var(--tan)] p-6 rounded-lg shadow-md w-40 font-[body-font]">
            <div className="text-4xl font-bold">{stats.users}</div>
            <div className="text-lg mt-1">Users</div>
          </div>
          <div className="bg-[var(--dark-blue)] text-[var(--tan)] p-6 rounded-lg shadow-md w-40 font-[body-font]">
            <div className="text-4xl font-bold">{stats.events}</div>
            <div className="text-lg mt-1">Events</div>
          </div>
          <div className="bg-[var(--dark-blue)] text-[var(--tan)] p-6 rounded-lg shadow-md w-40 font-[body-font]">
            <div className="text-4xl font-bold">{stats.attendees}</div>
            <div className="text-lg mt-1">Attendees</div>
          </div>
        </div>

        <p className="w-[800px] font-[body-font] text-2xl text-[var(--brown)]">
          Our platform empowers professionals of all experience levels to connect, collaborate, and grow together. Using a smart matching algorithm, we pair individuals in similar fields or with complementary skills, helping them meet, exchange knowledge, and build meaningful connections. By fostering these targeted interactions, users at every stage can unlock their potential and advance their careers.
        </p>
      </div>

      {/* Extra space to allow scrolling */}
      <div style={{ height: "10vh" }}></div>
    </div>
  );
}
