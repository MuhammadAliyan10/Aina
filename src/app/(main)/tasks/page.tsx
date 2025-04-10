"use client";

import React, { useState } from "react";
import {
  List,
  Plus,
  CheckCircle,
  Trash2,
  Edit,
  Search,
  Loader2,
  Filter,
  X,
  ChevronDown,
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
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const TasksPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"title" | "dueDate" | "status">(
    "dueDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newTask.title || "Untitled Task",
          description: newTask.description,
          dueDate: newTask.dueDate || undefined,
          status: "pending",
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setNewTask({ title: "", description: "", dueDate: "" });
      toast({ title: "Success", description: "Task created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (task: Task) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setEditingTask(null);
      toast({ title: "Success", description: "Task updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      toast({ title: "Success", description: "Task deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks
    ?.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleSave = () => {
    if (editingTask) {
      updateTask.mutate(editingTask);
    }
  };

  const handleToggleComplete = (task: Task) => {
    updateTask.mutate({
      ...task,
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  const toggleSortOrder = (field: "title" | "dueDate" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <List className="h-9 w-9 text-primary animate-pulse" />
          Tasks
        </h1>
        <div className="flex gap-4 items-center w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as
                  | "all"
                  | "pending"
                  | "in_progress"
                  | "completed"
              )
            }
            className="bg-input border-border text-foreground p-2 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      {tasksLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Create New Task */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Plus className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
              />
              <Textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[100px]"
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
              />
              <Button
                onClick={() => createTask.mutate()}
                disabled={createTask.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {createTask.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                Create Task
              </Button>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Filter className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("title")}
                    >
                      Title
                      {sortBy === "title" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Description
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("dueDate")}
                    >
                      Due Date
                      {sortBy === "dueDate" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleComplete(task)}
                            className={cn(
                              "text-muted-foreground hover:text-foreground",
                              task.status === "completed" &&
                                "text-success hover:text-success/80",
                              task.status === "in_progress" &&
                                "text-accent hover:text-accent/80"
                            )}
                          >
                            <CheckCircle
                              className={cn(
                                "h-5 w-5",
                                task.status === "completed" && "fill-success",
                                task.status === "in_progress" && "fill-accent"
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {editingTask?.id === task.id ? (
                            <Input
                              value={editingTask.title}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  title: e.target.value,
                                })
                              }
                              className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                            />
                          ) : (
                            task.title
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {editingTask?.id === task.id ? (
                            <Textarea
                              value={editingTask.description}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  description: e.target.value,
                                })
                              }
                              className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[80px]"
                            />
                          ) : (
                            task.description || "No description"
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {editingTask?.id === task.id ? (
                            <Input
                              type="date"
                              value={editingTask.dueDate || ""}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  dueDate: e.target.value,
                                })
                              }
                              className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                            />
                          ) : (
                            (task.dueDate &&
                              new Date(task.dueDate).toLocaleDateString()) ||
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editingTask?.id === task.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                disabled={updateTask.isPending}
                                className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(null)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(task)}
                                className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask.mutate(task.id)}
                                disabled={deleteTask.isPending}
                                className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground text-center py-6"
                      >
                        No tasks found.
                        <List className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
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

export default TasksPage;
