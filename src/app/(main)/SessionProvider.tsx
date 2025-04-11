"use client";
import React, { createContext, useContext } from "react";

interface User {
  id: string;
  fullName: string;
  bio?: string;
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  twoFAEnabled?: boolean;
  phoneNumber?: string;
  sessionTimeout?: string;
  fontSize?: string;
  theme?: "light" | "dark" | "system"; // Added theme property
}

interface SessionContext {
  user: User | null;
  session: {
    id: string;
    expiresAt: Date;
    fresh: boolean;
    userId: string;
  } | null;
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("Session provider is required.");
  }
  return context;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
