"use client";

import React, { useState, useMemo } from "react";
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
  Tag,
  User,
  Calendar,
  Download,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  nodeName?: string | null;
  priority: "low" | "medium" | "high";
  labels: string[];
}

const TasksPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [sortBy, setSortBy] = useState<
    "title" | "dueDate" | "status" | "priority"
  >("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    labels: [] as string[],
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const tasksPerPage = 10;

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?userId=${user?.id}`);
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
          priority: newTask.priority,
          labels: newTask.labels,
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        labels: [],
      });
      toast({ title: "Success", description: "Task created successfully" });
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
          priority: task.priority,
          labels: task.labels,
        }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setEditingTask(null);
      setIsTaskModalOpen(false);
      toast({ title: "Success", description: "Task updated successfully" });
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
      setSelectedTasks(selectedTasks.filter((id) => id !== editingTask?.id));
      setEditingTask(null);
      setIsTaskModalOpen(false);
      toast({ title: "Success", description: "Task deleted successfully" });
    },
  });

  const bulkDeleteTasks = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/tasks/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to delete task ${id}`);
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      setSelectedTasks([]);
      toast({
        title: "Success",
        description: "Selected tasks deleted successfully",
      });
    },
  });

  const filteredTasks = useMemo(() => {
    return tasks
      ?.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || task.status === filterStatus;
        const matchesPriority =
          filterPriority === "all" || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "title")
          return sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        if (sortBy === "dueDate") {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (sortBy === "status")
          return sortOrder === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        if (sortBy === "priority") {
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          return sortOrder === "asc"
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return 0;
      })
      .slice((page - 1) * tasksPerPage, page * tasksPerPage);
  }, [
    tasks,
    searchTerm,
    filterStatus,
    filterPriority,
    sortBy,
    sortOrder,
    page,
  ]);

  const exportTasksToCSV = () => {
    if (!filteredTasks || filteredTasks.length === 0) {
      toast({
        title: "No Tasks",
        description: "There are no tasks to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Title",
      "Description",
      "Status",
      "Priority",
      "Due Date",
      "Assigned To",
      "Labels",
    ];

    const rows = filteredTasks.map((task) => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      task.status,
      task.priority,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A",
      task.assignedTo,
      `"${task.labels.join(", ")}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tasks_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Tasks exported successfully.",
    });
  };

  const toggleSortOrder = (
    field: "title" | "dueDate" | "status" | "priority"
  ) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const TaskRow = ({ task }: { task: Task }) => {
    return (
      <TableRow className="border-border hover:bg-muted">
        <TableCell>
          <input
            type="checkbox"
            checked={selectedTasks.includes(task.id)}
            onChange={(e) =>
              setSelectedTasks(
                e.target.checked
                  ? [...selectedTasks, task.id]
                  : selectedTasks.filter((id) => id !== task.id)
              )
            }
            className="mr-2"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateTask.mutate({
                ...task,
                status: task.status === "completed" ? "pending" : "completed",
              })
            }
          >
            <CheckCircle
              className={cn(
                "h-5 w-5",
                task.status === "completed"
                  ? "text-success fill-success"
                  : "text-muted-foreground"
              )}
            />
          </Button>
        </TableCell>
        <TableCell
          className="font-medium cursor-pointer"
          onClick={() => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
        >
          {task.title}
        </TableCell>
        <TableCell className="truncate max-w-[200px]">
          {task.description || "N/A"}
        </TableCell>
        <TableCell>
          <Badge
            className={cn(
              task.priority === "high" &&
                "bg-destructive text-destructive-foreground",
              task.priority === "medium" && "bg-accent text-accent-foreground",
              task.priority === "low" && "bg-muted text-muted-foreground"
            )}
          >
            {task.priority}
          </Badge>
        </TableCell>
        <TableCell>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
        </TableCell>
        <TableCell>{task.assignedTo}</TableCell>
        <TableCell>
          <div className="flex gap-1 flex-wrap">
            {task.labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          >
            <Edit className="h-5 w-5 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask.mutate(task.id)}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <List className="h-9 w-9 text-primary animate-pulse" />
          Task Manager
        </h1>
        <div className="flex gap-4 items-center w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(val) => setFilterStatus(val as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterPriority}
            onValueChange={(val) => setFilterPriority(val as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Creation */}
          <Card className="lg:col-span-1 bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6 text-primary" />
                Create Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="bg-input border-border"
              />
              <Textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="bg-input border-border min-h-[100px]"
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="bg-input border-border"
              />
              <Select
                value={newTask.priority}
                onValueChange={(val) =>
                  setNewTask({
                    ...newTask,
                    priority: val as "low" | "medium" | "high",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Add labels (comma-separated)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const label = e.currentTarget.value.trim();
                    if (label)
                      setNewTask({
                        ...newTask,
                        labels: [...newTask.labels, label],
                      });
                    e.currentTarget.value = "";
                  }
                }}
                className="bg-input border-border"
              />
              <div className="flex flex-wrap gap-2">
                {newTask.labels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setNewTask({
                          ...newTask,
                          labels: newTask.labels.filter((l) => l !== label),
                        })
                      }
                    />
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => createTask.mutate()}
                disabled={createTask.isPending || !newTask.title.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {createTask.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="lg:col-span-2 bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-6 w-6 text-primary" />
                Your Tasks ({filteredTasks?.length || 0})
              </CardTitle>
              <div className="flex gap-2">
                {selectedTasks.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => bulkDeleteTasks.mutate(selectedTasks)}
                    disabled={bulkDeleteTasks.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedTasks.length})
                  </Button>
                )}
                <Button variant="outline" onClick={exportTasksToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("title")}
                      className="cursor-pointer"
                    >
                      Title{" "}
                      {sortBy === "title" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("priority")}
                      className="cursor-pointer"
                    >
                      Priority{" "}
                      {sortBy === "priority" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("dueDate")}
                      className="cursor-pointer"
                    >
                      Due Date{" "}
                      {sortBy === "dueDate" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No tasks found.
                        <List className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of{" "}
                  {Math.ceil((tasks?.length || 0) / tasksPerPage)}
                </span>
                <Button
                  variant="outline"
                  disabled={
                    page >= Math.ceil((tasks?.length || 0) / tasksPerPage)
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Details Modal */}
          {editingTask && (
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Task: {editingTask.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        title: e.target.value,
                      })
                    }
                    placeholder="Task Title"
                  />
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                    className="min-h-[120px]"
                  />
                  <Input
                    type="date"
                    value={editingTask.dueDate || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                  />
                  <Select
                    value={editingTask.status}
                    onValueChange={(val) =>
                      setEditingTask({ ...editingTask, status: val as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(val) =>
                      setEditingTask({ ...editingTask, priority: val as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Add labels (comma-separated)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const label = e.currentTarget.value.trim();
                        if (label && !editingTask.labels.includes(label)) {
                          setEditingTask({
                            ...editingTask,
                            labels: [...editingTask.labels, label],
                          });
                        }
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {editingTask.labels.map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setEditingTask({
                              ...editingTask,
                              labels: editingTask.labels.filter(
                                (l) => l !== label
                              ),
                            })
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTaskModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateTask.mutate(editingTask)}
                    disabled={updateTask.isPending}
                  >
                    {updateTask.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
