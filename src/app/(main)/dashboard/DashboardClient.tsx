"use client";

import React, { useState } from "react";
import {
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Plug,
  Plus,
  Server,
  UserPlus,
  Users,
  Zap,
  AlertCircle,
  Activity,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import { fetchDashboardData, createTask, inviteTeamMember } from "./actions";
import { cn } from "@/lib/utils";

interface DashboardData {
  overview: {
    workflows: { total: number; active: number };
    tasks: {
      total: number;
      completed: number;
      overdue: number;
      completionRate: string;
      recent: {
        id: string;
        title: string;
        status: string;
        dueDate: string | null;
        assignedTo: string;
      }[];
    };
    team: {
      totalMembers: number;
      activeMembers: number;
      recentMembers: {
        id: string;
        email: string;
        role: string;
        status: string;
      }[];
    };
    billing: {
      plan: string;
      nextBillingDate: string | null;
      amountDue: number;
      recentInvoice: {
        id: string;
        amount: number;
        status: string;
        issuedAt: string;
      } | null;
    };
  };
  aiAssistant: {
    recentMessages: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
    }[];
  };
  integrations: {
    connected: number;
    recent: { name: string; status: string; connectedAt: string }[];
  };
  documents: {
    total: number;
    recent: { title: string; updatedAt: string } | null;
  };
  calendar: {
    upcomingEvents: {
      id: string;
      title: string;
      start: string;
      linkedTask: { id: string; title: string } | null;
    }[];
  };
  automations: {
    total: number;
    active: number;
    recent: { title: string; status: string; updatedAt: string } | null;
  };
  activity: {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    timestamp: string;
  }[];
}

const DashboardPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboardData(user?.id),
    enabled: !!user?.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: (title: string) => createTask(user?.id || "", title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
      setNewTaskTitle("");
      toast({ title: "Success", description: "Task created successfully" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      }),
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (email: string) => inviteTeamMember(user?.id || "", email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
      setInviteEmail("");
      toast({ title: "Success", description: "Invitation sent successfully" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      }),
  });

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) createTaskMutation.mutate(newTaskTitle);
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) inviteMemberMutation.mutate(inviteEmail);
  };

  // Sample chart data for task completion trend
  const chartData =
    data?.overview.tasks.recent.map((task, index) => ({
      name: `Day ${index + 1}`,
      completion: parseFloat(data?.overview.tasks.completionRate || "0"),
    })) || [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary/10 to-muted/10 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-1xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 md:h-10 md:w-10 text-primary animate-pulse" />
              Welcome, {user?.fullName || "User"}!
            </h1>
            <p className="text-muted-foreground mt-2 text-[12px] md:text-lg">
              Your command center for tasks, automations, and team
              collaboration.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md"
            >
              <Link href="/tasks">
                <Plus className="h-5 w-5 mr-2" />
                New Task
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-primary border-primary/20 hover:bg-primary/10 rounded-lg"
            >
              <Link href="/team/invite">
                <UserPlus className="h-5 w-5 mr-2" />
                Invite Member
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin text-primary" />
            <p className="ml-4 md:text-lg text-md text-muted-foreground">
              Loading your dashboard...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="bg-card border-border shadow-lg lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-1xl md:text-2xl font-bold flex items-center gap-2">
                  <BarChart2 className="h-6 w-6 text-primary" />
                  At a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      Pending Tasks
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {(data?.overview.tasks.total ?? 0) -
                        (data?.overview.tasks.completed || 0)}
                    </p>
                    <Clock className="h-5 w-5 text-accent mt-2" />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      Completed Tasks
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.overview.tasks.completed || 0}
                    </p>
                    <CheckCircle className="h-5 w-5 text-success mt-2" />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground text-sm whitespace-nowrap">
                      Active Automations
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.automations.active || 0}
                    </p>
                    <Zap className="h-5 w-5 text-primary mt-2" />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      Team Members
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.overview.team.activeMembers || 0}
                    </p>
                    <Users className="h-5 w-5 text-primary mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Overview */}
            <Card className="bg-card border-border shadow-lg md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Tasks
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  <Link href="/tasks">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Progress
                      value={parseFloat(
                        data?.overview.tasks.completionRate || "0"
                      )}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm font-semibold">
                      {data?.overview.tasks.completionRate || 0}% Complete
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.overview.tasks.recent.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium truncate max-w-[200px]">
                            {task.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                task.status === "pending" &&
                                  "bg-accent text-accent-foreground",
                                task.status === "completed" &&
                                  "bg-success text-success-foreground",
                                task.status === "overdue" &&
                                  "bg-destructive text-destructive-foreground"
                              )}
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignedTo}</TableCell>
                          <TableCell>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-input border-border"
                    />
                    <Button
                      onClick={handleCreateTask}
                      disabled={
                        createTaskMutation.isPending || !newTaskTitle.trim()
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Invite team member..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-input border-border"
                  />
                  <Button
                    onClick={handleInviteMember}
                    disabled={
                      inviteMemberMutation.isPending || !inviteEmail.trim()
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Link href="/automations/new">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Automation
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-primary border-primary/20"
                >
                  <Link href="/documents/new">
                    <FileText className="h-4 w-4 mr-2" />
                    New Document
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Team Overview */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Team
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  <Link href="/team">Manage Team</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Active Members
                    </span>
                    <span className="font-semibold">
                      {data?.overview.team.activeMembers || 0}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.overview.team.recentMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium truncate max-w-[150px]">
                            {member.email}
                          </TableCell>
                          <TableCell className="capitalize">
                            {member.role}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                member.status === "active" &&
                                  "bg-success text-success-foreground",
                                member.status === "pending" &&
                                  "bg-accent text-accent-foreground",
                                member.status === "invited" &&
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Automations */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Automations
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  <Link href="/automation-studio">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Active Automations
                    </span>
                    <span className="font-semibold">
                      {data?.automations.active || 0}
                    </span>
                  </div>
                  {data?.automations.recent ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">
                        {data.automations.recent.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: <Badge>{data.automations.recent.status}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated:{" "}
                        {new Date(
                          data.automations.recent.updatedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No recent automations.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Events */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Upcoming Events
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  <Link href="/calendar">View Calendar</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.calendar.upcomingEvents.length ? (
                    data.calendar.upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex justify-between items-center p-2 border-b last:border-b-0"
                      >
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start).toLocaleString()}
                          </p>
                          {event.linkedTask && (
                            <p className="text-sm text-primary">
                              Task: {event.linkedTask.title}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No upcoming events.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-card border-border shadow-lg lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  AI Assistant
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  <Link href="/assistant">Open Chat</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.aiAssistant.recentMessages.length ? (
                    data.aiAssistant.recentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg",
                          msg.sender === "user"
                            ? "bg-muted/50"
                            : "bg-primary/10"
                        )}
                      >
                        <p className="text-sm font-medium">
                          {msg.sender === "user" ? "You" : "AI"}:
                        </p>
                        <p className="text-sm truncate max-w-[300px]">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No recent messages.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border shadow-lg lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.activity.length ? (
                    data.activity.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0"
                      >
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
                      No recent activity.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
