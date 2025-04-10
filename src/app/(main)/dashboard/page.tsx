"use client";

import React from "react";
import {
  Users,
  List,
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";

interface DashboardData {
  team: {
    totalMembers: number;
    activeMembers: number;
    members: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      status: string;
    }[];
  };
  tasks: {
    pendingTasks: number;
    completedTasks: number;
    overdueTasks: number;
    recentTasks: {
      id: string;
      title: string;
      status: "pending" | "completed" | "overdue";
      dueDate: string;
    }[];
  };
}

const DashboardPage = () => {
  const { user } = useSession();

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
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Users className="h-9 w-9 text-primary animate-pulse" />
          Dashboard
        </h1>
        <div className="flex gap-4">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
          >
            <Link href="/tasks/new">
              <Plus className="h-5 w-5 mr-2" />
              New Task
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="text-primary border-border hover:bg-muted hover:text-foreground font-semibold rounded-lg transition-all duration-300"
          >
            <Link href="/team/invite">
              <Plus className="h-5 w-5 mr-2" />
              Invite Member
            </Link>
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
          {/* Task Overview */}
          <Card className="bg-card border border-border rounded-xl shadow-lg lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <List className="h-6 w-6 text-primary animate-pulse" />
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  Task Overview
                </CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                className="text-primary border-border hover:bg-muted hover:text-foreground rounded-lg"
              >
                <Link href="/tasks">View All Tasks</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Clock className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-card-foreground text-xl font-semibold">
                      {dashboardData?.tasks.pendingTasks || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <CheckCircle className="h-6 w-6 text-success" />{" "}
                  {/* Add --success to globals.css if missing */}
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-card-foreground text-xl font-semibold">
                      {dashboardData?.tasks.completedTasks || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="text-muted-foreground text-sm">Overdue</p>
                    <p className="text-card-foreground text-xl font-semibold">
                      {dashboardData?.tasks.overdueTasks || 0}
                    </p>
                  </div>
                </div>
              </div>
              {/* Recent Tasks */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-foreground font-medium">
                      Task
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Due Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.tasks.recentTasks?.length ? (
                    dashboardData.tasks.recentTasks.slice(0, 5).map((task) => (
                      <TableRow
                        key={task.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium truncate max-w-[300px]">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1 rounded-full",
                              task.status === "pending"
                                ? "bg-accent/20 text-accent"
                                : task.status === "completed"
                                ? "bg-success/20 text-success" /* Add --success if missing */
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground text-center py-6"
                      >
                        No recent tasks.
                        <List className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary animate-pulse" />
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  Team Overview
                </CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                className="text-primary border-border hover:bg-muted hover:text-foreground rounded-lg"
              >
                <Link href="/team">Manage Team</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="text-card-foreground text-xl font-semibold">
                    {dashboardData?.team.totalMembers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="text-card-foreground text-xl font-semibold">
                    {dashboardData?.team.activeMembers || 0}
                  </span>
                </div>
              </div>
              {/* Team Members */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-foreground font-medium">
                      Name
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.team.members?.length ? (
                    dashboardData.team.members.slice(0, 5).map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium truncate max-w-[200px]">
                          {member.fullName}
                        </TableCell>
                        <TableCell className="text-foreground capitalize">
                          {member.role}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-muted-foreground text-center py-6"
                      >
                        No team members.
                        <Users className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
