"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";

const routes: { title: string; href: string }[] = [
  { title: "Discover", href: "/discover" },
  { title: "Network", href: "/network" },
  { title: "Login", href: "/auth/signin" },
  { title: "Register", href: "/auth/register" },
];

interface NavbarProps {
  isLoggedIn: boolean;
  photo?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, photo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const profilePhoto = photo || "/LogOut.png";

  return (
    <div className="relative w-full z-20">
      <div className="absolute inset-0 h-50 bg-gradient-to-b from-[#3B2520]/90 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between h-30 w-full px-6">
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-[var(--white)] flex-row flex align-middle justify-center items-center text-base cursor-pointer hover:text-[var(--light-blue)] transition-all"
          >
            <Image
              className="object-contain -translate-y-1"
              src="/logo.png"
              alt="logo"
              width={60}
              height={60}
            />
            CappuConnect
          </Link>
        </div>

        <div className="justify-end sm:flex hidden gap-2">
          {routes.map((route, index) => {
            // Hide Login/Register if logged in
            if (isLoggedIn && (route.title === "Login" || route.title === "Register")) return null;

            // Determine if this route should have bg-brown
            const isSpecial = route.title === "Login" || route.title === "Register";

            return (
              <Link
                key={index}
                href={route.href}
                className={`relative flex items-center px-4 py-2 text-white text-base rounded-sm transition-all duration-500 ${
                  isSpecial ? "bg-[var(--brown)] hover:bg-[var(--tan)]" : "hover:text-[var(--light-blue)]"
                }`}
              >
                {route.title}
              </Link>
            );
          })}

          {/* Profile image */}
          {isLoggedIn && (
            <Link href="/account">
              <Image
                className="object-cover rounded-full h-10 w-10 border border-white"
                src={profilePhoto}
                alt="Profile"
                width={40}
                height={40}
              />
            </Link>
          )}
        </div>

        <button
          onClick={toggleMenu}
          className="sm:hidden bg-[var(--ieee-dark-yellow)] p-1 rounded z-50 cursor-pointer"
        >
        {{menuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}}
        </button>
      </div>

      {menuOpen && (
        <MobileMenu
          toggleMenu={toggleMenu}
          isLoggedIn={isLoggedIn}
          photo={profilePhoto}
        />
      )}
    </div>
  );
};

interface MobileMenuProps {
  toggleMenu: () => void;
  isLoggedIn: boolean;
  photo?: string | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ toggleMenu, isLoggedIn, photo }) => {
  return (
    <div className="fixed inset-0 flex flex-col z-40 bg-black">
      <div className="flex w-full flex-col gap-1 px-4 pb-2 py-12">
        <Link
          href="/"
          onClick={toggleMenu}
          className="hover:text-[var(--ieee-bright-yellow)] font-[heading-font] text-white inline-flex h-10 w-full items-center text-sm transition-colors"
        >
          HOME
        </Link>

        {routes.map((route, index) => {
          if (isLoggedIn && (route.title === "Login" || route.title === "Register")) return null;

          const isSpecial = route.title === "Login" || route.title === "Register";

          return (
            <Link
              key={index}
              href={route.href}
              onClick={toggleMenu}
              className={`flex items-center px-4 py-2 text-white text-sm rounded-sm transition-all duration-500 ${
                isSpecial ? "bg-[var(--brown)] hover:bg-[var(--tan)]" : "hover:text-[var(--ieee-bright-yellow)]"
              }`}
            >
              {route.title}
            </Link>
          );
        })}

        {isLoggedIn && photo && (
          <div className="mt-auto px-4 pb-4">
            <Link href="/account" onClick={toggleMenu}>
              <Image
                className="object-cover rounded-full h-12 w-12 border border-white"
                src={photo}
                alt="Profile"
                width={48}
                height={48}
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export { Navbar };
