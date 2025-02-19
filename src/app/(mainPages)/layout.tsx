import { validateRequest } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import SessionProvider from "../(main)/SessionProvider";
import { AuthProvider } from "../(main)/AuthContext";
import QueryProvider from "../(main)/QueryProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider value={{ user: user ?? null, session }}>
      <main className="w-full">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </main>
    </SessionProvider>
  );
}
