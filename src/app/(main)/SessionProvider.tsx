"use client";
import { User } from "lucia";
import React, { createContext, useContext } from "react";

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
