// page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, WifiOff } from "lucide-react";

import LoginImg from "../../../assets/Login.jpg";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate loading time (you can adjust the time as needed)
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Check online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Loader2 className="w-16 h-16 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold">Loading</h2>
          <p className="text-muted-foreground mt-2">
            Preparing your login experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen items-center justify-center p-5 bg-card/50 relative">
      {/* Offline notification */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground py-3 px-5 z-50 flex items-center justify-center"
          >
            <WifiOff className="w-5 h-5 mr-2" />
            <p>You are currently offline. Some features may be unavailable.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden w-1/2 relative md:block border-r border-border overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 z-10" />
          <Image
            src={LoginImg}
            alt="Login image"
            className="h-full w-full object-cover"
            width={500}
            height={800}
            priority
          />
          <div className="absolute bottom-8 left-8 right-8 bg-background/80 backdrop-blur-sm p-6 rounded-lg z-20">
            <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Log in to reconnect with your community and continue your journey.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2"
        >
          <div className="space-y-2 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-3xl font-bold"
            >
              Log In
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-muted-foreground"
            >
              A place where <span className="italic">you</span> can&apos;t be
              alone.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <LoginForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="space-y-5"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Link
              href={"/signup"}
              className="block text-center hover:underline text-primary transition-colors duration-200"
            >
              New here? Click to create account
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Page;
