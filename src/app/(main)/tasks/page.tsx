// src/app/(mainPages)/tasks/page.tsx
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
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

// Types for tasks
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
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch task list
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

  // Mutation to create a task
  const createTask = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newTaskTitle || "Untitled Task",
          description: newTaskDescription,
          dueDate: newTaskDueDate || undefined,
          status: "pending",
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
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

  // Mutation to update a task
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

  // Mutation to delete a task
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

  // Filter tasks based on search term and status
  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
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

  return (
    <div className="flex flex-col min-h-screen  text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="h-8 w-8 text-blue-400" />
          Tasks
        </h1>
        <div className="flex gap-4 items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-700 border-neutral-600 text-white"
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
            className="bg-neutral-700 border-neutral-600 text-white p-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      {tasksLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Create New Task */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task Title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
              <Input
                placeholder="Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
              <Button
                onClick={() => createTask.mutate()}
                disabled={createTask.isPending}
              >
                {createTask.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Task
              </Button>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-neutral-400">Status</TableHead>
                    <TableHead className="text-neutral-400">Title</TableHead>
                    <TableHead className="text-neutral-400">
                      Description
                    </TableHead>
                    <TableHead className="text-neutral-400">Due Date</TableHead>
                    <TableHead className="text-neutral-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} className="border-neutral-700">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleComplete(task)}
                            className={cn(
                              "text-neutral-400 hover:text-neutral-200",
                              task.status === "completed" &&
                                "text-green-400 hover:text-green-300"
                            )}
                          >
                            <CheckCircle
                              className={cn(
                                "h-4 w-4",
                                task.status === "completed" && "fill-green-400"
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {editingTask?.id === task.id ? (
                            <Input
                              value={editingTask.title}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  title: e.target.value,
                                })
                              }
                              className="bg-neutral-700 border-neutral-600 text-white"
                            />
                          ) : (
                            task.title
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {editingTask?.id === task.id ? (
                            <Input
                              value={editingTask.description}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  description: e.target.value,
                                })
                              }
                              className="bg-neutral-700 border-neutral-600 text-white"
                            />
                          ) : (
                            task.description || "No description"
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-200">
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
                              className="bg-neutral-700 border-neutral-600 text-white"
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
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask.mutate(task.id)}
                                disabled={deleteTask.isPending}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
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
                        className="text-neutral-400 text-center"
                      >
                        No tasks found.
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
