"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/Sidebar";
import userAvatar from "@/assets/UserAvatar.png";
import {
  IconClipboard,
  IconCurrencyDollar,
  IconFriends,
  IconGraph,
  IconHelp,
  IconHomeFilled,
  IconLockSquare,
  IconLogout2,
  IconPencil,
  IconSettings,
  IconUser,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";
import { validateRequest } from "@/auth";
import {
  BotMessageSquare,
  Cable,
  CalendarDays,
  FilePlus,
  ListTodo,
  NotebookPen,
  Workflow,
} from "lucide-react";
import { useSession } from "@/app/(main)/SessionProvider";

export function AppSidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const links = [
    {
      label: "Home",
      href: "/home",
      icon: (
        <IconHomeFilled className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "WorkFlow",
      href: "/Workflow",
      icon: (
        <ListTodo className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Automation Hub",
      href: "/automationHub",
      icon: (
        <Workflow className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Calendar & Schedule",
      href: "/schedule",
      icon: (
        <CalendarDays className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Assignments & Quiz",
      href: "/assignments",
      icon: (
        <FilePlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: "Notes & Study Hub",
      href: "/notes",
      icon: (
        <NotebookPen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Automation Links",
      href: "/links",
      icon: (
        <Cable className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "AI Assistant",
      href: "/assistant",
      icon: (
        <BotMessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Current Plan",
      href: "/plan",
      icon: (
        <IconCurrencyDollar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/setting",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: "Logout",
      href: "#",
      action: logout,
      icon: (
        <IconLogout2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const name = user?.fullName;
  const profileImage = user?.profilePic;

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row w-full flex-1 max-w-full mx-auto ",
        "h-full" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: name || "",
                href: "/profile",
                icon: (
                  <Image
                    src={profileImage || userAvatar}
                    className="h-7 w-7 flex-shrink-0 rounded-full border object-cover border-gray-300"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        quantumTask
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
