// src/app/(mainPages)/dashboard/page.tsx
"use client";

import React from "react";
import {
  BarChart,
  DollarSign,
  Users,
  Bot,
  Cable,
  FileText,
  List,
  Calendar,
  Zap,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";

// Types for dashboard data
interface DashboardData {
  analytics: {
    workflowExecutions: number;
    taskCompletionRate: number;
    aiUsage: number;
  };
  billing: {
    plan: string;
    nextBillingDate: string;
    amountDue: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
  };
  aiAssistant: {
    recentMessages: {
      content: string;
      sender: "user" | "ai";
      timestamp: string;
    }[];
  };
  integrations: {
    connectedCount: number;
  };
  documents: {
    totalDocs: number;
    recentDoc: { title: string; updatedAt: string };
  };
  tasks: {
    pendingTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  calendar: {
    upcomingEvents: { title: string; start: string }[];
  };
  automation: {
    activeWorkflows: number;
    recentWorkflow: { name: string; status: string };
  };
}

const DashboardPage = () => {
  const { user } = useSession();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    },
    enabled: !!user?.id,
  });

  return (
    <div className="flex flex-col min-h-screen  text-neutral-200 p-6">
      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="text-blue-400">Welcome back,</span>{" "}
          {user?.fullName || "User"}!
        </h1>

        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Workflows Run</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.analytics.workflowExecutions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tasks Completed</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.tasks.completedTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Team Members</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.team.totalMembers || 0}
                  </span>
                </div>
                <Button className="w-full transition-colors" asChild>
                  <Link href="/analytics">Explore Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Your Plan */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Current Plan</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.billing.plan || "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Next Billing</span>
                  <span className="text-neutral-200">
                    {dashboardData?.billing.nextBillingDate
                      ? new Date(
                          dashboardData.billing.nextBillingDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount Due</span>
                  <span className="text-neutral-200 font-medium">
                    ${dashboardData?.billing.amountDue.toFixed(2) || "0.00"}
                  </span>
                </div>
                <Button className="w-full  transition-colors" asChild>
                  <Link href="/billing">Manage Billing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Team at a Glance */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  Team at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Members</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.team.totalMembers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Members</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.team.activeMembers || 0}
                  </span>
                </div>
                <Button className="w-full transition-colors" asChild>
                  <Link href="/team">See Your Team</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant Chat */}
            <Card className="bg-neutral-800 border-neutral-700 md:col-span-2 lg:col-span-3 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {dashboardData?.aiAssistant.recentMessages.length ? (
                    dashboardData.aiAssistant.recentMessages
                      .slice(0, 5)
                      .map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-2 p-2 rounded-md",
                            msg.sender === "user"
                              ? "bg-blue-600 justify-end"
                              : "bg-neutral-700 justify-start"
                          )}
                        >
                          <span className="text-neutral-200">
                            {msg.content.slice(0, 50)}...
                          </span>
                          <span className="text-neutral-400 text-sm ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-neutral-400 text-center">
                      No recent messages.
                    </p>
                  )}
                </div>
                <Button className="w-full mt-4 transition-colors" asChild>
                  <Link href="/ai-assistant">Chat with AI</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Connected Integrations */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Cable className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  Connected Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Connections</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.integrations.connectedCount || 0}
                  </span>
                </div>
                <Button className="w-full  transition-colors" asChild>
                  <Link href="/integrations">Manage Integrations</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Your Documents */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  Your Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Documents</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.documents.totalDocs || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Latest Update</span>
                  <span className="text-neutral-200 truncate max-w-[150px]">
                    {dashboardData?.documents.recentDoc?.title || "N/A"}
                  </span>
                </div>
                <Button className="w-full transition-colors" asChild>
                  <Link href="/documents">View Documents</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Task Status */}
            <Card className="bg-neutral-800 border-neutral-700 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <List className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">Task Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pending</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.tasks.pendingTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Completed</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.tasks.completedTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Overdue</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.tasks.overdueTasks || 0}
                  </span>
                </div>
                <Button className="w-full  transition-colors" asChild>
                  <Link href="/tasks">Manage Tasks</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-neutral-800 border-neutral-700 md:col-span-2 lg:col-span-3 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {dashboardData?.calendar.upcomingEvents.length ? (
                    dashboardData.calendar.upcomingEvents
                      .slice(0, 5)
                      .map((event, index) => (
                        <div
                          key={index}
                          className="flex justify-between p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                        >
                          <span className="text-neutral-200 truncate max-w-[60%]">
                            {event.title}
                          </span>
                          <span className="text-neutral-400 text-sm">
                            {new Date(event.start).toLocaleString()}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-neutral-400 text-center">
                      No upcoming events.
                    </p>
                  )}
                </div>
                <Button className="w-full mt-4 transition-colors" asChild>
                  <Link href="/calendar">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Automation Overview */}
            <Card className="bg-neutral-800 border-neutral-700 md:col-span-2 lg:col-span-3 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-neutral-200">
                  Automation Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Workflows</span>
                  <span className="text-neutral-200 font-medium">
                    {dashboardData?.automation.activeWorkflows || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Latest Workflow</span>
                  <span className="text-neutral-200 truncate max-w-[200px]">
                    {dashboardData?.automation.recentWorkflow?.name || "N/A"}
                  </span>
                </div>
                <ChartContainer
                  config={{
                    executions: {
                      label: "Executions",
                      color: "hsl(205, 78%, 60%)",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: "Mon", executions: 12 },
                        { name: "Tue", executions: 19 },
                        { name: "Wed", executions: 15 },
                        { name: "Thu", executions: 22 },
                        { name: "Fri", executions: 18 },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(0, 0%, 20%)"
                      />
                      <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
                      <YAxis stroke="hsl(0, 0%, 70%)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="executions"
                        fill="hsl(205, 78%, 60%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <Button className="w-full transition-colors" asChild>
                  <Link href="/automation-studio">Automation Studio</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
