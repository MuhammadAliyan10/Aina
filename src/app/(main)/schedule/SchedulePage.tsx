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
  Download,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
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
  deleteSubject,
  updateSubject,
  deleteStudyRoutine,
} from "./actions";
import { format, addDays } from "date-fns";

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
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineSchedule, setNewRoutineSchedule] = useState("");
  const [newRoutineFrequency, setNewRoutineFrequency] = useState("daily");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
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

  const updateSubjectMutation = useMutation({
    mutationFn: ({
      id,
      name,
      credits,
    }: {
      id: string;
      name: string;
      credits: number;
    }) =>
      updateSubject(
        user?.id || "",
        id,
        name,
        credits,
        data?.degree?.currentSemester || 1
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
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

  const deleteRoutineMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      deleteStudyRoutine(user?.id || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setDeleteRoutineId(null);
      toast({ title: "Success", description: "Study routine deleted" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to delete routine",
        variant: "destructive",
      }),
  });

  const createTaskMutation = useMutation({
    mutationFn: ({
      subjectId,
      title,
      category,
      dueDate,
    }: {
      subjectId: string;
      title: string;
      category?: string;
      dueDate?: string;
    }) => createDailyTask(user?.id || "", subjectId, title, dueDate, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      setNewTaskTitle("");
      setNewTaskCategory("");
      setNewTaskDueDate("");
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
    if (isNaN(creditsNumber) || creditsNumber < 1 || creditsNumber > 6) {
      toast({
        title: "Error",
        description: "Invalid credits (1-6)",
        variant: "destructive",
      });
      return;
    }
    updateSubjectMutation.mutate({
      id: editSubject.id,
      name: editSubject.name,
      credits: creditsNumber,
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

  const handleDeleteRoutine = () => {
    if (!user?.id || !deleteRoutineId) {
      toast({
        title: "Error",
        description: "Invalid routine",
        variant: "destructive",
      });
      return;
    }
    deleteRoutineMutation.mutate({ id: deleteRoutineId });
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
      dueDate: newTaskDueDate || undefined,
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

  const handleExportProgress = () => {
    if (!data?.degree) return;
    const csvContent = [
      [
        "Subject",
        "Credits",
        "Progress (%)",
        "Tasks Completed",
        "Resources Completed",
      ],
      ...data.degree.subjects.map((subject) => [
        subject.name,
        subject.credits,
        subject.progress.toFixed(1),
        subject.tasks.filter((t) => t.status === "completed").length,
        subject.recommendedContent.filter((c) => c.completed).length,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "degree_progress.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "Success", description: "Progress exported as CSV" });
  };

  // Chart data for progress visualization
  const chartData = data?.degree
    ? Array.from({ length: data.degree.totalSemesters }, (_, i) => {
        const semester = i + 1;
        const subjects = data.degree.subjects.filter(
          (s) => s.semester <= semester
        );
        const avgProgress = subjects.length
          ? subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length
          : 0;
        return {
          name: `Sem ${semester}`,
          progress: semester <= data.degree.currentSemester ? avgProgress : 0,
        };
      })
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-foreground">
      <header className="bg-indigo-500/10 py-12 px-8 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-indigo-400" />
              Study Dashboard
            </h1>
            <p className="text-gray-300 mt-2 text-md md:text-lg">
              Your personalized hub for academic success.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-transform hover:scale-105"
            >
              <Link href="/schedule/resources">
                <FileText className="h-5 w-5 mr-2" />
                Resources
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10 rounded-lg transition-transform hover:scale-105"
            >
              <Link href="/schedule/subjects">
                <BookOpen className="h-5 w-5 mr-2" />
                Subjects
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10 rounded-lg transition-transform hover:scale-105"
            >
              <Link href="/calendar">
                <Calendar className="h-5 w-5 mr-2" />
                Calendar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
            <p className="ml-4 text-lg text-gray-300">
              Loading your dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Degree Setup */}
            {!data?.degree?.name && (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="h-6 w-6 text-indigo-400" />
                    Start Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-300">
                          Degree Name
                        </label>
                        <Input
                          placeholder="e.g., Computer Science"
                          value={degreeName}
                          onChange={(e) => setDegreeName(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">
                          Current Semester
                        </label>
                        <Select
                          value={currentSemester}
                          onValueChange={setCurrentSemester}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">
                          Semester Duration (weeks)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 16"
                          value={semesterDuration}
                          onChange={(e) => setSemesterDuration(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                          min="4"
                          max="26"
                        />
                      </div>
                    </div>
                    {parseInt(currentSemester) >= 2 && (
                      <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">
                          Reflect on Past Semesters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-300">
                              GPA (optional)
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 3.5"
                              value={prevGpa}
                              onChange={(e) => setPrevGpa(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                              step="0.1"
                              min="0"
                              max="4"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-300">
                              Skills (comma-separated)
                            </label>
                            <Input
                              placeholder="e.g., JavaScript, Python, SQL"
                              value={prevSkills}
                              onChange={(e) => setPrevSkills(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleSavePrevSemester}
                          disabled={savePrevSemesterMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105"
                        >
                          {savePrevSemesterMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Save Past Semester
                        </Button>
                      </div>
                    )}
                    <Button
                      onClick={handleSaveDegree}
                      disabled={saveDegreeMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105"
                    >
                      {saveDegreeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Launch Degree
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Degree Overview */}
            {data?.degree?.name && (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award className="h-6 w-6 text-indigo-400" />
                    {data.degree.name} Overview
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
                      className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportProgress}
                      className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
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
                      <DialogContent className="bg-gray-800 border-indigo-500/20 text-white">
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Are you sure you want to delete your degree? This
                            will remove all related subjects, routines, and
                            tasks.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-indigo-400 border-indigo-400/30"
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-300">
                            Degree Name
                          </label>
                          <Input
                            placeholder="e.g., Computer Science"
                            value={degreeName}
                            onChange={(e) => setDegreeName(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">
                            Current Semester
                          </label>
                          <Select
                            value={currentSemester}
                            onValueChange={setCurrentSemester}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <SelectItem key={sem} value={sem.toString()}>
                                  Semester {sem}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">
                            Semester Duration (weeks)
                          </label>
                          <Input
                            type="number"
                            placeholder="e.g., 16"
                            value={semesterDuration}
                            onChange={(e) =>
                              setSemesterDuration(e.target.value)
                            }
                            className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                            min="4"
                            max="26"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateDegree}
                          disabled={updateDegreeMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105"
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
                          className="text-indigo-400 border-indigo-400/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-300 text-sm">Total Points</p>
                          <p className="text-2xl font-semibold text-white">
                            {data.degree.progress.totalPoints}
                          </p>
                          <Award className="h-5 w-5 text-indigo-400 mt-2" />
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-300 text-sm">Earned Points</p>
                          <p className="text-2xl font-semibold text-white">
                            {data.degree.progress.earnedPoints}
                          </p>
                          <CheckCircle className="h-5 w-5 text-green-400 mt-2" />
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-300 text-sm">Completion</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={data.degree.progress.completionPercentage}
                              className="h-2 flex-1 bg-gray-600"
                            />
                            <span className="text-sm font-semibold text-white">
                              {data.degree.progress.completionPercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <Clock className="h-5 w-5 text-indigo-400 mt-2" />
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-300 text-sm">Weeks Left</p>
                          <p className="text-2xl font-semibold text-white">
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
                          <Clock className="h-5 w-5 text-indigo-400 mt-2" />
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
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
                              color: "#ffffff",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="progress"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ fill: "#6366f1", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous Semester Info */}
            {data?.degree?.previousSemesters?.length ? (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-400" />
                    Past Semesters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.degree.previousSemesters.map((ps) => (
                      <div
                        key={ps.id}
                        className="p-4 bg-gray-700/50 rounded-lg"
                      >
                        <p className="font-medium text-white">
                          Semester {ps.semester}
                        </p>
                        <p className="text-sm text-gray-300">
                          GPA: {ps.gpa?.toFixed(1) ?? "N/A"}
                        </p>
                        <p className="text-sm text-gray-300">
                          Skills:{" "}
                          {ps.skills.length ? ps.skills.join(", ") : "None"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Subjects & Content */}
            {data?.degree?.name && (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-400" />
                    Your Subjects
                  </CardTitle>
                  <Button
                    asChild
                    variant="outline"
                    className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10"
                  >
                    <Link href="/schedule/subjects">Manage Subjects</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a new subject..."
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                      />
                      <Select
                        value={subjectCredits}
                        onValueChange={setSubjectCredits}
                      >
                        <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                          <SelectValue placeholder="Credits" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105"
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
                        <TableRow className="border-gray-600">
                          <TableHead className="text-gray-300">
                            Subject
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Credits
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Progress
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Actions
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Tasks & Resources
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.degree?.subjects
                          .filter(
                            (s) => s.semester === data?.degree?.currentSemester
                          )
                          .map((subject) => (
                            <TableRow
                              key={subject.id}
                              className="border-gray-600"
                            >
                              <TableCell className="font-medium text-white truncate max-w-[200px]">
                                {subject.name}
                              </TableCell>
                              <TableCell className="text-white">
                                {subject.credits}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={subject.progress}
                                    className="h-2 w-24 bg-gray-600"
                                  />
                                  <span className="text-sm text-white">
                                    {subject.progress.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setEditSubject({
                                        ...subject,
                                        name: subject.name,
                                        credits: subject.credits,
                                      })
                                    }
                                    className="text-indigo-400 border-indigo-400/30"
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
                              <TableCell>
                                <div className="space-y-4">
                                  {/* Resources */}
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-2">
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
                                              <PlayCircle className="h-4 w-4 text-indigo-400" />
                                            )}
                                            {content.type === "link" && (
                                              <Link2 className="h-4 w-4 text-indigo-400" />
                                            )}
                                            {content.type === "document" && (
                                              <FileText className="h-4 w-4 text-indigo-400" />
                                            )}
                                            {content.type === "routine" && (
                                              <Clock className="h-4 w-4 text-indigo-400" />
                                            )}
                                            <div className="flex-1">
                                              {content.url ? (
                                                <a
                                                  href={content.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-indigo-400 hover:underline truncate max-w-[150px]"
                                                >
                                                  {content.title}
                                                </a>
                                              ) : (
                                                <span className="text-sm text-white truncate max-w-[150px]">
                                                  {content.title}
                                                </span>
                                              )}
                                              {content.premium &&
                                                user?.plan === "Free" && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="ml-2 bg-indigo-400/20 text-indigo-400"
                                                  >
                                                    Premium
                                                  </Badge>
                                                )}
                                              {content.category && (
                                                <Badge
                                                  variant="outline"
                                                  className="ml-2 text-xs text-gray-300 border-gray-600"
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
                                                  ? "text-green-400 border-green-400/30"
                                                  : "bg-indigo-600 hover:bg-indigo-700"
                                              }
                                            >
                                              {content.completed
                                                ? "Done"
                                                : "Mark Done"}
                                            </Button>
                                          </div>
                                        ))
                                    ) : (
                                      <p className="text-sm text-gray-300">
                                        No resources available.
                                      </p>
                                    )}
                                  </div>
                                  {/* Tasks */}
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-2">
                                      Tasks
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Input
                                        placeholder="Add a task..."
                                        value={newTaskTitle}
                                        onChange={(e) =>
                                          setNewTaskTitle(e.target.value)
                                        }
                                        className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                                      />
                                      <Select
                                        value={newTaskCategory}
                                        onValueChange={setNewTaskCategory}
                                      >
                                        <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                                          <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
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
                                      <Input
                                        type="date"
                                        value={newTaskDueDate}
                                        onChange={(e) =>
                                          setNewTaskDueDate(e.target.value)
                                        }
                                        className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        max={format(
                                          addDays(new Date(), 30),
                                          "yyyy-MM-dd"
                                        )}
                                      />
                                      <Button
                                        onClick={() =>
                                          handleCreateTask(subject.id)
                                        }
                                        disabled={createTaskMutation.isPending}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                                                ? "text-green-400"
                                                : "text-gray-500"
                                            }`}
                                          />
                                          <div className="flex-1">
                                            <p className="text-sm text-white">
                                              {task.title}
                                            </p>
                                            <p className="text-xs text-gray-300">
                                              {task.category || "No category"} •{" "}
                                              {task.points} points
                                              {task.dueDate &&
                                                ` • Due: ${format(
                                                  new Date(task.dueDate),
                                                  "MMM d"
                                                )}`}
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
                                            className={
                                              task.status === "completed"
                                                ? "text-green-400 border-green-400/30"
                                                : "bg-indigo-600 hover:bg-indigo-700"
                                            }
                                          >
                                            {task.status === "completed"
                                              ? "Done"
                                              : "Complete"}
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-300">
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

            {/* Edit Subject Dialog */}
            {editSubject && (
              <Dialog
                open={!!editSubject}
                onOpenChange={() => setEditSubject(null)}
              >
                <DialogContent className="bg-gray-800 border-indigo-500/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Edit Subject</DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300">
                        Subject Name
                      </label>
                      <Input
                        value={editSubject.name}
                        onChange={(e) =>
                          setEditSubject({
                            ...editSubject,
                            name: e.target.value,
                          })
                        }
                        className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-300">Credits</label>
                      <Select
                        value={editSubject.credits.toString()}
                        onValueChange={(val) =>
                          setEditSubject({
                            ...editSubject,
                            credits: parseInt(val),
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                          <SelectValue placeholder="Credits" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                          {[1, 2, 3, 4, 5, 6].map((credit) => (
                            <SelectItem key={credit} value={credit.toString()}>
                              {credit} Credits
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditSubject(null)}
                      className="text-indigo-400 border-indigo-400/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSubject}
                      disabled={updateSubjectMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                <DialogContent className="bg-gray-800 border-indigo-500/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete Subject</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Are you sure you want to delete this subject? This will
                      remove all associated tasks and content.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteSubjectId(null)}
                      className="text-indigo-400 border-indigo-400/30"
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

            {/* Study Routines */}
            {data?.degree?.name && (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-6 w-6 text-indigo-400" />
                    Study Routines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Input
                          placeholder="Routine title..."
                          value={newRoutineTitle}
                          onChange={(e) => setNewRoutineTitle(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Schedule (e.g., 8-10 PM)"
                          value={newRoutineSchedule}
                          onChange={(e) =>
                            setNewRoutineSchedule(e.target.value)
                          }
                          className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={newRoutineFrequency}
                          onValueChange={setNewRoutineFrequency}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-indigo-400">
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleAddRoutine}
                          disabled={addRoutineMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105"
                        >
                          {addRoutineMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Add
                        </Button>
                      </div>
                    </div>
                    {data?.studyRoutines.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.studyRoutines.map((routine) => (
                          <div
                            key={routine.id}
                            className="p-4 bg-gray-700/50 rounded-lg relative group"
                          >
                            <p className="font-medium text-white">
                              {routine.title}
                            </p>
                            <p className="text-sm text-gray-300">
                              {routine.description}
                            </p>
                            <p className="text-sm text-gray-300">
                              Schedule: {routine.schedule}
                            </p>
                            <p className="text-sm text-gray-300">
                              Frequency: {routine.frequency}
                            </p>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setDeleteRoutineId(routine.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-300 text-center">
                        No study routines yet. Add one to stay organized!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete Routine Dialog */}
            {deleteRoutineId && (
              <Dialog
                open={!!deleteRoutineId}
                onOpenChange={() => setDeleteRoutineId(null)}
              >
                <DialogContent className="bg-gray-800 border-indigo-500/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete Routine</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Are you sure you want to delete this study routine?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteRoutineId(null)}
                      className="text-indigo-400 border-indigo-400/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteRoutine}
                      disabled={deleteRoutineMutation.isPending}
                    >
                      {deleteRoutineMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Recent Activity */}
            {data?.degree?.name && (
              <Card className="bg-gray-800/80 border-indigo-500/20 shadow-xl backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="h-6 w-6 text-indigo-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.recentActivity.length ? (
                      data.recentActivity.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 p-3 border-b border-gray-600 last:border-b-0"
                        >
                          <Zap className="h-5 w-5 text-indigo-400" />
                          <div>
                            <p className="text-white">{log.action}</p>
                            <p className="text-sm text-gray-300">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-300">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-indigo-400" />
                        No recent activity. Get started by adding a subject or
                        task!
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
