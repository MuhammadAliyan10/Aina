// src/app/(mainPages)/analytics/page.tsx
"use client";

import React, { useState } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Activity,
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
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useSession } from "@/app/(main)/SessionProvider";

// Types for analytics data
interface WorkflowPerformance {
  name: string;
  executions: number;
  successRate: number;
}

interface TaskCompletion {
  date: string;
  completed: number;
  pending: number;
}

interface AIUsage {
  category: string;
  value: number;
}

const AnalyticsPage = () => {
  const { user } = useSession();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );

  // Fetch analytics data
  const { data: workflowData, isLoading: workflowLoading } = useQuery<
    WorkflowPerformance[]
  >({
    queryKey: ["workflowPerformance", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/workflows?userId=${user?.id}&range=${timeRange}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
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
          `/api/analytics/tasks?userId=${user?.id}&range=${timeRange}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
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
        `/api/analytics/ai?userId=${user?.id}&range=${timeRange}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch AI usage");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const timeRangeOptions = [
    { label: "Last Week", value: "week" },
    { label: "Last Month", value: "month" },
    { label: "Last Year", value: "year" },
  ];

  const isLoading = workflowLoading || taskLoading || aiLoading;

  return (
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? "default" : "outline"}
              onClick={() =>
                setTimeRange(option.value as "week" | "month" | "year")
              }
              className={cn(
                "text-neutral-200",
                timeRange === option.value
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "border-blue-400 hover:bg-neutral-800"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Workflow Performance */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                Workflow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  executions: {
                    label: "Executions",
                    color: "hsl(205, 78%, 60%)",
                  },
                  successRate: {
                    label: "Success Rate (%)",
                    color: "hsl(120, 60%, 60%)",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={workflowData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(0, 0%, 20%)"
                    />
                    <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
                    <YAxis stroke="hsl(0, 0%, 70%)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="executions"
                      fill="hsl(205, 78%, 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="successRate"
                      fill="hsl(120, 60%, 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Task Completion */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(120, 60%, 60%)",
                  },
                  pending: { label: "Pending", color: "hsl(0, 60%, 60%)" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={taskData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(0, 0%, 20%)"
                    />
                    <XAxis dataKey="date" stroke="hsl(0, 0%, 70%)" />
                    <YAxis stroke="hsl(0, 0%, 70%)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="hsl(120, 60%, 60%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="hsl(0, 60%, 60%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* AI Usage */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">AI Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: "Usage", color: "hsl(205, 78%, 60%)" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={aiData || []}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(205, 78%, 60%)"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
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
