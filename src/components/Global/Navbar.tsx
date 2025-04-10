"use client";

import { Atom, MenuIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 py-4 px-4 bg-background/80 backdrop-blur-lg z-[100] flex items-center border-b border-border justify-between">
      {/* Logo */}
      <aside className="flex items-center gap-1">
        <Link href="/" className="flex items-center gap-1">
          <Atom className="h-6 w-6 text-primary" />
          <p className="text-2xl font-bold text-foreground">Task</p>
        </Link>
      </aside>

      {/* Navigation Links */}
      <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <ul className="flex items-center gap-6 list-none">
          <li>
            <Link
              href="/pages/pricing"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href="/pages/privacy-policy"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Privacy & Policy
            </Link>
          </li>
          <li>
            <Link
              href="/pages/documentation"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Documentation
            </Link>
          </li>
          <li>
            <Link
              href="/pages/enterprise"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Enterprise
            </Link>
          </li>
        </ul>
      </nav>

      {/* Actions */}
      <aside className="flex items-center gap-4">
        <Link
          href="/login"
          className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,var(--background)_50%,var(--primary)_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-4 py-1 text-sm font-medium text-foreground backdrop-blur-3xl hover:bg-muted transition-colors duration-200">
            Get Started
          </span>
        </Link>
        <MenuIcon className="h-6 w-6 text-foreground md:hidden cursor-pointer hover:text-primary transition-colors duration-200" />
      </aside>
    </header>
  );
};

export default Navbar;
