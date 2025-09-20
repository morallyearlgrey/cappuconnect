import React from "react";
import { Button } from "../../components/ui/button";
import NavBar from "../../components/ui/navbar";

export default function Homepage() {
  return (
    <div className="relative h-screen w-full" style={{ backgroundColor: "#5f4130" }}>
      {/* Navbar */}
      <NavBar brandName="CappuConnect" imageSrcPath="/logo.png" />

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}
      />

      {/* Gradient/fade overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5f4130]"
      />

      {/* Centered project name */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1
          className="text-5xl font-bold"
          style={{ color: "#d5b893", fontFamily: "Inter" }}
        >
          CappuConnect
        </h1>

        {/* Buttons at the bottom */}
        <div className="absolute bottom-16 w-full flex justify-center gap-6 z-10 px-4">
          <Button variant="default" size="lg">
            Log In
          </Button>
          <Button variant="default" size="lg">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}