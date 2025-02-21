// src/app/(mainPages)/support/page.tsx
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface FAQ {
  question: string;
  answer: string;
}

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ data aggregated from all pages
  const faqs: FAQ[] = [
    // Dashboard
    {
      question: "How do I get an overview of my QuantumTask usage?",
      answer:
        "The Dashboard provides a quick snapshot of your key metrics across all features. You’ll see stats like workflow executions, task status, billing details, team activity, and more. Use the linked buttons (e.g., 'Explore Analytics') to dive deeper into each section.",
    },
    // Analytics
    {
      question: "What can I track in the Analytics section?",
      answer:
        "The Analytics page lets you monitor workflow performance (executions and success rates), task completion trends, and AI usage over time (week, month, or year). Switch views with the buttons at the top to see different time ranges.",
    },
    {
      question: "Why aren’t my analytics data updating?",
      answer:
        "Ensure your workflows and tasks are active and logged correctly. If data still doesn’t appear, try refreshing the page or contact support if the issue persists.",
    },
    // Billing
    {
      question: "How do I update my billing plan?",
      answer:
        "Go to the Billing page to view your current plan, next billing date, and amount due. Click 'Manage Billing' to add payment methods, update your subscription, or check your billing history.",
    },
    {
      question: "What happens if I miss a payment?",
      answer:
        "If a payment fails, you’ll see a 'pending' status in your Billing History. You can retry payment by adding a new method under 'Payment Methods' and contacting support if needed.",
    },
    // Team
    {
      question: "How do I invite team members?",
      answer:
        "On the Team page, use the 'Invite Team Member' section to enter an email and select a role (Admin, Member, Viewer). Click 'Send Invite' to add them. They’ll receive an email to join your QuantumTask team.",
    },
    {
      question: "Can I change a team member’s role?",
      answer:
        "Yes, on the Team page, click the 'Edit' button next to a member’s name, select a new role from the dropdown, and click 'Save' to update their permissions.",
    },
    // AI Assistant
    {
      question: "How do I use the AI Assistant?",
      answer:
        "Visit the AI Assistant page to chat directly. Type your question in the text area and press 'Send' or hit Enter. Recent messages appear on the Dashboard for quick reference.",
    },
    {
      question: "Why isn’t the AI responding?",
      answer:
        "Check your internet connection and ensure the message was sent. If the issue persists, refresh the page or contact support for assistance with the AI service.",
    },
    // Integrations
    {
      question: "How do I connect an integration?",
      answer:
        "On the Integrations page, find the desired service (e.g., Slack, Google Drive) and click 'Connect'. Follow the OAuth prompts if required. Connected integrations are tracked on the Dashboard.",
    },
    {
      question: "Can I disconnect an integration?",
      answer:
        "Yes, go to the Integrations page, locate the connected service, and click 'Disconnect'. This will revoke access without affecting your data in QuantumTask.",
    },
    // Documents
    {
      question: "How do I create a new document?",
      answer:
        "On the Documents page, enter a title and content in the 'New Document' section, then click 'Create Document'. You can edit or delete documents from the list below.",
    },
    {
      question: "Where can I see my recent documents?",
      answer:
        "The Documents section on the Dashboard shows your total documents and the most recently updated one. Click 'View Documents' to see the full list.",
    },
    // Tasks
    {
      question: "How do I manage my tasks?",
      answer:
        "The Tasks page lets you create tasks with titles, descriptions, and due dates. Toggle completion with the checkmark, edit inline, or delete tasks as needed. Task stats appear on the Dashboard.",
    },
    {
      question: "Why aren’t my tasks showing up?",
      answer:
        "Ensure you’ve created tasks with valid due dates. Filter by status (All, Pending, etc.) on the Tasks page to check if they’re hidden. Refresh or contact support if they’re still missing.",
    },
    // Calendar
    {
      question: "How do I add an event to my calendar?",
      answer:
        "On the Calendar page, click a date to open the event form, fill in the title, description, start, and end times, then click 'Create'. Upcoming events are also shown on the Dashboard.",
    },
    {
      question: "Can I drag events on the calendar?",
      answer:
        "Yes, in the Calendar view (Month, Week, or Day), click and drag events to reschedule them. The changes save automatically.",
    },
    // Automation Studio
    {
      question: "How do I build an automation workflow?",
      answer:
        "In Automation Studio, create a new workflow, add steps (triggers, actions, conditions) via 'Add Step', and drag them to reorder. Click 'Save Workflow' to finalize. Simulate workflows with the 'Play' button.",
    },
    {
      question: "What does 'Simulate Workflow' do?",
      answer:
        "The 'Simulate Workflow' button runs a test of your workflow without activating it, showing results via a toast notification. Active workflows are tracked on the Dashboard.",
    },
    // Workflows
    {
      question: "How do I create a new workflow?",
      answer:
        "On the Workflows page, click 'New Workflow', enter a title and description, and click 'Add Workflow'. You’ll see it in the card list, where you can view tasks, edit, or delete it.",
    },
    {
      question: "How do I edit an existing workflow?",
      answer:
        "On the Workflows page, click the 'Edit' button on a card, update the title or description in the dialog, and click 'Save Changes' to apply your edits.",
    },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSubmit = async () => {
    if (
      !contactForm.email.trim() ||
      !contactForm.subject.trim() ||
      !contactForm.message.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate an API call for contact submission
    setTimeout(() => {
      console.log("Contact Form Submitted:", contactForm);
      setContactForm({ email: "", subject: "", message: "" });
      setIsSubmitting(false);
      alert("Your message has been sent! We’ll get back to you soon.");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-blue-400" />
          Support & Help
        </h1>
      </header>

      <Separator className="bg-neutral-700 mb-6" />

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search for help..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-neutral-700 border-neutral-600 text-white"
        />
      </div>

      {/* FAQ Section */}
      <Card className="bg-neutral-800 border-neutral-700 mb-8">
        <CardHeader className="flex flex-row items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-neutral-200">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-neutral-700 pb-4 last:border-b-0"
                >
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() =>
                      setExpandedFAQ(
                        expandedFAQ === faq.question ? null : faq.question
                      )
                    }
                  >
                    <span className="text-neutral-200 font-medium">
                      {faq.question}
                    </span>
                    {expandedFAQ === faq.question ? (
                      <ChevronUp className="h-5 w-5 text-blue-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-400" />
                    )}
                  </button>
                  {expandedFAQ === faq.question && (
                    <p className="text-neutral-400 mt-2">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-center">
              No results found. Try adjusting your search or contacting support.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Support Section */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-neutral-200">Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-400">
            Can’t find what you need? Reach out to our support team for
            personalized help.
          </p>
          <div className="flex items-center gap-2 text-neutral-200">
            <Phone className="h-4 w-4 text-blue-400" />
            <span>+1-800-QUANTUM (800-782-6886)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <Mail className="h-4 w-4 text-blue-400" />
            <span>support@quantumtask.com</span>
          </div>
          <Separator className="bg-neutral-700 my-4" />
          <div className="space-y-4">
            <Input
              placeholder="Your Email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
              className="bg-neutral-700 border-neutral-600 text-white"
            />
            <Input
              placeholder="Subject"
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm({ ...contactForm, subject: e.target.value })
              }
              className="bg-neutral-700 border-neutral-600 text-white"
            />
            <Textarea
              placeholder="Your Message"
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
            />
            <Button
              onClick={handleContactSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
