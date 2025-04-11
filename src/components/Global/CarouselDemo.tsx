"use client";

import { Carousel } from "../ui/Carousel";
import Intelligence from "../../../public/Home/Intelligent.jpg";
import Workflow from "../../../public/Home/Workflow.jpg";
import UI from "../../../public/Home/UI.jpg";
import Automation from "../../../public/Home/Automation.jpg";
import Tasks from "../../../public/Home/Tasks.jpg";
import Privacy from "../../../public/Home/Privacy.jpg";

export function CarouselDemo() {
  const slideData = [
    {
      title: "AI-Powered Automation",
      button: "Discover Automation",
      description:
        "Streamline your office and educational workflows with intelligent automation tools designed to save time and boost efficiency.",
      href: "/automation-studio",
      src: Automation,
    },
    {
      title: "Smart Workflow Management",
      button: "Optimize Workflows",
      description:
        "Effortlessly design and manage workflows using intuitive AI-driven prompts, enhancing productivity across teams and projects.",
      href: "/workflows",
      src: Workflow,
    },
    {
      title: "Intelligent AI Assistant",
      button: "Meet Your Assistant",
      description:
        "Your personal AI assistant is always ready to assist, providing real-time insights and task support tailored to your needs.",
      href: "/assistant",
      src: Intelligence,
    },
    {
      title: "Advanced Task Management",
      button: "Master Your Tasks",
      description:
        "Organize and prioritize tasks with precision, leveraging AI to ensure deadlines are met and goals are achieved seamlessly.",
      href: "/tasks",
      src: Tasks,
    },
    {
      title: "Robust Privacy & Security",
      button: "Secure Your Data",
      description:
        "Protect your data with state-of-the-art encryption and two-factor authentication, ensuring privacy and security at every step.",
      href: "/settings",
      src: Privacy,
    },
    {
      title: "Intuitive User Experience",
      button: "Experience the UI",
      description:
        "Enjoy a sleek, user-friendly interface designed for productivity, accessibility, and a seamless experience across devices.",
      href: "/home",
      src: UI,
    },
  ];
  return (
    <div className="relative overflow-hidden w-full h-full py-20">
      <Carousel slides={slideData} />
    </div>
  );
}
