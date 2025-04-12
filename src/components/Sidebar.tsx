"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  action?: () => void;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-2 py-4 hidden md:flex md:flex-col w-[300px] shrink-0 bg-sidebar",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-sidebar-background w-full",
        className
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <IconMenu2
          className="text-sidebar-foreground"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              // Ensure solid background with high z-index
              "fixed h-full w-full inset-0 bg-sidebar p-4 z-[1000] flex flex-col",
              // Fallback background for debugging
              "bg-opacity-100 backdrop-blur-none",
              className
            )}
          >
            <div
              className="absolute right-4 top-4 z-50 text-sidebar-foreground"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {/* Content container with scroll */}
            <div className="flex flex-col flex-1 overflow-y-auto mt-12">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  const isActive = pathname === link.href;

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md transition-colors duration-200",
        isActive
          ? "text-primary bg-sidebar-accent"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      onClick={
        link.action
          ? (e) => {
              e.preventDefault();
              link.action?.();
            }
          : undefined
      }
      {...props}
    >
      {React.cloneElement(link.icon as React.ReactElement, {
        className: cn(
          "h-5 w-5 flex-shrink-0",
          isActive ? "text-primary" : "text-sidebar-foreground",
          "group-hover/sidebar:text-sidebar-accent-foreground"
        ),
      })}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm whitespace-pre inline-block !p-0 !m-0 transition duration-150",
          isActive ? "text-primary" : "text-sidebar-foreground",
          "group-hover/sidebar:text-sidebar-accent-foreground group-hover/sidebar:translate-x-1"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
