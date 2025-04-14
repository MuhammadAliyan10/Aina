"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  fetchSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  createDailyTask,
  completeTask,
} from "../actions";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  points: number;
  category?: string;
}

interface Subject {
  id: string;
  name: string;
  semester: number;
  credits: number;
  progress: number;
  tasks: Task[];
}

interface SubjectsData {
  subjects: Subject[];
  degree: {
    totalSemesters: number;
    currentSemester: number;
  } | null;
}

const SubjectsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newSubject, setNewSubject] = useState("");
  const [subjectCredits, setSubjectCredits] = useState("3");
  const [subjectSemester, setSubjectSemester] = useState("1");
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [taskSubjectId, setTaskSubjectId] = useState<string | null>(null);

  // Fetch subjects
  const { data, isLoading } = useQuery<SubjectsData>({
    queryKey: ["subjects", user?.id],
    queryFn: () => fetchSubjects(user?.id ?? ""),
    enabled: !!user?.id,
  });

  // Mutations
  const addSubjectMutation = useMutation({
    mutationFn: ({
      name,
      credits,
      semester,
    }: {
      name: string;
      credits: number;
      semester: number;
    }) =>
      addSubject(
        user?.id || "",
        data?.degree?.id || "",
        name,
        semester,
        credits
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", user?.id] });
      setNewSubject("");
      setSubjectCredits("3");
      setSubjectSemester("1");
      toast({ title: "Success", description: "Subject added" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      }),
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({
      id,
      name,
      credits,
      semester,
    }: {
      id: string;
      name: string;
      credits: number;
      semester: number;
    }) => updateSubject(user?.id || "", id, name, credits, semester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", user?.id] });
      setEditSubject(null);
      toast({ title: "Success", description: "Subject updated" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      }),
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSubject(user?.id || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", user?.id] });
      setDeleteSubjectId(null);
      toast({ title: "Success", description: "Subject deleted" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      }),
  });

  const createTaskMutation = useMutation({
    mutationFn: ({
      subjectId,
      title,
      category,
    }: {
      subjectId: string;
      title: string;
      category?: string;
    }) =>
      createDailyTask(user?.id || "", subjectId, title, undefined, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", user?.id] });
      setNewTaskTitle("");
      setNewTaskCategory("");
      setTaskSubjectId(null);
      toast({ title: "Success", description: "Task created" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      }),
  });

  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      completeTask(user?.id || "", taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", user?.id] });
      toast({ title: "Success", description: "Task completed" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      }),
  });

  // Handlers
  const handleAddSubject = () => {
    if (!user?.id || !data?.degree?.id || !newSubject.trim()) {
      toast({
        title: "Error",
        description: "Subject name required",
        variant: "destructive",
      });
      return;
    }
    const creditsNumber = parseInt(subjectCredits, 10);
    const semesterNumber = parseInt(subjectSemester, 10);
    if (
      isNaN(creditsNumber) ||
      creditsNumber < 1 ||
      creditsNumber > 6 ||
      isNaN(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      toast({
        title: "Error",
        description: "Invalid credits (1-6) or semester (1-8)",
        variant: "destructive",
      });
      return;
    }
    addSubjectMutation.mutate({
      name: newSubject,
      credits: creditsNumber,
      semester: semesterNumber,
    });
  };

  const handleUpdateSubject = () => {
    if (!user?.id || !editSubject?.id || !editSubject.name.trim()) {
      toast({
        title: "Error",
        description: "Subject name required",
        variant: "destructive",
      });
      return;
    }
    const creditsNumber = editSubject.credits;
    const semesterNumber = editSubject.semester;
    if (
      isNaN(creditsNumber) ||
      creditsNumber < 1 ||
      creditsNumber > 6 ||
      isNaN(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      toast({
        title: "Error",
        description: "Invalid credits (1-6) or semester (1-8)",
        variant: "destructive",
      });
      return;
    }
    updateSubjectMutation.mutate({
      id: editSubject.id,
      name: editSubject.name,
      credits: creditsNumber,
      semester: semesterNumber,
    });
  };

  const handleDeleteSubject = () => {
    if (!user?.id || !deleteSubjectId) {
      toast({
        title: "Error",
        description: "Invalid subject",
        variant: "destructive",
      });
      return;
    }
    deleteSubjectMutation.mutate({ id: deleteSubjectId });
  };

  const handleCreateTask = () => {
    if (!user?.id || !taskSubjectId || !newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title required",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate({
      subjectId: taskSubjectId,
      title: newTaskTitle,
      category: newTaskCategory || undefined,
    });
  };

  const handleCompleteTask = (taskId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in",
        variant: "destructive",
      });
      return;
    }
    completeTaskMutation.mutate({ taskId });
  };

  // Summary chart data
  const summaryChartData = data?.degree?.totalSemesters
    ? Array.from({ length: data.degree.totalSemesters }, (_, i) => {
        const semester = i + 1;
        const subjects = data.subjects.filter((s) => s.semester === semester);
        const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
        const avgProgress =
          subjects.length > 0
            ? subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length
            : 0;
        return {
          name: `Sem ${semester}`,
          credits: totalCredits,
          progress: avgProgress,
        };
      })
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-gradient-to-r from-purple-500/10 to-muted/10 py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-purple-500" />
            Subjects
          </h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Manage your subjects and track progress across semesters.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {Array.from(
                { length: data?.degree?.totalSemesters || 8 },
                (_, i) => (
                  <TabsTrigger key={i + 1} value={`semester-${i + 1}`}>
                    Semester {i + 1}
                  </TabsTrigger>
                )
              )}
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-purple-500" />
                    Degree Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Subjects
                        </p>
                        <p className="text-2xl font-semibold">
                          {data?.subjects.length}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Credits
                        </p>
                        <p className="text-2xl font-semibold">
                          {data?.subjects.reduce(
                            (sum, s) => sum + s.credits,
                            0
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Average Progress
                        </p>
                        <p className="text-2xl font-semibold">
                          {data?.subjects.length
                            ? (
                                data.subjects.reduce(
                                  (sum, s) => sum + s.progress,
                                  0
                                ) / data.subjects.length
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={summaryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b4b4b" />
                        <XAxis dataKey="name" stroke="#a0a0a0" />
                        <YAxis yAxisId="left" stroke="#a0a0a0" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#a0a0a0"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f1f1f",
                            border: "none",
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="credits"
                          fill="#9333ea"
                          name="Credits"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="progress"
                          fill="#d8b4fe"
                          name="Progress (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Semester Tabs */}
            {Array.from(
              { length: data?.degree?.totalSemesters || 8 },
              (_, i) => {
                const semester = i + 1;
                const semesterSubjects = data?.subjects.filter(
                  (s) => s.semester === semester
                );
                return (
                  <TabsContent key={semester} value={`semester-${semester}`}>
                    <Card className="bg-card border-border shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-purple-500" />
                            Semester {semester}
                          </div>
                          <Button
                            onClick={() => {
                              setSubjectSemester(semester.toString());
                              setNewSubject("");
                              setSubjectCredits("3");
                            }}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subject
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {semesterSubjects?.length ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {semesterSubjects.map((subject) => (
                                <TableRow key={subject.id}>
                                  <TableCell className="font-medium">
                                    {subject.name}
                                  </TableCell>
                                  <TableCell>{subject.credits}</TableCell>
                                  <TableCell>
                                    <Progress
                                      value={subject.progress}
                                      className="h-2 w-24"
                                    />
                                    <span className="ml-2 text-sm">
                                      {subject.progress.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          placeholder="Add task..."
                                          value={
                                            taskSubjectId === subject.id
                                              ? newTaskTitle
                                              : ""
                                          }
                                          onChange={(e) => {
                                            setTaskSubjectId(subject.id);
                                            setNewTaskTitle(e.target.value);
                                          }}
                                          className="bg-input border-border"
                                        />
                                        <Select
                                          value={
                                            taskSubjectId === subject.id
                                              ? newTaskCategory
                                              : ""
                                          }
                                          onValueChange={(val) => {
                                            setTaskSubjectId(subject.id);
                                            setNewTaskCategory(val);
                                          }}
                                        >
                                          <SelectTrigger className="w-32 bg-input border-border">
                                            <SelectValue placeholder="Category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="study">
                                              Study
                                            </SelectItem>
                                            <SelectItem value="project">
                                              Project
                                            </SelectItem>
                                            <SelectItem value="revision">
                                              Revision
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          size="sm"
                                          onClick={handleCreateTask}
                                          disabled={
                                            taskSubjectId !== subject.id ||
                                            createTaskMutation.isPending
                                          }
                                          className="bg-purple-500 hover:bg-purple-600"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      {subject.tasks.map((task) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center gap-2"
                                        >
                                          <CheckCircle
                                            className={`h-4 w-4 ${
                                              task.status === "completed"
                                                ? "text-green-500"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                          <span className="text-sm">
                                            {task.title}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant={
                                              task.status === "completed"
                                                ? "outline"
                                                : "default"
                                            }
                                            onClick={() =>
                                              handleCompleteTask(task.id)
                                            }
                                            disabled={
                                              task.status === "completed"
                                            }
                                            className={
                                              task.status === "completed"
                                                ? "text-green-500 border-green-500"
                                                : "bg-purple-500 hover:bg-purple-600"
                                            }
                                          >
                                            {task.status === "completed"
                                              ? "Done"
                                              : "Complete"}
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditSubject(subject)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          setDeleteSubjectId(subject.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-center text-muted-foreground">
                            No subjects in this semester.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              }
            )}
          </Tabs>
        )}

        {/* Add Subject Dialog */}
        <Dialog
          open={!!newSubject || subjectSemester !== "1"}
          onOpenChange={() => {
            setNewSubject("");
            setSubjectSemester("1");
            setSubjectCredits("3");
          }}
        >
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add Subject</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Subject Name
                  </label>
                  <Input
                    placeholder="e.g., Algorithms"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Credits
                  </label>
                  <Select
                    value={subjectCredits}
                    onValueChange={setSubjectCredits}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Credits" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((credit) => (
                        <SelectItem key={credit} value={credit.toString()}>
                          {credit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Semester
                  </label>
                  <Select
                    value={subjectSemester}
                    onValueChange={setSubjectSemester}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewSubject("");
                  setSubjectSemester("1");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubject}
                disabled={addSubjectMutation.isPending}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {addSubjectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Subject Dialog */}
        {editSubject && (
          <Dialog
            open={!!editSubject}
            onOpenChange={() => setEditSubject(null)}
          >
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Subject Name
                    </label>
                    <Input
                      value={editSubject.name}
                      onChange={(e) =>
                        setEditSubject({ ...editSubject, name: e.target.value })
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Credits
                    </label>
                    <Select
                      value={editSubject.credits.toString()}
                      onValueChange={(val) =>
                        setEditSubject({
                          ...editSubject,
                          credits: parseInt(val),
                        })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Credits" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((credit) => (
                          <SelectItem key={credit} value={credit.toString()}>
                            {credit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Semester
                    </label>
                    <Select
                      value={editSubject.semester.toString()}
                      onValueChange={(val) =>
                        setEditSubject({
                          ...editSubject,
                          semester: parseInt(val),
                        })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditSubject(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSubject}
                  disabled={updateSubjectMutation.isPending}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {updateSubjectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Subject Dialog */}
        {deleteSubjectId && (
          <Dialog
            open={!!deleteSubjectId}
            onOpenChange={() => setDeleteSubjectId(null)}
          >
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Delete Subject</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this subject? This will remove
                  all associated tasks and content.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteSubjectId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubject}
                  disabled={deleteSubjectMutation.isPending}
                >
                  {deleteSubjectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default SubjectsPage;
