"use client";

import React, { useEffect, useState } from "react";
import ShinyText from "@/components/Animated/ShinyText";

import { Button } from "@/components/ui/button";
import { GlowingEffectDemo } from "@/components/Global/GlowingEffectDemo";
import { Separator } from "@/components/ui/separator";

const HomePage: React.FC = () => {
  return (
    <div className="m-10 pt-5 md:pt-0">
      <div className="flex flex-col justify-center h-screen">
        <div className="text-center">
          <ShinyText
            text="Welcome to Quantum Tasks"
            className="text-4xl md:text-7xl font-bold mb-4"
            disabled={false}
            speed={3}
          />
          <p className="text-lg text-gray-600">
            This platform will help you with your study and work with AI and
            trusted automation.
          </p>
        </div>
        <Separator className="my-6" />

        <GlowingEffectDemo />
      </div>
    </div>
  );
};

export default HomePage;
