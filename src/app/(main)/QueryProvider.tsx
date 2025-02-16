"use client"; // ✅ This makes the component a Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient()); // ✅ Avoids re-creating the client on every render

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
