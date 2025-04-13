"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Link2,
  PlayCircle,
  Plus,
  User,
  Zap,
  Loader2,
  Award,
  Trash2,
  Edit,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchScheduleData,
  saveDegreeDetails,
  updateDegreeDetails,
  deleteDegree,
  addSubject,
  markContentCompleted,
  addStudyRoutine,
  savePreviousSemester,
  recommendResources,
  createDailyTask,
  completeTask,
} from "./actions";

// TypeScript Interfaces
interface RecommendedContent {
  id: string;
  type: "video" | "link" | "document" | "routine";
  category?: string | null;
  title: string;
  url?: string | null;
  description: string;
  tags: string[];
  completed: boolean;
  premium: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  points: number;
  category?: string;
  dueDate?: string;
}

interface Subject {
  id: string;
  name: string;
  semester: number;
  credits: number;
  progress: number;
  recommendedContent: RecommendedContent[];
  tasks: Task[];
}

interface DegreeProgress {
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
}

interface PreviousSemester {
  id: string;
  semester: number;
  gpa?: number;
  skills: string[];
}

interface StudyRoutine {
  id: string;
  title: string;
  description: string;
  schedule: string;
  frequency: string;
}

interface ScheduleData {
  degree: {
    id: string;
    name: string | null;
    totalSemesters: number;
    currentSemester: number;
    semesterDuration?: number;
    status: string;
    subjects: Subject[];
    progress: DegreeProgress;
    previousSemesters: PreviousSemester[];
  } | null;
  studyRoutines: StudyRoutine[];
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
  }[];
}

const SchedulePage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [degreeName, setDegreeName] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [semesterDuration, setSemesterDuration] = useState("");
  const [prevGpa, setPrevGpa] = useState("");
  const [prevSkills, setPrevSkills] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [subjectCredits, setSubjectCredits] = useState("3");
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineSchedule, setNewRoutineSchedule] = useState("");
  const [newRoutineFrequency, setNewRoutineFrequency] = useState("daily");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [editDegree, setEditDegree] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch schedule data
  const { data, isLoading } = useQuery<ScheduleData>({
    queryKey: ["schedule", user?.id],
    queryFn: () => fetchScheduleData(user?.id ?? ""),
    enabled: !!user?.id,
  });

  // Mutations
  const saveDegreeMutation = useMutation({
    mutationFn: ({
      degreeName,
      currentSemester,
      semesterDuration,
    }: {
      degreeName: string;
      currentSemester: number;
      semesterDuration?: number;
    }) =>
      saveDegreeDetails(
        user?.id || "",
        degreeName,
        currentSemester,
        semesterDuration
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setDegreeName("");
      setCurrentSemester("");
      setSemesterDuration("");
      setPrevGpa("");
      setPrevSkills("");
      toast({ title: "Success", description: "Degree details saved" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to save degree details",
        variant: "destructive",
      }),
  });

  const updateDegreeMutation = useMutation({
    mutationFn: ({
      degreeName,
      currentSemester,
      semesterDuration,
    }: {
      degreeName: string;
      currentSemester: number;
      semesterDuration?: number;
    }) =>
      updateDegreeDetails(
        user?.id || "",
        data?.degree?.id || "",
        degreeName,
        currentSemester,
        semesterDuration
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setEditDegree(false);
      setDegreeName("");
      setCurrentSemester("");
      setSemesterDuration("");
      toast({ title: "Success", description: "Degree details updated" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to update degree details",
        variant: "destructive",
      }),
  });

  const deleteDegreeMutation = useMutation({
    mutationFn: () => deleteDegree(user?.id || "", data?.degree?.id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setDeleteDialogOpen(false);
      toast({ title: "Success", description: "Degree deleted" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to delete degree",
        variant: "destructive",
      }),
  });

  const savePrevSemesterMutation = useMutation({
    mutationFn: ({ gpa, skills }: { gpa?: number; skills: string[] }) =>
      savePreviousSemester(
        user?.id || "",
        data?.degree?.id || "",
        (data?.degree?.currentSemester || 1) - 1,
        gpa,
        skills
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setPrevGpa("");
      setPrevSkills("");
      toast({ title: "Success", description: "Previous semester data saved" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to save previous semester data",
        variant: "destructive",
      }),
  });

  const recommendResourcesMutation = useMutation({
    mutationFn: ({
      subjectId,
      gpa,
      skills,
    }: {
      subjectId: string;
      gpa?: number;
      skills: string[];
    }) =>
      recommendResources(
        user?.id || "",
        data?.degree?.id || "",
        subjectId,
        gpa,
        skills
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      toast({ title: "Success", description: "Resources recommended" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to recommend resources",
        variant: "destructive",
      }),
  });

  const addSubjectMutation = useMutation({
    mutationFn: ({ name, credits }: { name: string; credits: number }) =>
      addSubject(
        user?.id || "",
        data?.degree?.id || "",
        name,
        data?.degree?.currentSemester || 1,
        credits
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setNewSubject("");
      setSubjectCredits("3");
      toast({ title: "Success", description: "Subject added" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      }),
  });

  const markContentCompletedMutation = useMutation({
    mutationFn: ({
      subjectId,
      contentId,
    }: {
      subjectId: string;
      contentId: string;
    }) => markContentCompleted(user?.id || "", subjectId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      toast({ title: "Success", description: "Content marked as completed" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to mark content as completed",
        variant: "destructive",
      }),
  });

  const addRoutineMutation = useMutation({
    mutationFn: ({
      title,
      schedule,
      frequency,
    }: {
      title: string;
      schedule: string;
      frequency: string;
    }) =>
      addStudyRoutine(
        user?.id || "",
        title,
        "Personalized study plan",
        schedule,
        frequency
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setNewRoutineTitle("");
      setNewRoutineSchedule("");
      setNewRoutineFrequency("daily");
      toast({ title: "Success", description: "Study routine added" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to add routine",
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
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setNewTaskTitle("");
      setNewTaskCategory("");
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
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
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
  const handleSaveDegree = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in",
        variant: "destructive",
      });
      return;
    }
    if (!degreeName.trim() || !currentSemester || !semesterDuration) {
      toast({
        title: "Error",
        description: "Degree name, semester, and duration are required",
        variant: "destructive",
      });
      return;
    }
    const semesterNumber = parseInt(currentSemester, 10);
    const durationNumber = parseInt(semesterDuration, 10);
    if (
      isNaN(semesterNumber) ||
      isNaN(durationNumber) ||
      durationNumber < 4 ||
      durationNumber > 26
    ) {
      toast({
        title: "Error",
        description: "Invalid semester or duration (4-26 weeks)",
        variant: "destructive",
      });
      return;
    }
    saveDegreeMutation.mutate({
      degreeName,
      currentSemester: semesterNumber,
      semesterDuration: durationNumber,
    });
  };

  const handleUpdateDegree = () => {
    if (!user?.id || !data?.degree?.id) {
      toast({
        title: "Error",
        description: "Invalid session or degree",
        variant: "destructive",
      });
      return;
    }
    if (!degreeName.trim() || !currentSemester || !semesterDuration) {
      toast({
        title: "Error",
        description: "Degree name, semester, and duration are required",
        variant: "destructive",
      });
      return;
    }
    const semesterNumber = parseInt(currentSemester, 10);
    const durationNumber = parseInt(semesterDuration, 10);
    if (
      isNaN(semesterNumber) ||
      isNaN(durationNumber) ||
      durationNumber < 4 ||
      durationNumber > 26
    ) {
      toast({
        title: "Error",
        description: "Invalid semester or duration (4-26 weeks)",
        variant: "destructive",
      });
      return;
    }
    updateDegreeMutation.mutate({
      degreeName,
      currentSemester: semesterNumber,
      semesterDuration: durationNumber,
    });
  };

  const handleDeleteDegree = () => {
    if (!user?.id || !data?.degree?.id) {
      toast({
        title: "Error",
        description: "Invalid session or degree",
        variant: "destructive",
      });
      return;
    }
    deleteDegreeMutation.mutate();
  };

  const handleSavePrevSemester = () => {
    if (!user?.id || !data?.degree?.id) {
      toast({
        title: "Error",
        description: "Invalid session or degree",
        variant: "destructive",
      });
      return;
    }
    const gpaNumber = prevGpa ? parseFloat(prevGpa) : undefined;
    const skillsArray = prevSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (gpaNumber && (isNaN(gpaNumber) || gpaNumber < 0 || gpaNumber > 4)) {
      toast({
        title: "Error",
        description: "Invalid GPA (0-4)",
        variant: "destructive",
      });
      return;
    }
    savePrevSemesterMutation.mutate({ gpa: gpaNumber, skills: skillsArray });

    // Recommend resources for low GPA or few skills
    if ((gpaNumber && gpaNumber < 2.5) || skillsArray.length < 3) {
      data?.degree?.subjects.forEach((subject) => {
        recommendResourcesMutation.mutate({
          subjectId: subject.id,
          gpa: gpaNumber,
          skills: skillsArray,
        });
      });
    }
  };

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
    if (isNaN(creditsNumber) || creditsNumber < 1 || creditsNumber > 6) {
      toast({
        title: "Error",
        description: "Invalid credits (1-6)",
        variant: "destructive",
      });
      return;
    }
    addSubjectMutation.mutate({
      name: newSubject,
      credits: creditsNumber,
    });
  };

  const handleMarkCompleted = (subjectId: string, contentId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in",
        variant: "destructive",
      });
      return;
    }
    markContentCompletedMutation.mutate({ subjectId, contentId });
  };

  const handleAddRoutine = () => {
    if (!user?.id || !newRoutineTitle.trim() || !newRoutineSchedule.trim()) {
      toast({
        title: "Error",
        description: "Routine title and schedule required",
        variant: "destructive",
      });
      return;
    }
    addRoutineMutation.mutate({
      title: newRoutineTitle,
      schedule: newRoutineSchedule,
      frequency: newRoutineFrequency,
    });
  };

  const handleCreateTask = (subjectId: string) => {
    if (!user?.id || !newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title required",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate({
      subjectId,
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

  // Chart data for progress visualization
  const chartData = data?.degree
    ? Array.from({ length: data.degree.totalSemesters }, (_, i) => ({
        name: `Sem ${i + 1}`,
        progress:
          i + 1 <= (data?.degree?.currentSemester ?? 0)
            ? data?.degree?.progress.completionPercentage
            : 0,
      }))
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-gradient-to-r from-primary/10 to-muted/10 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-primary" />
              Study Schedule
            </h1>
            <p className="text-muted-foreground mt-2 text-md md:text-lg">
              Plan your degree, track progress, and master your subjects.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md"
            >
              <Link href="/schedule/resources">
                <FileText className="h-5 w-5 mr-2" />
                Explore Resources
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-primary border-primary/20 hover:bg-primary/10 rounded-lg"
            >
              <Link href="/calendar">
                <Calendar className="h-5 w-5 mr-2" />
                View Calendar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">
              Loading your schedule...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Degree Setup */}
            {!data?.degree?.name && (
              <Card className="bg-card border-border shadow-lg lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    Setup Your Degree
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Degree Name
                        </label>
                        <Input
                          placeholder="e.g., Computer Science"
                          value={degreeName}
                          onChange={(e) => setDegreeName(e.target.value)}
                          className="bg-input border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Current Semester
                        </label>
                        <Select
                          value={currentSemester}
                          onValueChange={setCurrentSemester}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Select semester" />
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
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Semester Duration (weeks)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 16"
                          value={semesterDuration}
                          onChange={(e) => setSemesterDuration(e.target.value)}
                          className="bg-input border-border"
                          min="4"
                          max="26"
                        />
                      </div>
                    </div>
                    {(parseInt(currentSemester) === 6 ||
                      parseInt(currentSemester) === 7) && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="text-lg font-semibold">
                          Previous Semester Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">
                              GPA (optional)
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 3.5"
                              value={prevGpa}
                              onChange={(e) => setPrevGpa(e.target.value)}
                              className="bg-input border-border"
                              step="0.1"
                              min="0"
                              max="4"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">
                              Skills (comma-separated, optional)
                            </label>
                            <Input
                              placeholder="e.g., JavaScript, Python, SQL"
                              value={prevSkills}
                              onChange={(e) => setPrevSkills(e.target.value)}
                              className="bg-input border-border"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleSavePrevSemester}
                          disabled={savePrevSemesterMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {savePrevSemesterMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Save Previous Semester
                        </Button>
                      </div>
                    )}
                    <Button
                      onClick={handleSaveDegree}
                      disabled={saveDegreeMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {saveDegreeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Save Degree
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Degree Overview */}
            {data?.degree?.name && (
              <Card className="bg-card border-border shadow-lg lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    {data.degree.name} Progress
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditDegree(true);
                        setDegreeName(data.degree.name || "");
                        setCurrentSemester(
                          data.degree.currentSemester.toString()
                        );
                        setSemesterDuration(
                          data.degree.semesterDuration?.toString() || ""
                        );
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your degree? This
                            will remove all related subjects, routines, and
                            tasks.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteDegree}
                            disabled={deleteDegreeMutation.isPending}
                          >
                            {deleteDegreeMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {editDegree ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Degree Name
                          </label>
                          <Input
                            placeholder="e.g., Computer Science"
                            value={degreeName}
                            onChange={(e) => setDegreeName(e.target.value)}
                            className="bg-input border-border"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Current Semester
                          </label>
                          <Select
                            value={currentSemester}
                            onValueChange={setCurrentSemester}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Select semester" />
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
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Semester Duration (weeks)
                          </label>
                          <Input
                            type="number"
                            placeholder="e.g., 16"
                            value={semesterDuration}
                            onChange={(e) =>
                              setSemesterDuration(e.target.value)
                            }
                            className="bg-input border-border"
                            min="4"
                            max="26"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateDegree}
                          disabled={updateDegreeMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {updateDegreeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditDegree(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-sm">
                            Total Points
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {data.degree.progress.totalPoints}
                          </p>
                          <Award className="h-5 w-5 text-primary mt-2" />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-sm">
                            Earned Points
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {data.degree.progress.earnedPoints}
                          </p>
                          <CheckCircle className="h-5 w-5 text-green-500 mt-2" />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-sm">
                            Completion
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={data.degree.progress.completionPercentage}
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-semibold">
                              {data.degree.progress.completionPercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <Clock className="h-5 w-5 text-primary mt-2" />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-sm">
                            Weeks Remaining
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {data.degree.semesterDuration
                              ? Math.max(
                                  data.degree.semesterDuration -
                                    Math.floor(
                                      (Date.now() -
                                        new Date(
                                          data.degree.createdAt
                                        ).getTime()) /
                                        (7 * 24 * 60 * 60 * 1000)
                                    ),
                                  0
                                )
                              : "N/A"}
                          </p>
                          <Clock className="h-5 w-5 text-primary mt-2" />
                        </div>
                      </div>
                      <div className="mt-6">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#4b4b4b"
                            />
                            <XAxis dataKey="name" stroke="#a0a0a0" />
                            <YAxis stroke="#a0a0a0" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f1f1f",
                                border: "none",
                              }}
                              labelStyle={{ color: "#ffffff" }}
                            />
                            <Bar dataKey="progress" fill="#2563eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous Semester Info */}
            {data?.degree?.previousSemesters?.length ? (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Previous Semester
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.degree.previousSemesters.map((ps) => (
                    <div key={ps.id} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">Semester {ps.semester}</p>
                      <p className="text-sm text-muted-foreground">
                        GPA: {ps.gpa?.toFixed(1) ?? "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Skills:{" "}
                        {ps.skills.length ? ps.skills.join(", ") : "None"}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {/* Subjects & Content */}
            {data?.degree?.name && (
              <Card className="bg-card border-border shadow-lg md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Subjects, Resources & Tasks
                  </CardTitle>
                  <Button
                    asChild
                    variant="outline"
                    className="text-primary border-primary/20"
                  >
                    <Link href="/schedule/subjects">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a new subject..."
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Select
                        value={subjectCredits}
                        onValueChange={setSubjectCredits}
                      >
                        <SelectTrigger className="w-24 bg-input border-border">
                          <SelectValue placeholder="Credits" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((credit) => (
                            <SelectItem key={credit} value={credit.toString()}>
                              {credit} Credits
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddSubject}
                        disabled={addSubjectMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {addSubjectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Resources & Tasks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.degree?.subjects
                          .filter(
                            (s) => s.semester === data?.degree?.currentSemester
                          )
                          .map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium truncate max-w-[200px]">
                                {subject.name}
                              </TableCell>
                              <TableCell>{subject.credits}</TableCell>
                              <TableCell>
                                <Progress
                                  value={subject.progress}
                                  className="h-2 w-24"
                                />
                                <span className="text-sm ml-2">
                                  {subject.progress.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-4">
                                  {/* Resources */}
                                  <div>
                                    <p className="text-sm font-semibold mb-2">
                                      Resources
                                    </p>
                                    {subject.recommendedContent.length ? (
                                      subject.recommendedContent
                                        .slice(0, 2)
                                        .map((content) => (
                                          <div
                                            key={content.id}
                                            className="flex items-center gap-2 mb-2"
                                          >
                                            {content.type === "video" && (
                                              <PlayCircle className="h-4 w-4 text-primary" />
                                            )}
                                            {content.type === "link" && (
                                              <Link2 className="h-4 w-4 text-primary" />
                                            )}
                                            {content.type === "document" && (
                                              <FileText className="h-4 w-4 text-primary" />
                                            )}
                                            {content.type === "routine" && (
                                              <Clock className="h-4 w-4 text-primary" />
                                            )}
                                            <div className="flex-1">
                                              {content.url ? (
                                                <a
                                                  href={content.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-primary truncate max-w-[150px]"
                                                >
                                                  {content.title}
                                                </a>
                                              ) : (
                                                <span className="text-sm truncate max-w-[150px]">
                                                  {content.title}
                                                </span>
                                              )}
                                              {content.premium &&
                                                user?.plan === "Free" && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="ml-2"
                                                  >
                                                    Premium
                                                  </Badge>
                                                )}
                                              {content.category && (
                                                <Badge
                                                  variant="outline"
                                                  className="ml-2 text-xs"
                                                >
                                                  {content.category}
                                                </Badge>
                                              )}
                                            </div>
                                            <Button
                                              size="sm"
                                              variant={
                                                content.completed
                                                  ? "outline"
                                                  : "default"
                                              }
                                              onClick={() =>
                                                handleMarkCompleted(
                                                  subject.id,
                                                  content.id
                                                )
                                              }
                                              disabled={
                                                content.completed ||
                                                (content.premium &&
                                                  user?.plan === "Free")
                                              }
                                              className={
                                                content.completed
                                                  ? "text-green-500 border-green-500"
                                                  : ""
                                              }
                                            >
                                              {content.completed
                                                ? "Done"
                                                : "Mark Done"}
                                            </Button>
                                          </div>
                                        ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No resources available.
                                      </p>
                                    )}
                                  </div>
                                  {/* Tasks */}
                                  <div>
                                    <p className="text-sm font-semibold mb-2">
                                      Daily Tasks
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Input
                                        placeholder="Add a task..."
                                        value={newTaskTitle}
                                        onChange={(e) =>
                                          setNewTaskTitle(e.target.value)
                                        }
                                        className="bg-input border-border"
                                      />
                                      <Select
                                        value={newTaskCategory}
                                        onValueChange={setNewTaskCategory}
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
                                        onClick={() =>
                                          handleCreateTask(subject.id)
                                        }
                                        disabled={createTaskMutation.isPending}
                                        className="bg-primary hover:bg-primary/90"
                                      >
                                        {createTaskMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    {subject.tasks.length ? (
                                      subject.tasks.map((task) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center gap-2 mb-2"
                                        >
                                          <CheckCircle
                                            className={`h-4 w-4 ${
                                              task.status === "completed"
                                                ? "text-green-500"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                          <div className="flex-1">
                                            <p className="text-sm">
                                              {task.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {task.category || "No category"} •{" "}
                                              {task.points} points
                                            </p>
                                          </div>
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
                                          >
                                            {task.status === "completed"
                                              ? "Done"
                                              : "Complete"}
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No tasks assigned.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Routines */}
            {data?.degree?.name && (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Study Routines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="Routine title..."
                        value={newRoutineTitle}
                        onChange={(e) => setNewRoutineTitle(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Input
                        placeholder="Schedule (e.g., 2 hours daily, 8-10 PM)"
                        value={newRoutineSchedule}
                        onChange={(e) => setNewRoutineSchedule(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Select
                        value={newRoutineFrequency}
                        onValueChange={setNewRoutineFrequency}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddRoutine}
                        disabled={addRoutineMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {addRoutineMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Routine
                      </Button>
                    </div>
                    {data?.studyRoutines.length ? (
                      data.studyRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          className="p-4 bg-muted/50 rounded-lg"
                        >
                          <p className="font-medium">{routine.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {routine.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Schedule: {routine.schedule}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Frequency: {routine.frequency}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center">
                        No study routines yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {data?.degree?.name && (
              <Card className="bg-card border-border shadow-lg lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.recentActivity.length ? (
                      data.recentActivity.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 p-3 border-b last:border-b-0"
                        >
                          <Zap className="h-5 w-5 text-muted-foreground" />
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
                        <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                        No recent activity.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SchedulePage;
