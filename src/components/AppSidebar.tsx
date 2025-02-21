// src/app/(mainPages)/AppSidebar.tsx
"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/Sidebar";
import userAvatar from "@/assets/UserAvatar.png";
import {
  IconHomeFilled,
  IconCurrencyDollar,
  IconHelp,
  IconLogout2,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  Bot,
  Cable,
  Calendar,
  FileText,
  List,
  Notebook,
  Workflow,
  Users,
  BarChart,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export function AppSidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  type SidebarLinkType = {
    label: string;
    href: string;
    icon: React.ReactNode;
    action?: () => void;
  };

  const sidebarLinks: SidebarLinkType[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconHomeFilled className="h-5 w-5 flex-shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Workflows",
      href: "/workflows",
      icon: <Workflow className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Automation Studio",
      href: "/automation-studio",
      icon: <Zap className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: <List className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Documents",
      href: "/documents",
      icon: <FileText className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Integrations",
      href: "/integrations",
      icon: <Cable className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "AI Assistant",
      href: "/assistant",
      icon: <Bot className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Billing",
      href: "/billing",
      icon: (
        <IconCurrencyDollar className="h-5 w-5 flex-shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Support",
      href: "/support",
      icon: <IconHelp className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <IconSettings className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
    {
      label: "Sign Out",
      href: "#",
      action: logout,
      icon: <IconLogout2 className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
    },
  ];

  const userName = user?.fullName || "User";
  const profileImage = user?.profilePic || userAvatar;

  return (
    <div className={cn("flex w-full flex-1 max-w-full mx-auto h-screen")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-neutral-800">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={{
                    ...link,
                    onClick:
                      link.action ||
                      (link.href === "#" && link.action
                        ? link.action
                        : undefined),
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <SidebarLink
              link={{
                label: userName,
                href: "/profile",
                icon: (
                  <Image
                    src={profileImage}
                    className="h-8 w-8 flex-shrink-0 rounded-full border object-cover border-neutral-700"
                    width={32}
                    height={32}
                    alt="User Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 p-6overflow-y-auto">{children}</div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="flex items-center space-x-2 text-sm py-2 relative z-20"
    >
      <div className="h-6 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-neutral-200 text-lg whitespace-pre"
      >
        QuantumTask
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="flex items-center text-sm py-2 relative z-20"
    >
      <div className="h-6 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Export as default for compatibility
export default AppSidebar;
