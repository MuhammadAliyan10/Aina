"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Send,
  Loader2,
  MessageSquare,
  Ticket,
  Bot,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

const SupportPage = () => {
  const { user } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const faqs: FAQ[] = [
    {
      question: "How do I get an overview of my Aina usage?",
      answer:
        "The Dashboard provides a snapshot of key metrics like workflows, tasks, and billing. Use the 'Explore' buttons for detailed views.",
    },
    {
      question: "How do I update my billing plan?",
      answer:
        "Navigate to the Billing section, view your current plan, and select 'Upgrade Plan' or 'Manage Subscription' to make changes.",
    },
    {
      question: "How do I invite team members?",
      answer:
        "Visit the Team page, enter an email and role under 'Invite Team Member', and click 'Send Invite' to add them.",
    },
    {
      question: "How do I use the AI Assistant?",
      answer:
        "Go to the AI Assistant page, type your question in the chat box, and hit 'Send'. Recent conversations are also visible on the Dashboard.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "On the login page, click 'Forgot Password', enter your email, and follow the reset link sent to your inbox.",
    },
    {
      question: "What should I do if I encounter a bug?",
      answer:
        "Report it via the 'Contact Support' form or start a live chat below. Include detailed steps to reproduce the issue for quicker resolution.",
    },
    {
      question: "How do I export my data?",
      answer:
        "Task and workflow exports are available on their respective pages. For a full account export, contact support with your request.",
    },
    {
      question: "What are the limits of the free plan?",
      answer:
        "The free plan offers 5 workflows, 50 tasks, and basic AI usage. Upgrade your plan in Billing for additional features and higher limits.",
    },
    {
      question: "How do I enable two-factor authentication (2FA)?",
      answer:
        "Visit Settings, enable 2FA, and scan the QR code with your authenticator app to secure your account.",
    },
    {
      question: "How do I integrate third-party apps?",
      answer:
        "Go to Integrations, select your app (e.g., Slack, Google Drive), and follow the OAuth prompts to connect.",
    },
    {
      question: "Can I automate repetitive tasks?",
      answer:
        "Yes, use the Automation Studio to create workflows with triggers and actions to automate your tasks.",
    },
    {
      question: "How do I check my API usage?",
      answer:
        "API usage stats are available under Integrations for users with an API token. Contact support if you need detailed logs.",
    },
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      url: "/docs/getting-started",
      description: "Learn the basics of Aina.",
    },
    {
      title: "API Documentation",
      url: "/docs/api",
      description: "Integrate Aina with your apps.",
    },
    {
      title: "Community Forum",
      url: "https://forum.aina.com",
      description: "Join discussions and get help from peers.",
    },
  ];

  const { data: tickets, isLoading: ticketsLoading } = useQuery<
    SupportTicket[]
  >({
    queryKey: ["supportTickets", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const submitContactForm = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, ...contactForm }),
      });
      if (!response.ok) throw new Error("Failed to submit contact form");
      return response.json();
    },
    onSuccess: () => {
      setContactForm({ email: "", subject: "", message: "" });
      toast({ title: "Success", description: "Your message has been sent!" });
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, ...ticketForm }),
      });
      if (!response.ok) throw new Error("Failed to create ticket");
      return response.json();
    },
    onSuccess: () => {
      setTicketForm({ subject: "", description: "" });
      toast({ title: "Success", description: "Your ticket has been created!" });
    },
  });

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      {/* Navbar */}
      <nav className="bg-card border-b border-border shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text flex items-center gap-2"
          >
            <HelpCircle className="h-6 w-6 text-indigo-400" />
            Aina Support
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link
              href="/dashboard"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/support#faqs"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/support#tickets"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Tickets
            </Link>
            <Link
              href="/support#contact"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/ai-assistant"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              AI Assistant
            </Link>
          </div>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
        {isNavOpen && (
          <div className="md:hidden flex flex-col gap-4 p-4 bg-muted/50">
            <Link
              href="/dashboard"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/support#faqs"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/support#tickets"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Tickets
            </Link>
            <Link
              href="/support#contact"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/ai-assistant"
              className="text-foreground hover:text-indigo-400 transition-colors"
            >
              AI Assistant
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 flex-1">
        <div className="relative mb-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-inner max-w-md w-full"
          />
        </div>

        {/* FAQs Section */}
        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
            Frequently Asked Questions
          </h2>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardContent className="p-6">
              {filteredFAQs.length ? (
                filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-border py-4 last:border-b-0"
                  >
                    <button
                      className="flex justify-between items-center w-full text-left"
                      onClick={() =>
                        setExpandedFAQ(
                          expandedFAQ === faq.question ? null : faq.question
                        )
                      }
                    >
                      <span className="text-foreground font-semibold text-lg">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.question ? (
                        <ChevronUp className="h-6 w-6 text-indigo-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-indigo-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.question && (
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-4 text-indigo-400 animate-bounce" />
                  <p>
                    No results found. Try adjusting your search or contacting
                    support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tickets Section */}
        <section id="tickets" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
            Your Support Tickets
          </h2>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg mb-6">
            <CardContent className="p-6">
              {ticketsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : tickets?.length ? (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
                  >
                    <div>
                      <p className="text-foreground font-medium">
                        {ticket.subject}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()} -{" "}
                        {ticket.description.slice(0, 50)}...
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium px-3 py-1 rounded-full",
                        ticket.status === "open"
                          ? "bg-yellow-900 text-yellow-300"
                          : ticket.status === "in_progress"
                          ? "bg-blue-900 text-blue-300"
                          : "bg-green-900 text-green-300"
                      )}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Ticket className="h-10 w-10 mb-4 text-indigo-400 animate-bounce" />
                  <p>
                    No support tickets found. Create one below if you need
                    assistance!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Create a New Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Subject"
                value={ticketForm.subject}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, subject: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-inner"
              />
              <Textarea
                placeholder="Describe your issue..."
                value={ticketForm.description}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, description: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg min-h-[120px] shadow-inner"
              />
              <Button
                onClick={() => createTicket.mutate()}
                disabled={createTicket.isPending}
                className="w-full bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {createTicket.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Ticket className="h-5 w-5 mr-2" />
                )}
                Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
            Contact Support
          </h2>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Can’t find what you need? Reach out to our support team for
                personalized assistance.
              </p>
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="h-5 w-5 text-indigo-400" />
                <span>+1-800-aina (800-782-6886)</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="h-5 w-5 text-indigo-400" />
                <span>aliyannadeem10@gmail.com</span>
              </div>
              <Separator className="bg-border my-4" />
              <Input
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-inner"
              />
              <Input
                placeholder="Subject"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-inner"
              />
              <Textarea
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg min-h-[120px] shadow-inner"
              />
              <Button
                onClick={() => submitContactForm.mutate()}
                disabled={submitContactForm.isPending}
                className="w-full bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {submitContactForm.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Send Message
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Resources Section */}
        <section id="resources" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
            Helpful Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4">
                  <FileText className="h-8 w-8 text-indigo-400 mb-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {resource.description}
                  </p>
                  <Link
                    href={resource.url}
                    className="text-indigo-400 hover:underline"
                  >
                    Learn More
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Live Chat Toggle */}
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Live Chat Window (Integrated with AI Assistant) */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-2xl z-50 flex flex-col max-h-[70vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              Live Chat with Grok
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-muted-foreground">
              Welcome to live chat! How can Grok assist you today?
            </p>
            {/* Placeholder for AI Assistant integration */}
            <p className="text-sm text-muted-foreground">
              This chat connects to your AI Assistant. Start typing below!
            </p>
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Type your message..."
                className="flex-1 bg-input border-border text-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg resize-none min-h-[40px] max-h-[100px] text-sm shadow-inner"
                onChange={(e) => {
                  /* Integrate with AI Assistant sendMessage */
                }}
              />
              <Button className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white rounded-lg p-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
