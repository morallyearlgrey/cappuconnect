// src/app/page.tsx
import React from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative h-screen w-full" style={{ backgroundColor: "#5f4130" }}>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5f4130]" />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        
        {/* Project name */}
        <h1
          style={{
            fontFamily: "'Over the Rainbow', cursive",
            fontSize: "140px",
            color: "#d5b893",
          }}
        >
          CappuConnect
        </h1>

        {/* Buttons */}
        <div className="absolute bottom-16 w-full flex flex-col items-center gap-4 z-10 px-4">
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
  );
}