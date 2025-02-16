"use client";

import React, { useEffect, useState } from "react";
import ShinyText from "@/components/Animated/ShinyText";

import { Button } from "@/components/ui/button";

const HomePage: React.FC = () => {
  return (
    <div className="m-10 pt-5 md:pt-0">
      <div className="flex flex-col justify-center h-screen">
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

        <div className="flex my-4">
          <Button>Start working on now </Button>
        </div>

        <section className="my-6">
          <div>
            <ShinyText
              text="Features"
              className="text-4xl font-bold"
              disabled={false}
              speed={2}
            />
            <p className="my-4 text-gray-700">
              By starting with quantumTask, you will get the following features:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold">AI Automation</p>
              <p className="mt-2 text-gray-600">
                We collect and securely store your data to enhance your user
                experience.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold">AI Assistant</p>
              <p className="mt-2 text-gray-600">
                Your account information is used in compliance with our privacy
                policy.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold">Data Sharing</p>
              <p className="mt-2 text-gray-600">
                We will not share your personal data without explicit consent.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold">Account Security</p>
              <p className="mt-2 text-gray-600">
                You are responsible for maintaining the confidentiality of your
                credentials.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
