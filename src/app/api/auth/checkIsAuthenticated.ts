"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const checkIsAuthenticated = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null; // not logged in

  return {
    isAuthenticated: true,
    user: session.user, // contains id, email, name
  };
};
