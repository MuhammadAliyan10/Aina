// app/page.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";
import { NavbarDemo } from "@/components/Global/Navbar";

// Inline Navbar

export default function Home() {
  // Features data
  const features = [
    {
      icon: <Star className="w-10 h-10 text-[#6B48FF]" />,
      title: "AI-Powered Web Automation",
      description:
        "Automate web tasks like data scraping, form filling, and content updates with Aina’s advanced AI, delivering speed and precision for any workflow.",
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
        "Plan, track, and manage tasks effortlessly with Aina’s integrated manager, perfect for students and office workers juggling multiple projects.",
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-[#6B48FF]" />,
      title: "Task Manager",
      description:
        "Plan, track, and manage tasks effortlessly with Aina’s integrated manager, perfect for students and office workers juggling multiple projects.",
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
        "Use Aina’s no-code editor to create AI-driven automation flows, customizing tasks to fit your goals.",
    },
    {
      title: "Monitor & Optimize",
      description:
        "Track performance with real-time analytics and let Aina’s AI suggest optimizations for maximum efficiency.",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote:
        "Aina’s AI automation saved our team hours of manual data entry, letting us focus on strategy.",
      name: "Emily R.",
      role: "Operations Lead",
    },
    {
      quote:
        "The customizable dashboard is a lifesaver for managing my coursework and side projects!",
      name: "Liam S.",
      role: "Computer Science Student",
    },
    {
      quote:
        "Secure billing and team support make Aina perfect for our growing startup.",
      name: "Ava M.",
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

  return (
    <div className="bg-gray-900 text-white dark:bg-gray-950">
      <NavbarDemo />

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
                href="https://github.com/aina-io/aina"
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

      {/* Features Section */}
      <section className="mx-5 my-20 md:mx-10 lg:mx-20" id="features">
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
        <div className="space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-800 rounded-2xl h-64 sm:h-80 w-full bg-gradient-to-r from-[#6B48FF]/20 to-[#00DDEB]/20" />
              </div>
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
          Aina’s intuitive process makes web automation accessible to everyone,
          from students to professionals.
        </motion.p>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 w-1 bg-gray-700 h-full hidden md:block" />
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
              <div className="w-12 h-12 bg-[#6B48FF] rounded-full flex items-center justify-center text-white font-bold">
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
              <p className="text-gray-300 mb-4">“{testimonial.quote}”</p>
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
          Whether you’re a student, professional, or enterprise, Aina has a plan
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
          Experience the power of Aina’s AI-driven automation. Start free and
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
                  href="https://github.com/aina-io/aina"
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
