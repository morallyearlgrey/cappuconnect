"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";


export default function HomePage() {
  const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated"; 

  return (
    <div className="flex flex-col max-w-screen overflow-hidden bg-[var(--brown)]">
      {/* Hero Section */}
      <div className="relative w-full h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/background.jpg')" }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5f4130]" />
        </div>

        {/* Navbar */}
        <div className="absolute top-0 left-0 w-full z-20">
          <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"}></Navbar>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1
            className="text-[140px]"
            style={{
              fontFamily: "'Over the Rainbow', cursive",
              color: "#d5b893",
            }}
          >
            CappuConnect
          </h1>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 mt-12">
            <Button
              style={{
                backgroundColor: "#768ca3",
                color: "#5F4130",
                fontFamily: "'Padauk', sans-serif",
                fontSize: "28px",
                padding: "10px 20px",
              }}
            >
              Log In
            </Button>
            <Button
              style={{
                backgroundColor: "#768ca3",
                color: "#5F4130",
                fontFamily: "'Padauk', sans-serif",
                fontSize: "28px",
                padding: "10px 20px",
              }}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>

      {/* Second screen: Mission statement */}
      <div
        className="w-full flex flex-col items-center justify-center text-center px-4"
        style={{ minHeight: "100vh" }}
      >
        <h2
          style={{
            fontFamily: "'Padauk', sans-serif",
            fontSize: "30px",
            color: "#768ca3",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          OUR GOAL
        </h2>

        <p
          style={{
            fontFamily: "'Padauk', sans-serif",
            fontSize: "20px",
            color: "#d5b893",
            maxWidth: "800px",
          }}
        >
          Our platform empowers professionals of all experience levels to connect, collaborate, and grow together. Using a smart matching algorithm, we pair individuals in similar fields or with complementary skills, helping them meet, exchange knowledge, and build meaningful connections. By fostering these targeted interactions, users at every stage can unlock their potential and advance their careers.
        </p>
      </div>

      {/* Extra space to allow scrolling */}
      <div style={{ height: "10vh" }}></div>
    </div>
  );
}
