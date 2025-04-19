// app/page.tsx
"use client";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  FileText,
  Shield,
  PenTool,
  Layout,
  DollarSign,
  Cable,
  Workflow,
  WifiOff,
  Loader2,
  Calendar,
  Briefcase,
  CheckSquare,
  Bot,
  BookOpen,
  Lock,
} from "lucide-react";
import { NavbarDemo } from "@/components/Global/Navbar";

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

// Particle system component
const ParticleBackground = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-[#6B48FF]/10 to-[#00DDEB]/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient blob component
const AnimatedGradientBlob = ({ className }: { className: string }) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90],
        borderRadius: ["60% 40% 30% 70%", "40% 60% 70% 30%", "60% 40% 30% 70%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "mirror",
      }}
    />
  );
};

// Text animation variants
const textVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.1 },
  }),
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Check online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.removeEventListener("offline", handleOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  const features = [
    {
      icon: <Workflow className="w-10 h-10 text-[#6B48FF]" />,
      title: "AI-Driven Web Automation",
      description:
        "Streamline repetitive web tasks such as data scraping, form filling, and content updates with advanced AI-powered automation tools.",
    },
    {
      icon: <Calendar className="w-10 h-10 text-[#00DDEB]" />,
      title: "Personalized Study Schedules",
      description:
        "Create tailored study plans and schedules using AI to enhance learning efficiency and optimize time management for students.",
    },
    {
      icon: <Briefcase className="w-10 h-10 text-[#6B48FF]" />,
      title: "AI Career Counseling",
      description:
        "Receive personalized career guidance powered by AI, offering insights into job trends, skill development, and career pathways.",
    },
    {
      icon: <Users className="w-10 h-10 text-[#00DDEB]" />,
      title: "Team Management & Collaboration",
      description:
        "Facilitate team coordination with shared workspaces, real-time collaboration tools, and customizable role-based access controls.",
    },
    {
      icon: <CheckSquare className="w-10 h-10 text-[#6B48FF]" />,
      title: "Task Management",
      description:
        "Organize, prioritize, and track tasks efficiently with AI-driven task automation and intuitive project management features.",
    },
    {
      icon: <Cable className="w-10 h-10 text-[#00DDEB]" />,
      title: "Seamless Integrations",
      description:
        "Integrate with popular tools and platforms through robust APIs and pre-built connectors for a cohesive and efficient workflow.",
    },
    {
      icon: <Shield className="w-10 h-10 text-[#6B48FF]" />,
      title: "Secure Billing",
      description:
        "Experience secure and transparent billing with encrypted transactions and compliance with industry-standard financial protocols.",
    },
    {
      icon: <Bot className="w-10 h-10 text-[#00DDEB]" />,
      title: "AI-Powered Assistant",
      description:
        "Leverage an intelligent AI assistant to automate routine tasks, provide insights, and enhance productivity across workflows.",
    },
    {
      icon: <BookOpen className="w-10 h-10 text[#6B48FF]" />,
      title: "Study Resources & Guides",
      description:
        "Access AI-generated study materials, resources, and guides tailored to individual learning needs for academic success.",
    },
    {
      icon: <Lock className="w-10 h-10 text-[#00DDEB]" />,
      title: "Privacy & Security",
      description:
        "Protect your data with end-to-end encryption, secure storage, and adherence to global privacy and security standards.",
    },
  ];

  const featureCategories = [
    {
      title: "Productivity",
      description: "Maximize efficiency with AI-powered tools",
      features: [
        features[0], // AI-Driven Web Automation
        features[5], // Seamless Integrations
        features[7], // AI-Powered Assistant
      ],
    },
    {
      title: "Collaboration & Management",
      description: "Enhance teamwork and task coordination",
      features: [
        features[3], // Team Management & Collaboration
        features[4], // Task Management
      ],
    },
    {
      title: "Learning & Career",
      description: "Optimize education and professional growth",
      features: [
        features[1], // Personalized Study Schedules
        features[2], // AI Career Counseling
        features[8], // Study Resources & Guides
      ],
    },
    {
      title: "Security & Organization",
      description: "Securely manage data and transactions",
      features: [
        features[6], // Secure Billing
        features[9], // Privacy & Security
      ],
    },
  ];

  const steps = [
    {
      title: "Integrate Your Workflow",
      description:
        "Connect AINA to your tools and platforms using intuitive APIs or pre-built templates to activate your AI-powered assistant.",
    },
    {
      title: "Design Custom Workflows",
      description:
        "Build or modify automation workflows using AINA's no-code Automation Studio, tailored to meet the needs of students and professionals.",
    },
    {
      title: "Configure AI Agent",
      description:
        "Select an AI agent and provide precise instructions via prompts to customize automation tasks for your specific requirements.",
    },
    {
      title: "Schedule or Execute",
      description:
        "Launch workflows immediately or schedule them using cron jobs for automated execution at your preferred times.",
    },
    {
      title: "Monitor & Optimize",
      description:
        "Track performance with real-time analytics and utilize AI-driven insights to optimize workflows for maximum efficiency.",
    },
  ];

  // Testimonials data (updated to reflect new focus)
  const testimonials = [
    {
      quote: "AINA's AI assistant transformed how I manage my study schedule!",
      name: "Ayesha Khan",
      role: "University Student",
    },
    {
      quote:
        "Web automation saved me hours on repetitive tasks. AINA is a game-changer.",
      name: "Bilal Ahmed",
      role: "Freelancer",
    },
    {
      quote:
        "The team access feature keeps our projects on track effortlessly.",
      name: "Sara Malik",
      role: "Project Manager",
    },
  ];

  // Pricing plans (updated to align with new features)
  const plans = [
    {
      name: "Student",
      price: "$0",
      description: "Free forever for students mastering productivity.",
      features: [
        "AI Study Guides",
        "5 Web Automations",
        "Document Upload",
        "Basic Calendar",
        "Community Support",
      ],
    },
    {
      name: "Professional",
      price: "$19/mo",
      description: "Advanced tools for workers and freelancers.",
      features: [
        "Unlimited Web Automations",
        "Team Access (5 users)",
        "Automation Studio",
        "Secure Billing & Data",
        "Priority Support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scalable solutions for businesses and teams.",
      features: [
        "Custom AI Workflows",
        "Unlimited Team Access",
        "Advanced Analytics",
        "Dedicated Support",
        "API Integrations",
      ],
    },
  ];

  // Use cases section (updated to reflect new audience and features)
  const useCases = [
    {
      title: "For Students",
      description:
        "Create AI-powered study guides, manage schedules, and automate research tasks to excel academically.",
      icon: <FileText className="w-8 h-8 text-[#00DDEB]" />,
    },
    {
      title: "For Professionals",
      description:
        "Automate repetitive tasks, manage documents, and streamline workflows with AINA's AI assistant.",
      icon: <PenTool className="w-8 h-8 text-[#6B48FF]" />,
    },
    {
      title: "For Teams",
      description:
        "Collaborate with team access, shared calendars, and secure data management for seamless project execution.",
      icon: <Users className="w-8 h-8 text-[#00DDEB]" />,
    },
    {
      title: "For Enterprises",
      description:
        "Scale operations with custom AI automation, secure billing, and enterprise-grade security.",
      icon: <Shield className="w-8 h-8 text-[#6B48FF]" />,
    },
  ];

  // New Professional & Technical Writing section
  const writingFeatures = [
    {
      title: "AI-Assisted Writing",
      description:
        "Generate professional emails, reports, and technical documents with AINA's AI-powered writing assistant.",
      icon: <PenTool className="w-8 h-8 text-[#00DDEB]" />,
    },
    {
      title: "Content Optimization",
      description:
        "Enhance clarity and impact with AI suggestions for grammar, tone, and structure tailored to your audience.",
      icon: <CheckCircle className="w-8 h-8 text-[#6B48FF]" />,
    },
    {
      title: "Document Templates",
      description:
        "Access pre-built templates for proposals, manuals, and presentations, customizable with AI insights.",
      icon: <FileText className="w-8 h-8 text-[#00DDEB]" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#6B48FF]/20"
                initial={{
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: 0.3,
                }}
                animate={{
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                  scale: Math.random() * 1.5 + 0.8,
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                }}
              />
            ))}
          </div>

          {/* Main loading animation */}
          <motion.div
            className="w-32 h-32 mb-6 relative mx-auto"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {/* Orbital rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-[#6B48FF]/50"
                initial={{ rotate: i * 45 }}
                animate={{ rotate: i * 45 + 360 }}
                transition={{
                  duration: 8 - i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ borderRadius: "50%" }}
              />
            ))}

            {/* Orbital dots */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`dot-${i}`}
                className="absolute w-3 h-3 rounded-full bg-[#00DDEB]"
                initial={{
                  rotate: i * 120,
                  translateX: 50 - i * 5,
                }}
                animate={{ rotate: i * 120 + 360 }}
                transition={{
                  duration: 4 - i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center" }}
              />
            ))}

            {/* Center core */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#6B48FF]"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(107, 72, 255, 0.5)",
                  "0 0 20px 4px rgba(107, 72, 255, 0.7)",
                  "0 0 10px 2px rgba(107, 72, 255, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="w-full h-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-white animate-spin" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text elements with staggered animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]">
              AINA
            </motion.h2>

            <motion.div className="relative h-8 mt-2 overflow-hidden">
              {[
                "Initializing systems",
                "Analyzing data",
                "Preparing your experience",
                "Almost ready",
              ].map((text, i) => (
                <motion.p
                  key={text}
                  className="text-gray-300 absolute inset-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [20, 0, 0, -20],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 2,
                    repeat: i === 3 ? 0 : 1,
                    repeatDelay: 6,
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  {text}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="mt-6 h-2 w-64 bg-gray-800 rounded-full overflow-hidden mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "16rem" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
              initial={{ width: "0%" }}
              animate={{
                width: ["0%", "30%", "60%", "90%", "100%"],
              }}
              transition={{
                duration: 8,
                times: [0, 0.3, 0.5, 0.8, 1],
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Pulsing dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`pulse-${i}`}
                className="w-2 h-2 rounded-full bg-[#00DDEB]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white dark:bg-gray-950 relative">
      <ParticleBackground />
      <NavbarDemo />

      {/* Offline notification */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-5 z-50 flex items-center justify-center"
          >
            <WifiOff className="w-5 h-5 mr-2" />
            <p>You are currently offline. Some features may be unavailable.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
        <AnimatedGradientBlob className="w-96 h-96 -top-20 -left-20 bg-[#6B48FF]" />
        <AnimatedGradientBlob className="w-96 h-96 bottom-10 right-10 bg-[#00DDEB]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(107,72,255,0.3)_0%,transparent_70%)] z-0" />
        <div className="container mx-auto px-5 md:px-10 lg:px-20 flex flex-col lg:flex-row items-center gap-12 z-10">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {Array.from("Aina: Empowering Web Automation with AI").map(
                (char, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: "inline-block" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                )
              )}
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              AINA empowers students and workers with a specialized AI
              assistant, offering unparalleled web automation, study guides,
              team collaboration, secure data management, and professional
              writing tools—all in one platform.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-[#6B48FF] rounded-lg text-white font-semibold hover:bg-[#5A3FD6] transition-colors relative overflow-hidden group flex items-center justify-center"
                >
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#6B48FF]/0 via-white/20 to-[#6B48FF]/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                  Start Free
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="https://github.com/MuhammadAliyan10/Aina"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center"
                >
                  View on GitHub
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1 max-w-md lg:max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="relative h-96">
              {/* Floating 3D hexagonal platform */}
              <motion.div
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                whileHover={{
                  boxShadow:
                    "0 20px 40px rgba(107, 72, 255, 0.3), 0 -5px 20px rgba(0, 221, 235, 0.2)",
                }}
              >
                {/* Ambient glow effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B48FF]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00DDEB]/20 rounded-full blur-3xl" />

                {/* Dynamic grid background */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
            linear-gradient(rgba(107, 72, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 221, 235, 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: "20px 20px",
                  }}
                  animate={{
                    backgroundPosition: ["0px 0px", "20px 20px"],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Central hologram container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Rotating rings */}
                  <motion.div
                    className="absolute w-64 h-64 rounded-full border border-[#6B48FF]/30"
                    animate={{ rotateZ: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute w-48 h-48 rounded-full border border-[#00DDEB]/30"
                    animate={{ rotateZ: -360 }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Holographic sphere container */}
                  <div className="relative">
                    {/* Central energy core */}
                    <motion.div
                      className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#6B48FF]/40 to-[#00DDEB]/40 backdrop-blur-md flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 20px 5px rgba(107, 72, 255, 0.3)",
                          "0 0 40px 10px rgba(0, 221, 235, 0.3)",
                          "0 0 20px 5px rgba(107, 72, 255, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Pulsing core */}
                      <motion.div
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#6B48FF] to-[#00DDEB] opacity-80"
                        animate={{
                          scale: [0.8, 1, 0.8],
                          opacity: [0.7, 0.9, 0.7],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="absolute w-full h-full">
                        <motion.div
                          className="absolute w-10 h-10 bg-[#6B48FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6B48FF]/30"
                          animate={{
                            x: [0, 50, 0, -50, 0],
                            y: [-50, 0, 50, 0, -50],
                            rotateZ: [0, 90, 180, 270, 360],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Workflow className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#00DDEB] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#00DDEB]/30"
                          animate={{
                            x: [0, -50, 0, 50, 0],
                            y: [50, 0, -50, 0, 50],
                            rotateZ: [360, 270, 180, 90, 0],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Calendar className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#6B48FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6B48FF]/30"
                          animate={{
                            x: [0, 60, 0, -60, 0],
                            y: [-30, 30, 60, 0, -30],
                            rotateZ: [0, 120, 240, 360, 0],
                          }}
                          transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Briefcase className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#00DDEB] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#00DDEB]/30"
                          animate={{
                            x: [0, -60, 0, 60, 0],
                            y: [30, -30, -60, 0, 30],
                            rotateZ: [360, 240, 120, 0, 360],
                          }}
                          transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Users className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#6B48FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6B48FF]/30"
                          animate={{
                            x: [0, 70, 0, -70, 0],
                            y: [-40, 40, 70, 0, -40],
                            rotateZ: [0, 180, 360, 180, 0],
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <CheckSquare className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#00DDEB] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#00DDEB]/30"
                          animate={{
                            x: [0, -70, 0, 70, 0],
                            y: [40, -40, -70, 0, 40],
                            rotateZ: [360, 180, 0, 180, 360],
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Cable className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#6B48FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6B48FF]/30"
                          animate={{
                            x: [0, 80, 0, -80, 0],
                            y: [-50, 50, 80, 0, -50],
                            rotateZ: [0, 90, 180, 270, 360],
                          }}
                          transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Shield className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#00DDEB] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#00DDEB]/30"
                          animate={{
                            x: [0, -80, 0, 80, 0],
                            y: [50, -50, -80, 0, 50],
                            rotateZ: [360, 270, 180, 90, 0],
                          }}
                          transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Bot className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#6B48FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6B48FF]/30"
                          animate={{
                            x: [0, 90, 0, -90, 0],
                            y: [-60, 60, 90, 0, -60],
                            rotateZ: [0, 120, 240, 360, 0],
                          }}
                          transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <BookOpen className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                          className="absolute w-10 h-10 bg-[#00DDEB] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#00DDEB]/30"
                          animate={{
                            x: [0, -90, 0, 90, 0],
                            y: [60, -60, -90, 0, 60],
                            rotateZ: [360, 240, 120, 0, 360],
                          }}
                          transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Lock className="w-6 h-6" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Particle connection effect */}
                    <div className="absolute inset-0">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-[#6B48FF]"
                          style={{
                            left: "50%",
                            top: "50%",
                            translateX: "-50%",
                            translateY: "-50%",
                          }}
                          animate={{
                            x: Math.sin((i * 45 * Math.PI) / 180) * 80,
                            y: Math.cos((i * 45 * Math.PI) / 180) * 80,
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connection lines using SVG */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 400"
                >
                  {/* Data flow paths */}
                  {[...Array(8)].map((_, i) => (
                    <motion.path
                      key={i}
                      d={`M200,200 L${
                        200 + 150 * Math.cos((i * Math.PI) / 4)
                      },${200 + 150 * Math.sin((i * Math.PI) / 4)}`}
                      stroke={i % 2 === 0 ? "#6B48FF" : "#00DDEB"}
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: [0, 1, 0],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 4,
                        delay: i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient
                      id="flowGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6B48FF" />
                      <stop offset="100%" stopColor="#00DDEB" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Floating data particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${
                      i % 2 === 0 ? "bg-[#6B48FF]" : "bg-[#00DDEB]"
                    }`}
                    initial={{
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                      opacity: 0,
                    }}
                    animate={{
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 4,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut",
                    }}
                    style={{ left: "50%", top: "50%" }}
                  />
                ))}
              </motion.div>

              {/* Bottom floating controls panel */}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-gray-700/30 flex gap-4 items-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Control indicators */}
                <motion.div
                  className="w-3 h-3 rounded-full bg-[#6B48FF]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div className="h-4 w-px bg-gray-500/30" />
                <motion.div
                  className="w-3 h-3 rounded-full bg-[#00DDEB]"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div className="h-4 w-px bg-gray-500/30" />
                <motion.div className="w-20 h-1 rounded-full overflow-hidden bg-gray-700/50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden" id="features">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,221,235,0.2)_0%,transparent_70%)] z-0" />

        <motion.div
          className="absolute top-40 left-10 h-40 w-40 bg-[#6B48FF]/20 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-40 right-10 h-40 w-40 bg-[#00DDEB]/20 rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        <div className="container mx-auto px-5 md:px-10 lg:px-20 z-10 relative">
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Tools to Empower Your Productivity
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AINA provides students and professionals with AI-driven automation,
            collaboration, and organization tools to excel in their work.
          </motion.p>

          {/* Feature Categories */}
          <div className="space-y-24">
            {featureCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <h3 className="text-3xl font-bold text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-400">{category.description}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-70 border border-gray-700 hover:border-[#6B48FF]/50 relative overflow-hidden group"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{
                        y: -8,
                        boxShadow: "0 10px 30px -15px rgba(107, 72, 255, 0.5)",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: featureIndex * 0.1 + categoryIndex * 0.2,
                      }}
                    >
                      <motion.div
                        className="absolute -bottom-2 -right-2 w-32 h-32 rounded-full bg-gradient-to-r from-[#6B48FF]/10 to-[#00DDEB]/10 opacity-0 group-hover:opacity-100 blur-3xl"
                        transition={{ duration: 0.3 }}
                      />

                      <motion.div
                        className="bg-gray-900 rounded-full p-4 inline-block mb-6 relative"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6B48FF]/20 to-[#00DDEB]/20 -z-10"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        {feature.icon}
                      </motion.div>

                      <h4 className="text-xl font-bold text-white mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-gray-300">{feature.description}</p>

                      <motion.div
                        className="w-0 h-0.5 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mt-4 group-hover:w-full"
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-5 my-24 md:mx-10 lg:mx-20">
        <motion.div
          className="bg-gray-800 rounded-3xl p-8 overflow-hidden relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-96 h-96 bg-[#6B48FF]/10 rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-96 h-96 bg-[#00DDEB]/10 rounded-full blur-3xl"
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.h3
                  className="text-4xl font-bold text-white mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Your AI Assistant, Anywhere
                </motion.h3>
                <motion.p
                  className="text-gray-300 mb-8 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  AINA's AI assistant works seamlessly across devices, syncing
                  your automations, schedules, documents, and calendars in
                  real-time for uninterrupted productivity.
                </motion.p>
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {[
                    "Real-time sync",
                    "Cross-device access",
                    "Offline support",
                    "AI-driven insights",
                  ].map((item, i) => (
                    <motion.span
                      key={i}
                      className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-300 border border-gray-600/30 flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(107, 72, 255, 0.2)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#00DDEB]"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                      {item}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="relative">
                  <motion.div
                    className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50"
                    whileHover={{
                      y: -5,
                      boxShadow: "0 25px 50px -12px rgba(107, 72, 255, 0.25)",
                      transition: { duration: 0.3 },
                    }}
                  >
                    <div className="h-64 bg-gradient-to-br from-[#6B48FF]/10 to-[#00DDEB]/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                      {/* Animated elements inside visualization area */}
                      <motion.div
                        className="absolute w-32 h-32 rounded-full border border-[#6B48FF]/30"
                        style={{ x: -50, y: -50 }}
                        animate={{
                          rotate: 360,
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          rotate: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                      />

                      <motion.div
                        className="absolute right-10 bottom-10 w-24 h-24 rounded-full border border-[#00DDEB]/30"
                        animate={{
                          rotate: -360,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          rotate: {
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: {
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                      />

                      <motion.div
                        className="w-48 h-48 bg-gradient-to-br from-[#6B48FF]/10 to-[#00DDEB]/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(107, 72, 255, 0)",
                            "0 0 0 10px rgba(107, 72, 255, 0.1)",
                            "0 0 0 20px rgba(107, 72, 255, 0)",
                          ],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <motion.p
                          className="text-xl text-white font-medium"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          Feature visualization
                        </motion.p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#00DDEB]/20 rounded-full blur-3xl z-0"
                    animate={{
                      opacity: [0.6, 0.8, 0.6],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute -top-8 -left-8 w-32 h-32 bg-[#6B48FF]/20 rounded-full blur-3xl z-0"
                    animate={{
                      opacity: [0.5, 0.7, 0.5],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-5 my-32 md:mx-10 lg:mx-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Built for Every User
          </motion.h2>

          <motion.div
            className="max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-lg text-gray-400 text-center mb-12">
              AINA's AI assistant and automation tools adapt to the needs of
              students, professionals, teams, and enterprises.
            </p>
          </motion.div>

          {/* Animated glowing line */}
          <motion.div
            className="h-px w-24 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mx-auto mb-16"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "6rem", opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Subtle animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent to-[#6B48FF]/5 opacity-0 group-hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00DDEB]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />

                <div className="flex items-start mb-6 gap-5">
                  <motion.div
                    className="bg-gray-900 p-4 rounded-xl border border-gray-700/50 flex items-center justify-center"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(107, 72, 255, 0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {useCase.icon}
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    {useCase.title}
                  </motion.h3>
                </div>

                <motion.p
                  className="text-gray-300 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  {useCase.description}
                </motion.p>

                <motion.div
                  className="w-full h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent mt-6"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />

                <motion.div
                  className="mt-6 flex items-center gap-2 text-[#00DDEB] font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <span>Learn more</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    →
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Professional & Technical Writing Section */}
      <section className="mx-5 my-32 md:mx-10 lg:mx-20" id="writing">
        <div className="relative">
          {/* Background elements */}
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-[#6B48FF]/10 rounded-full blur-3xl opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <motion.h2
              className="text-4xl sm:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] via-[#9D7EFF] to-[#00DDEB]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Professional & Technical Writing
            </motion.h2>

            <motion.div
              className="max-w-3xl mx-auto mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-lg text-gray-400 text-center mb-6">
                Craft polished documents with AINA's AI-powered writing tools,
                designed for professional and technical communication.
              </p>
            </motion.div>

            {/* Animated glowing line */}
            <motion.div
              className="h-px w-24 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mx-auto mb-16"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "6rem", opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {writingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800 rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 20px 40px -12px rgba(107, 72, 255, 0.2)",
                    borderColor: "rgba(107, 72, 255, 0.3)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {/* Card hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#6B48FF]/5 to-[#00DDEB]/5 opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    className="bg-gray-900 p-4 rounded-xl mb-6 inline-block relative border border-gray-700/30"
                    whileHover={{
                      scale: 1.05,
                      rotate: [-1, 1, -1, 1, 0],
                      transition: {
                        rotate: { duration: 0.3 },
                        scale: { duration: 0.2 },
                      },
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#6B48FF]/10 to-[#00DDEB]/10 rounded-xl opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 2, 0, -2, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                      className="relative z-10"
                    >
                      {feature.icon}
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    className="text-xl font-bold text-white mb-3 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    {feature.title}
                  </motion.h3>

                  <motion.p
                    className="text-gray-300 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>

                  {/* Bottom highlight line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] w-0 group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Stylish Line-Based Design */}
      <section
        className="mx-5 my-32 md:mx-10 lg:mx-20 relative"
        id="how-it-works"
      >
        {/* Background gradient effects */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00DDEB]/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6B48FF]/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] via-[#9D7EFF] to-[#00DDEB]">
              Start Automating in Minutes
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              AINA's user-friendly platform makes AI automation and productivity
              tools accessible to everyone.
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mx-auto mt-8 rounded-full" />
          </div>

          {/* Stylish line-based step nodes */}
          <div className="max-w-4xl mx-auto relative">
            {/* Central connecting line */}
            <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6B48FF] via-[#9D7EFF] to-[#00DDEB] hidden md:block" />

            {steps.map((step, index) => (
              <div key={index} className="flex mb-20">
                {/* Step node */}
                <div className="relative">
                  {/* Node circle */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6B48FF]/10 to-[#00DDEB]/10 backdrop-blur-sm flex items-center justify-center border border-[#9D7EFF]/30 z-10 relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6B48FF] to-[#9D7EFF] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#6B48FF]/20">
                      {index + 1}
                    </div>
                  </div>

                  {/* Connection line to content */}
                  <div className="absolute top-1/2 left-24 w-12 h-1 bg-gradient-to-r from-[#9D7EFF] to-transparent hidden md:block" />
                </div>

                {/* Step content with stylish border */}
                <div className="ml-8 md:ml-16 flex-1">
                  <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-lg border-l-4 border-[#9D7EFF] relative overflow-hidden group">
                    {/* Gradient highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6B48FF]/5 to-[#00DDEB]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#9D7EFF] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 relative z-10">
                      {step.description}
                    </p>

                    {/* Corner accent */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#6B48FF]/40 to-[#00DDEB]/40 rounded-tl-xl" />
                  </div>
                </div>
              </div>
            ))}

            {/* End node */}
            <div className="absolute left-12 bottom-0 -mb-10 w-24 h-1 bg-gradient-to-r from-[#00DDEB] to-transparent transform -translate-x-12 hidden md:block" />
            <div className="absolute left-0 bottom-0 -mb-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#00DDEB]/20 to-transparent flex items-center justify-center hidden md:block">
              <div className="w-12 h-12 rounded-full bg-[#00DDEB] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-24 text-center">
            <button className="px-10 py-4 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#6B48FF]/30 transition-all duration-300 transform hover:-translate-y-1">
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="mx-5 my-32 md:mx-10 lg:mx-20 relative"
        id="testimonials"
      >
        {/* Background elements */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#6B48FF]/10 rounded-full blur-3xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] via-[#9D7EFF] to-[#00DDEB]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Trusted by Our Users
          </motion.h2>

          <motion.div
            className="max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-lg text-gray-400 text-center mb-6">
              Discover why students, professionals, and teams rely on AINA for
              their AI automation and productivity needs.
            </p>
          </motion.div>

          {/* Animated glowing line */}
          <motion.div
            className="h-px w-24 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mx-auto mb-16"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "6rem", opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />

          {/* Enhanced testimonials carousel */}
          <motion.div
            className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-6 snap-x snap-mandatory w-full hide-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-1 min-w-[280px] md:min-w-[320px] bg-gray-800 rounded-2xl p-8 snap-center relative group border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 40px -12px rgba(107, 72, 255, 0.25)",
                  borderColor: "rgba(107, 72, 255, 0.3)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Subtle gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#6B48FF]/5 to-[#00DDEB]/5 rounded-2xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />

                {/* Quote mark */}
                <motion.div
                  className="absolute -top-4 -left-2 text-6xl text-[#6B48FF]/20 font-serif"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3 + index * 0.1,
                  }}
                >
                  "
                </motion.div>

                {/* Content */}
                <motion.p
                  className="text-gray-300 mb-6 relative z-10 font-medium leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  "{testimonial.quote}"
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="w-12 h-1 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] rounded-full mb-4"
                  initial={{ width: 0 }}
                  whileInView={{ width: "3rem" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </motion.div>

                {/* Subtle glowing corner */}
                <motion.div
                  className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#00DDEB]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-[#6B48FF]" : "bg-gray-600"
                }`}
                whileHover={{ scale: 1.5, transition: { duration: 0.2 } }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="mx-5 my-32 md:mx-10 lg:mx-20 relative" id="pricing">
        {/* Background elements */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00DDEB]/10 rounded-full blur-3xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] via-[#9D7EFF] to-[#00DDEB]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Plans for Every Need
          </motion.h2>

          <motion.div
            className="max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-lg text-gray-400 text-center mb-6">
              Choose a plan tailored to your goals, from free student access to
              enterprise-grade solutions.
            </p>
          </motion.div>

          {/* Animated glowing line */}
          <motion.div
            className="h-px w-24 bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] mx-auto mb-16"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "6rem", opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />

          {/* Billing Toggle */}
          <motion.div
            className="flex justify-center items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="text-gray-400">Monthly</span>
            <div className="w-12 h-6 bg-gray-700 rounded-full p-1 cursor-pointer relative">
              <motion.div className="w-4 h-4 bg-white rounded-full absolute left-1" />
            </div>
            <span className="text-gray-400">
              Annual{" "}
              <span className="text-[#00DDEB] text-xs font-medium ml-1">
                Save 20%
              </span>
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`flex-1 bg-gray-800 rounded-2xl p-8 ${
                  plan.highlight
                    ? "relative border-2 border-[#6B48FF]/70"
                    : "border border-gray-700/30"
                } backdrop-blur-sm`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{
                  y: -5,
                  boxShadow: plan.highlight
                    ? "0 25px 50px -12px rgba(107, 72, 255, 0.3)"
                    : "0 20px 40px -12px rgba(0, 0, 0, 0.2)",
                  transition: { duration: 0.3 },
                }}
              >
                {/* Background gradient */}
                {plan.highlight && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#6B48FF]/5 to-[#00DDEB]/5 rounded-2xl"
                    animate={{
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Recommended tag */}
                {plan.highlight && (
                  <motion.span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6B48FF] to-[#9D7EFF] text-white text-sm px-4 py-1 rounded-full font-medium shadow-lg shadow-[#6B48FF]/20"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.7 + index * 0.15,
                    }}
                  >
                    Recommended
                  </motion.span>
                )}

                <div className="relative z-10">
                  <motion.h3
                    className="text-2xl font-semibold text-white mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  >
                    {plan.name}
                  </motion.h3>

                  <motion.div
                    className="flex items-end mb-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                  >
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    {plan.price !== "Free" && (
                      <span className="text-gray-400 ml-2 mb-1">/month</span>
                    )}
                  </motion.div>

                  <motion.p
                    className="text-gray-400 mb-6 min-h-[3rem]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                  >
                    {plan.description}
                  </motion.p>

                  <motion.ul
                    className="text-gray-300 mb-8 space-y-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                  >
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.3,
                          delay: 0.6 + index * 0.15 + i * 0.05,
                        }}
                      >
                        <CheckCircle
                          className={`w-5 h-5 mt-0.5 ${
                            plan.highlight ? "text-[#00DDEB]" : "text-[#9D7EFF]"
                          }`}
                        />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <Link
                    href="/signup"
                    className={`block w-full py-3 rounded-lg text-center font-semibold transition-all ${
                      plan.highlight
                        ? "bg-gradient-to-r from-[#6B48FF] to-[#9D7EFF] text-white hover:shadow-lg hover:shadow-[#6B48FF]/20"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600/30"
                    }`}
                  >
                    <motion.span
                      className="block"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      Choose Plan
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Money back guarantee */}
          <motion.p
            className="text-center text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            30-day money-back guarantee. No questions asked.
          </motion.p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="mx-5 my-32 md:mx-10 lg:mx-20 relative" id="cta">
        <motion.div
          className="overflow-hidden relative rounded-3xl"
          initial={{ borderRadius: "1rem", opacity: 0, y: 40 }}
          whileInView={{ borderRadius: "1.5rem", opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#6B48FF] to-[#00DDEB] z-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
              scale: [1, 1.05, 1],
            }}
            transition={{
              backgroundPosition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
              },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            }}
          />

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                initial={{
                  x: Math.random() * 1000 - 500,
                  y: Math.random() * 500 - 250,
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: 0.1 + Math.random() * 0.2,
                }}
                animate={{
                  x: [Math.random() * 1000 - 500, Math.random() * 1000 - 500],
                  y: [Math.random() * 500 - 250, Math.random() * 500 - 250],
                  scale: [Math.random() * 0.5 + 0.5, Math.random() * 1 + 0.8],
                }}
                transition={{
                  duration: Math.random() * 20 + 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  width: `${Math.random() * 150 + 50}px`,
                  height: `${Math.random() * 150 + 50}px`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 py-20 px-8 md:px-16 text-center">
            <motion.h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Supercharge Your Productivity
            </motion.h2>

            <motion.p
              className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Join thousands of students and professionals using AINA's AI
              assistant to automate tasks, manage schedules, and write
              professionally.
              <motion.span
                className="block mt-2 text-white font-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Start free today!
              </motion.span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.8,
              }}
            >
              <Link
                href="/signup"
                className="inline-block px-10 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 group"
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Get Started Now
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </Link>
            </motion.div>

            {/* Extra trust signals */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5" />
                <span>24/7 support</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 text-gray-400">
        <div className="container mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">AINA</h3>
            <p className="text-gray-400">
              Your AI assistant for web automation, productivity, and
              professional writing, trusted by students and workers worldwide.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/community"
                  className="hover:text-white transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/MuhammadAliyan10/Aina"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy & Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-5 mt-8 text-center">
          <p>© 2025 AINA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
