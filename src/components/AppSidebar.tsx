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
  Workflow,
  Users,
  BarChart,
  Zap,
  Shield,
  GitBranch,
  BotIcon,
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
        <IconHomeFilled className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Workflows",
      href: "/workflows",
      icon: (
        <Workflow className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: <List className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />,
    },
    {
      label: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />,
    },

    {
      label: "Automation Studio",
      href: "/automation-studio",
      icon: <Zap className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />,
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: (
        <Calendar className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Documents",
      href: "/documents",
      icon: (
        <FileText className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Integrations",
      href: "/integrations",
      icon: <Cable className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />,
    },
    {
      label: "AI Assistant",
      href: "/assistant",
      icon: <Bot className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />,
    },
    {
      label: "App Insight",
      href: "/app-insight",
      icon: (
        <BarChart className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Billing",
      href: "/billing",
      icon: (
        <IconCurrencyDollar className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Support",
      href: "/support",
      icon: (
        <IconHelp className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <IconSettings className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
    {
      label: "Sign Out",
      href: "#",
      action: logout,
      icon: (
        <IconLogout2 className="h-5 w-5 flex-shrink-0 text-sidebar-foreground" />
      ),
    },
  ];

  const userName = user?.fullName || "User";
  const profileImage = user?.profilePic || userAvatar;

  return (
    <div
      className={cn(
        "flex w-full flex-1 max-w-full mx-auto h-screen bg-sidebar"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-sidebar-background border-r border-sidebar-border">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-1">
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
                  className={cn(
                    "flex items-center gap-2 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 rounded-md",
                    link.href === "/settings" && "font-semibold" // Optional: highlight active link
                  )}
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
                    className="h-7 w-7 flex-shrink-0 rounded-full border border-sidebar-border object-cover shadow-sm"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
              className="flex items-center gap-2 py-2 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 rounded-md"
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-y-auto bg-background">{children}</div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <BotIcon className="h-6 w-6 text-primary" />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-sidebar-foreground"
      >
        quantumTasks
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <BotIcon className="h-6 w-6 text-primary" />
    </Link>
  );
};

export default AppSidebar;
