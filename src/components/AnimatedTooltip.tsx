"use client";
import React from "react";
import { AnimatedTooltip as TooltipComponent } from "../components/ui/animated-tooltip";
const people = [
  {
    id: 1,
    name: "Muhammad Aliyan",
    designation: "Software Engineer",
    image: "/Admin.jpeg",
  },
  {
    id: 2,
    name: "Muhammad Aliyan",
    designation: "Product Manager",
    image: "/Admin.jpeg",
  },
  {
    id: 3,
    name: "Muhammad Aliyan",
    designation: "Data Scientist",
    image: "/Admin.jpeg",
  },
  {
    id: 4,
    name: "Muhammad Aliyan",
    designation: "UX Designer",
    image: "/Admin.jpeg",
  },
  {
    id: 5,
    name: "Muhammad Aliyan",
    designation: "Soap Developer",
    image: "/Admin.jpeg",
  },
  {
    id: 6,
    name: "Muhammad Aliyan",
    designation: "The Explorer",
    image: "/Admin.jpeg",
  },
];

export function AnimatedTooltip() {
  return (
    <div className="flex flex-row items-center justify-center mb-10 w-full">
      <TooltipComponent items={people} />
    </div>
  );
}
