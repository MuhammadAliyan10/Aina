"use client";

import React, { useState } from "react";
import {
  Users,
  List,
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  UserPlus,
  FileText,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import { fetchDashboardData, createTask, inviteTeamMember } from "./actions"; // Import backend actions
import { DashboardData } from "./types/DashboardDataTypes";

const DashboardPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboardData(user?.id),
    enabled: !!user?.id,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (title: string) => createTask(user?.id || "", title),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] });
      }
      setNewTaskTitle("");
      toast({ title: "Success", description: "Task created successfully" });
    },
    onError: (error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      }),
  });

  // Invite team member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: (email: string) => inviteTeamMember(user?.id || "", email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
      setInviteEmail("");
      toast({ title: "Success", description: "Invitation sent successfully" });
    },
    onError: (error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      }),
  });

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) createTaskMutation.mutate(newTaskTitle);
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) inviteMemberMutation.mutate(inviteEmail);
  };

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
              <UserPlus className="h-5 w-5 mr-2" />
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
          {/* Quick Stats & Actions */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <FileText className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">
                    Avg. Task Completion
                  </span>
                  <span className="text-foreground font-semibold">
                    {dashboardData?.stats.avgTaskCompletionTime || 0} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">Team Workload</span>
                  <span className="text-foreground font-semibold">
                    {dashboardData?.stats.teamWorkload || 0}%
                  </span>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                  />
                  <Button
                    onClick={handleCreateTask}
                    disabled={
                      createTaskMutation.isPending || !newTaskTitle.trim()
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-2"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Invite email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                  />
                  <Button
                    onClick={handleInviteMember}
                    disabled={
                      inviteMemberMutation.isPending || !inviteEmail.trim()
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-2"
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <p className="text-foreground text-xl font-semibold">
                      {dashboardData?.tasks.pendingTasks || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <CheckCircle className="h-6 w-6 text-success" />
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-foreground text-xl font-semibold">
                      {dashboardData?.tasks.completedTasks || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="text-muted-foreground text-sm">Overdue</p>
                    <p className="text-foreground text-xl font-semibold">
                      {dashboardData?.tasks.overdueTasks || 0}
                    </p>
                  </div>
                </div>
              </div>
              {/* Recent Tasks */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium">
                      Task
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Assigned To
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
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
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {task.assignedTo}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="text-foreground font-semibold">
                    {dashboardData?.team.totalMembers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="text-foreground font-semibold">
                    {dashboardData?.team.activeMembers || 0}
                  </span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Role
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
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
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1 rounded-full",
                              member.status === "active"
                                ? "bg-success/20 text-success"
                                : member.status === "pending"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {member.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
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

          {/* Recent Activity */}
          <Card className="bg-card border border-border rounded-xl shadow-lg lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.activity?.length ? (
                <div className="space-y-4">
                  {dashboardData.activity.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 border-b border-border last:border-b-0"
                    >
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-foreground">
                          {log.user} {log.action}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-4 text-primary animate-bounce" />
                  <p>No recent activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
