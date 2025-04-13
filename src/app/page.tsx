// app/page.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { NavbarDemo } from "@/components/Global/Navbar";

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
    window.addEventListener("offline", handleOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Features data
  const features = [
    {
      icon: <Workflow className="w-10 h-10 text-[#6B48FF]" />,
      title: "AI-Powered Web Automation",
      description:
        "Automate web tasks like data scraping, form filling, and content updates with Aina's advanced AI, delivering speed and precision for any workflow.",
    },
    {
      icon: <Layout className="w-10 h-10 text-[#00DDEB]" />,
      title: "Fully Customizable Dashboard",
      description:
        "Tailor your workspace with a drag-and-drop dashboard, organizing tasks, workflows, and analytics to match your unique needs.",
    },
    {
      icon: <Cable className="w-10 h-10 text-[#00DDEB]" />,
      title: "Integration",
      description:
        "Connect seamlessly with your favorite tools and platforms through our robust API and pre-built integrations.",
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-[#6B48FF]" />,
      title: "Task Manager",
      description:
        "Plan, track, and manage tasks effortlessly with Aina's integrated manager, perfect for students and office workers juggling multiple projects.",
    },
    {
      icon: <Users className="w-10 h-10 text-[#00DDEB]" />,
      title: "Team Support",
      description:
        "Collaborate seamlessly with real-time task sharing, role-based access, and team analytics to boost productivity across groups.",
    },
    {
      icon: <DollarSign className="w-10 h-10 text-[#6B48FF]" />,
      title: "Fully Secure Billing",
      description:
        "Enjoy peace of mind with encrypted transactions, transparent pricing, and flexible billing options for individuals and teams.",
    },
    {
      icon: <PenTool className="w-10 h-10 text-[#00DDEB]" />,
      title: "Notepad & Documents",
      description:
        "Capture ideas and manage projects with built-in notepad and document tools, synced across devices for ultimate convenience.",
    },
  ];

  // New feature categories for enhanced UI
  const featureCategories = [
    {
      title: "Productivity",
      description: "Tools to supercharge your workflow",
      features: [features[0], features[3], features[6]],
    },
    {
      title: "Collaboration",
      description: "Work together seamlessly",
      features: [features[4], features[2]],
    },
    {
      title: "Management",
      description: "Control every aspect of your work",
      features: [features[1], features[5]],
    },
  ];

  // How It Works steps
  const steps = [
    {
      title: "Connect Your Apps",
      description:
        "Integrate Aina with your favorite web platforms using simple, secure API connections or pre-built templates.",
    },
    {
      title: "Build Workflows",
      description:
        "Use Aina's no-code editor to create AI-driven automation flows, customizing tasks to fit your goals.",
    },
    {
      title: "Monitor & Optimize",
      description:
        "Track performance with real-time analytics and let Aina's AI suggest optimizations for maximum efficiency.",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "System phar day ga, phir automation par laga day ga",
      name: "Hashir Abd.",
      role: "Class Cr",
    },
    {
      quote: "Ab link pana hova asana, bas automation par laga do meri jan",
      name: "Usama Zul.",
      role: "Computer Science Student",
    },
    {
      quote:
        "Suiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
      name: "Muhammad Aliyan",
      role: "Founder",
    },
  ];

  // Pricing plans
  const plans = [
    {
      name: "Student",
      price: "$0",
      description: "Free forever for students mastering productivity.",
      features: [
        "5 AI automations",
        "Task Manager",
        "Notepad & Documents",
        "Basic Dashboard",
        "Community Support",
      ],
    },
    {
      name: "Professional",
      price: "$19/mo",
      description: "Advanced tools for office workers and freelancers.",
      features: [
        "Unlimited AI automations",
        "Custom Dashboard",
        "Team Support (5 users)",
        "Secure Billing",
        "Priority Support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scalable solutions for businesses and teams.",
      features: [
        "Custom AI workflows",
        "Unlimited Users",
        "Advanced Analytics",
        "Dedicated Support",
        "API Access",
      ],
    },
  ];

  // New use cases section
  const useCases = [
    {
      title: "For Students",
      description:
        "Automate research collection, organize study materials, and manage assignment deadlines with ease.",
      icon: <FileText className="w-8 h-8 text-[#00DDEB]" />,
    },
    {
      title: "For Professionals",
      description:
        "Streamline client communications, automate reporting, and keep project stakeholders informed automatically.",
      icon: <Shield className="w-8 h-8 text-[#6B48FF]" />,
    },
    {
      title: "For Teams",
      description:
        "Coordinate workflows, share resources, and maintain transparency with customizable team dashboards.",
      icon: <Users className="w-8 h-8 text-[#00DDEB]" />,
    },
    {
      title: "For Enterprises",
      description:
        "Scale operations, enforce compliance, and gain insights with enterprise-grade security and analytics.",
      icon: <DollarSign className="w-8 h-8 text-[#6B48FF]" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Loader2 className="w-16 h-16 text-[#6B48FF]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Loading Aina</h2>
          <p className="text-gray-400 mt-2">
            Preparing your AI automation experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white dark:bg-gray-950 relative">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(107,72,255,0.3)_0%,transparent_70%)] z-0" />
        <div className="container mx-auto px-5 md:px-10 lg:px-20 flex flex-col lg:flex-row items-center gap-12 z-10">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]">
              Aina: Empowering Web Automation with AI
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Aina is the ultimate AI-powered platform for web automation,
              designed for students, office workers, and businesses. Automate
              tasks, customize dashboards, manage teams, and secure your
              workflows—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                href="/signup"
                className="px-6 py-3 bg-[#6B48FF] rounded-lg text-white font-semibold hover:bg-[#5A3FD6] transition-colors"
              >
                Start Free
              </Link>
              <Link
                href="https://github.com/MuhammadAliyan10/Aina"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                View on GitHub
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 max-w-md lg:max-w-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl">
                <motion.div
                  className="flex justify-center gap-8"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                >
                  <div className="w-20 h-20 bg-[#6B48FF] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    AI
                  </div>
                  <div className="w-20 h-20 bg-[#00DDEB] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    Web
                  </div>
                </motion.div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#6B48FF]/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-20 relative overflow-hidden" id="features">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,221,235,0.2)_0%,transparent_70%)] z-0" />
        <div className="container mx-auto px-5 md:px-10 lg:px-20 z-10 relative">
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Aina equips you with powerful tools to automate, organize, and
            collaborate, tailored for productivity and innovation.
          </motion.p>

          {/* Feature Categories */}
          <div className="space-y-24">
            {featureCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-70 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700 hover:border-[#6B48FF]/50"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: featureIndex * 0.1 + categoryIndex * 0.2,
                      }}
                    >
                      <div className="bg-gray-900 rounded-full p-4 inline-block mb-6">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-gray-300">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Showcase */}
          <motion.div
            className="mt-24 bg-gray-800 rounded-2xl p-8 overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6B48FF]/10 to-[#00DDEB]/10" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                  <h3 className="text-3xl font-bold text-white mb-6">
                    Seamless Experience Across Devices
                  </h3>
                  <p className="text-gray-300 mb-8">
                    Whether you're on desktop, tablet, or mobile, Aina delivers
                    a consistent, powerful experience. Your automations, tasks,
                    and documents sync instantly across all your devices.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      "Real-time sync",
                      "Responsive design",
                      "Offline capabilities",
                      "Cross-platform",
                    ].map((item, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gray-700 rounded-full text-sm font-medium text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="relative">
                    <div className="bg-gray-900 rounded-xl p-4 shadow-2xl">
                      <div className="h-64 bg-gradient-to-br from-[#6B48FF]/20 to-[#00DDEB]/20 rounded-lg flex items-center justify-center">
                        <p className="text-xl text-gray-400">
                          Feature visualization
                        </p>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#00DDEB]/20 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Use Cases Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Designed for Everyone
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          From individual students to large enterprises, Aina adapts to your
          unique needs
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-xl p-8 border border-gray-700"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start mb-4 gap-4">
                <div className="bg-gray-900 p-3 rounded-lg">{useCase.icon}</div>
                <h3 className="text-2xl font-bold text-white">
                  {useCase.title}
                </h3>
              </div>
              <p className="text-gray-300">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20" id="how-it-works">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Get Started in Minutes
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Aina's intuitive process makes web automation accessible to everyone,
          from students to professionals.
        </motion.p>
        <div className="relative">
          <div className="absolute left-1/2 top-5 -translate-x-1/2 w-1 bg-gray-700 h-[80%] hidden md:block" />
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 mb-12 ${
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
              <div className="w-12 h-12 bg-[#6B48FF] rounded-full flex items-center justify-center text-white font-bold z-50">
                {index + 1}
              </div>
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20" id="testimonials">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Loved by Our Community
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Hear from students, professionals, and teams who trust Aina to power
          their workflows.
        </motion.p>
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto snap-x snap-mandatory">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="flex-1 min-w-[280px] bg-gray-800 rounded-2xl p-6 snap-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
              <p className="text-white font-semibold">{testimonial.name}</p>
              <p className="text-gray-400 text-sm">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20" id="pricing">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00DDEB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Flexible Plans for Everyone
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Whether you're a student, professional, or enterprise, Aina has a plan
          to fit your automation needs.
        </motion.p>
        <div className="flex flex-col lg:flex-row gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`flex-1 bg-gray-800 rounded-2xl p-8 ${
                plan.highlight
                  ? "border-2 border-[#6B48FF] relative"
                  : "border border-gray-700"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6B48FF] text-white text-xs px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              <h3 className="text-2xl font-semibold text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-4xl font-bold text-white mb-4">{plan.price}</p>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              <ul className="text-gray-300 mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#00DDEB]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full py-3 rounded-lg text-center font-semibold ${
                  plan.highlight
                    ? "bg-[#6B48FF] text-white hover:bg-[#5A3FD6]"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } transition-colors`}
              >
                Choose Plan
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20 text-center bg-gradient-to-r from-[#6B48FF] to-[#00DDEB] rounded-2xl py-16">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Transform Your Workflow Today
        </motion.h2>
        <motion.p
          className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Experience the power of Aina's AI-driven automation. Start free and
          unlock productivity for you and your team.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 text-gray-400">
        <div className="container mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Aina</h3>
            <p className="text-gray-400">
              Empowering productivity with AI-driven web automation for
              students, professionals, and enterprises.
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
          <p>© 2025 Aina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
