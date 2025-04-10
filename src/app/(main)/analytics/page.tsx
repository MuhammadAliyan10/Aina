"use client";

import React, { useState } from "react";
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Calendar,
  Activity,
  Zap,
  Loader2,
  Users,
  AlertTriangle,
  Link,
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
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { useSession } from "@/app/(main)/SessionProvider";

interface WorkflowPerformance {
  name: string;
  executions: number;
  successRate: number;
  errors: number;
}

interface TaskCompletion {
  date: string;
  completed: number;
  pending: number;
  overdue: number;
}

interface AIUsage {
  category: string;
  value: number;
}

interface IntegrationUsage {
  name: string;
  requests: number;
}

interface UserActivity {
  date: string;
  logins: number;
  actions: number;
}

const COLORS = [
  "hsl(var(--primary))", // Maps to --primary
  "hsl(var(--secondary))", // Maps to --secondary
  "hsl(var(--accent))", // Maps to --accent
  "hsl(var(--muted))", // Maps to --muted
  "hsl(var(--success))", // Add --success to globals.css if needed, or use a fallback
];

const AnalyticsPage = () => {
  const { user } = useSession();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );

  const { data: workflowData, isLoading: workflowLoading } = useQuery<
    WorkflowPerformance[]
  >({
    queryKey: ["workflowPerformance", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/workflows?userId=${user?.id}&range=${timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch workflow performance");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: taskData, isLoading: taskLoading } = useQuery<TaskCompletion[]>(
    {
      queryKey: ["taskCompletion", user?.id, timeRange],
      queryFn: async () => {
        const response = await fetch(
          `/api/analytics/tasks?userId=${user?.id}&range=${timeRange}`
        );
        if (!response.ok) throw new Error("Failed to fetch task completion");
        return response.json();
      },
      enabled: !!user?.id,
    }
  );

  const { data: aiData, isLoading: aiLoading } = useQuery<AIUsage[]>({
    queryKey: ["aiUsage", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/ai?userId=${user?.id}&range=${timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch AI usage");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: integrationData, isLoading: integrationLoading } = useQuery<
    IntegrationUsage[]
  >({
    queryKey: ["integrationUsage", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/integrations?userId=${user?.id}&range=${timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch integration usage");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: userActivityData, isLoading: userActivityLoading } = useQuery<
    UserActivity[]
  >({
    queryKey: ["userActivity", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/user-activity?userId=${user?.id}&range=${timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch user activity");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const timeRangeOptions = [
    { label: "Last Week", value: "week" },
    { label: "Last Month", value: "month" },
    { label: "Last Year", value: "year" },
  ];

  const isLoading =
    workflowLoading ||
    taskLoading ||
    aiLoading ||
    integrationLoading ||
    userActivityLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Zap className="h-9 w-9 text-primary animate-pulse" />
          Analytics
        </h1>
        <div className="flex gap-3">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? "default" : "outline"}
              onClick={() =>
                setTimeRange(option.value as "week" | "month" | "year")
              }
              className={cn(
                "text-foreground font-semibold rounded-lg transition-all duration-300",
                timeRange === option.value
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                AI Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: "Value", color: COLORS[0] },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={aiData || []}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill={COLORS[0]}
                      label={({ name }) => name}
                    >
                      {(aiData || []).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Link className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                Integration Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  requests: { label: "Requests", color: COLORS[1] },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={integrationData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="requests"
                      fill={COLORS[1]}
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  logins: { label: "Logins", color: COLORS[0] },
                  actions: { label: "Actions", color: COLORS[2] },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={userActivityData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      stroke={COLORS[0]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actions"
                      stroke={COLORS[2]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
