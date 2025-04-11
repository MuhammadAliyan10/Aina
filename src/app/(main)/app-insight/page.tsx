// src/app/(main)/app-insights/page.tsx
"use client";

import React, { useState } from "react";
import {
  Activity,
  BarChart2,
  Clock,
  FileText,
  GitBranch,
  Plug,
  Users,
  Zap,
  Server,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/app/(main)/SessionProvider";
import { fetchAppInsights } from "./actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface AppInsightsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    recentLogins: number;
  };
  tasks: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    avgCompletionTime: string;
  };
  automations: {
    totalAutomations: number;
    activeAutomations: number;
    avgSuccessRate: string;
    recentExecutions: {
      id: string;
      executedAt: string;
      success: boolean;
      result: string;
    }[];
  };
  workflows: {
    totalWorkflows: number;
    activeWorkflows: number;
  };
  integrations: {
    connectedIntegrations: number;
    recentIntegrations: { name: string; connectedAt: string; status: string }[];
  };
  documents: {
    totalDocuments: number;
    recentDocument: { title: string; updatedAt: string } | null;
  };
  events: {
    totalEvents: number;
    upcomingEvents: number;
  };
  activity: {
    action: string;
    entityType: string | null;
    entityId: string | null;
    timestamp: string;
  }[];
  systemHealth: {
    avgResponseTime: string;
    uptime: string;
    recentMetrics: { metricType: string; value: number; recordedAt: string }[];
  };
  usagePatterns: {
    topEvents: { eventType: string; count: number }[];
  };
  team: {
    totalMembers: number;
    activeMembers: number;
  };
  billing: {
    plan: string;
    amount: number;
    nextBillingDate: string | null;
    totalInvoices: number;
  };
}

const AppInsightsPage = () => {
  const { user } = useSession();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");

  const { data, isLoading } = useQuery<AppInsightsData>({
    queryKey: ["app-insights", user?.id, timeRange],
    queryFn: () => fetchAppInsights(user?.id, timeRange),
    enabled: !!user?.id,
  });

  const chartData = data?.systemHealth.recentMetrics
    .filter((m) => m.metricType === "api_response_time")
    .map((m) => ({
      date: new Date(m.recordedAt).toLocaleDateString(),
      value: m.value,
    }))
    .slice(0, 7);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <BarChart2 className="h-9 w-9 text-primary animate-pulse" />
          App Insights
        </h1>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            onClick={() => setTimeRange("7d")}
            className="rounded-lg"
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            onClick={() => setTimeRange("30d")}
            className="rounded-lg"
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            onClick={() => setTimeRange("all")}
            className="rounded-lg"
          >
            All Time
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <BarChart2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading insights...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          {/* User Engagement */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                User Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="font-semibold">
                    {data?.userEngagement.totalUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Active Users ({timeRange})
                  </span>
                  <span className="font-semibold">
                    {data?.userEngagement.activeUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recent Logins</span>
                  <span className="font-semibold">
                    {data?.userEngagement.recentLogins || 0}
                  </span>
                </div>
                <Progress
                  value={
                    ((data?.userEngagement.activeUsers || 0) /
                      (data?.userEngagement.totalUsers || 1)) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Task Analytics */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                Task Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span className="font-semibold">
                    {data?.tasks.totalTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">
                    {data?.tasks.completedTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue</span>
                  <span className="font-semibold">
                    {data?.tasks.overdueTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Completion</span>
                  <span className="font-semibold">
                    {data?.tasks.avgCompletionTime || "0"} hrs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Analytics */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                Automation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Automations
                  </span>
                  <span className="font-semibold">
                    {data?.automations.totalAutomations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-semibold">
                    {data?.automations.activeAutomations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">
                    {data?.automations.avgSuccessRate || "0"}%
                  </span>
                </div>
                <Progress
                  value={parseFloat(data?.automations.avgSuccessRate || "0")}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-card border-border shadow-lg md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center gap-3">
              <Server className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">
                      Avg. Response Time
                    </span>
                    <span className="font-semibold">
                      {data?.systemHealth.avgResponseTime || "0"} ms
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-semibold">
                      {data?.systemHealth.uptime || "0"}%
                    </span>
                  </div>
                </div>
                <div>
                  <LineChart width={500} height={200} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border shadow-lg md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.activity.map((log) => (
                    <TableRow key={log.timestamp}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entityType || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Usage Patterns */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                Usage Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data?.usagePatterns.topEvents.map((event) => (
                  <div key={event.eventType} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {event.eventType}
                    </span>
                    <Badge>{event.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Plug className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected</span>
                  <span className="font-semibold">
                    {data?.integrations.connectedIntegrations || 0}
                  </span>
                </div>
                {data?.integrations.recentIntegrations.map((i) => (
                  <div key={i.name} className="flex justify-between">
                    <span className="text-muted-foreground">{i.name}</span>
                    <Badge
                      variant={
                        i.status === "CONNECTED" ? "default" : "destructive"
                      }
                    >
                      {i.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Overview */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">
                Billing Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">
                    {data?.billing.plan || "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    ${data?.billing.amount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Billing</span>
                  <span className="font-semibold">
                    {data?.billing.nextBillingDate
                      ? new Date(
                          data.billing.nextBillingDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-semibold">
                    {data?.billing.totalInvoices || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AppInsightsPage;
