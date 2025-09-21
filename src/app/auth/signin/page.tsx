"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";



export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      // Redirect to register with the email pre-filled
      router.push(`/auth/register?email=${encodeURIComponent(email)}`);
    } else if (result?.ok) {
      // Here i need to store the current user ID as a cookie

      document.cookie = `userId=1; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

      
      router.push("/");
    }
    
    setIsLoading(false);
  };

  return (
      <div className="flex flex-col min-h-screen overflow-x-hidden fixed">
        <div className="inset-0 fixed bg-[var(--brown)] -z-10">
                <Image src="/caffeine.jpeg" alt="photo" fill className="object-cover opacity-30 -z-11" priority />
        </div>

       <div className="flex items-center justify-center h-screen w-screen ">
            <div className="bg-[var(--white)] w-[50rem] h-[30rem] flex items-center justify-center shadow-lg rounded-lg">
                <div className="flex flex-row  w-full h-full items-center">
                <div className="relative w-1/2 h-full">
                    <Image
                    src="/coffeecup.png"
                    alt="photo"
                    fill
                    className="object-cover p-3"
                    priority
                    />
                </div>
<div className="w-1/2 h-full flex items-center justify-center flex-col p-20">
        <h1 className="text-3xl text-[var(--tan)] font-bold mb-6">LOG IN</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 outline-none focus:outline-none rounded-lg bg-[var(--light-blue)] text-[var(--white)]"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2 outline-none focus:outline-none rounded-lg bg-[var(--light-blue)] text-[var(--white)]"
                />
                <button
                type="submit"
                disabled={isLoading}
                className="w-full p-2 bg-[var(--dark-blue)] text-white rounded-lg disabled:opacity-50  transition-transform cursor-pointer hover:scale-102"
                >
                {isLoading ? "Signing In..." : "SIGN IN"}
                </button>
            </form>
                </div>
               
                </div>
              
            </div>
            </div>

       
        
     
    </div>
  );
}