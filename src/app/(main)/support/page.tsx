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

interface FAQ {
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  subject: string;
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const faqs: FAQ[] = [
    // Existing FAQs (shortened for brevity)
    {
      question: "How do I get an overview of my QuantumTask usage?",
      answer:
        "The Dashboard provides a snapshot of key metrics like workflows, tasks, and billing. Use the 'Explore' buttons for details.",
    },
    {
      question: "How do I update my billing plan?",
      answer:
        "Go to Billing, view your plan, and click 'Upgrade Plan' or 'Manage Subscription' to adjust it.",
    },
    {
      question: "How do I invite team members?",
      answer:
        "On the Team page, enter an email and role in 'Invite Team Member', then click 'Send Invite'.",
    },
    {
      question: "How do I use the AI Assistant?",
      answer:
        "Visit the AI Assistant page, type your question, and press 'Send'. Recent chats appear on the Dashboard.",
    },
    // Additional FAQs
    {
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox.",
    },
    {
      question: "What should I do if I encounter a bug?",
      answer:
        "Report it via the 'Contact Support' form below or start a live chat. Include steps to reproduce the issue for faster resolution.",
    },
    {
      question: "How do I export my data?",
      answer:
        "Currently, data export is available for tasks and workflows via the respective pages. Contact support for full account exports.",
    },
    {
      question: "What are the limits of the free plan?",
      answer:
        "The free plan includes 5 workflows, 50 tasks, and basic AI usage. Upgrade via Billing for more features.",
    },
    {
      question: "How do I enable two-factor authentication (2FA)?",
      answer:
        "Go to Settings (not yet implemented in this UI), enable 2FA, and follow the QR code setup with your authenticator app.",
    },
  ];

  const { data: tickets, isLoading: ticketsLoading } = useQuery<
    SupportTicket[]
  >({
    queryKey: ["supportTickets", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
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
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
          <HelpCircle className="h-9 w-9 text-indigo-400 animate-pulse" />
          Support & Help
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border text-card-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg"
          />
        </div>
      </header>

      <Separator className="bg-border mb-8" />

      {/* FAQ Section */}
      <Card className="bg-card border border-border rounded-xl shadow-lg mb-8">
        <CardHeader className="flex flex-row items-center gap-3">
          <HelpCircle className="h-6 w-6 text-indigo-400 animate-pulse" />
          <CardTitle className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <div className="space-y-6">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-4 last:border-b-0"
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
                    <p className="text-card-foreground mt-3 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <HelpCircle className="h-12 w-12 mb-4 text-indigo-500 animate-bounce" />
              <p>
                No results found. Try adjusting your search or contacting
                support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support & Tickets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Support */}
        <Card className="bg-card border border-border rounded-xl shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Mail className="h-6 w-6 text-indigo-400 animate-pulse" />
            <CardTitle className="text-2xl font-bold text-foreground">
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-card-foreground">
              Can’t find what you need? Reach out to our support team for
              personalized help.
            </p>
            <div className="flex items-center gap-3 text-foreground">
              <Phone className="h-5 w-5 text-indigo-400" />
              <span>+1-800-QUANTUM (800-782-6886)</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="h-5 w-5 text-indigo-400" />
              <span>aliyannadeem10@gmail.com</span>
            </div>
            <Separator className="bg-border my-4" />
            <div className="space-y-4">
              <Input
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                className="bg-card border-border text-card-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg"
              />
              <Input
                placeholder="Subject"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="bg-card border-border text-card-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg"
              />
              <Textarea
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="bg-card border-border text-card-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg min-h-[120px]"
              />
              <Button
                onClick={() => submitContactForm.mutate()}
                disabled={submitContactForm.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {submitContactForm.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="bg-card border border-border rounded-xl shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Ticket className="h-6 w-6 text-indigo-400 animate-pulse" />
            <CardTitle className="text-2xl font-bold text-foreground">
              Your Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center py-3 border-b border-gray-800 last:border-b-0"
                  >
                    <div>
                      <p className="text-card-foreground font-medium">
                        {ticket.subject}
                      </p>
                      <p className="text-foreground text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Ticket className="h-10 w-10 mb-4 text-indigo-500 animate-bounce" />
                <p>
                  No support tickets found. Submit one below if you need help!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Chat Toggle */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Live Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[70vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              Live Chat
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-full p-2"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-foreground">
            <p>Welcome to Live Chat! How can we assist you today?</p>
            <p className="text-sm text-muted-foreground mt-2">
              (Live chat is currently a placeholder. Use the contact form for
              now.)
            </p>
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Type your message..."
                className="flex-1 bg-card border-border text-card-foreground focus:ring-2 focus:ring-indigo-500 rounded-lg resize-none min-h-[40px] max-h-[100px] text-sm"
                disabled
              />
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2"
                disabled
              >
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
