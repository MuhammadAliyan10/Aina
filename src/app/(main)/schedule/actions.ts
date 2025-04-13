"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation Schemas
const DegreeSchema = z.object({
  degreeName: z.string().min(1, "Degree name is required"),
  currentSemester: z.number().min(1).max(8, "Semester must be 1-8"),
  semesterDuration: z
    .number()
    .min(4, "Duration must be at least 4 weeks")
    .max(26, "Duration cannot exceed 26 weeks")
    .optional(),
});

const PreviousSemesterSchema = z.object({
  gpa: z.number().min(0).max(4, "GPA must be between 0 and 4").optional(),
  skills: z.array(z.string()).optional(),
});

const SubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  credits: z.number().min(1).max(6, "Credits must be between 1 and 6"),
});

const RoutineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  schedule: z.string().min(1, "Schedule is required"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
});

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["study", "project", "revision"]).optional(),
  points: z.number().min(1, "Points must be at least 1").default(10),
});

// Fetch Schedule Data
export async function fetchScheduleData(userId: string) {
  if (!userId) throw new Error("User ID is required");

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        degree: {
          include: {
            progress: true,
            subjects: {
              include: { recommendedContent: true, tasks: true },
            },
            previousSemesters: true,
          },
        },
        studyRoutines: true,
        activity: {
          where: { entityType: "schedule" },
          take: 5,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!user) throw new Error("User not found");

    return {
      degree: user.degree
        ? {
            id: user.degree.id,
            name: user.degree.name,
            totalSemesters: user.degree.totalSemesters,
            currentSemester: user.degree.currentSemester,
            semesterDuration: user.degree.semesterDuration,
            status: user.degree.status,
            subjects: user.degree.subjects.map((s) => ({
              id: s.id,
              name: s.name,
              semester: s.semester,
              credits: s.credits,
              progress: s.progress,
              recommendedContent: s.recommendedContent.map((c) => ({
                id: c.id,
                type: c.type as "video" | "link" | "document" | "routine",
                category: c.category,
                title: c.title,
                url: c.url,
                description: c.description,
                tags: c.tags,
                completed: c.completed,
                premium: c.premium,
              })),
              tasks: s.tasks.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
                points: t.points,
                category: t.category,
                dueDate: t.dueDate?.toISOString(),
              })),
            })),
            progress: user.degree.progress || {
              totalPoints: 8000,
              earnedPoints: 0,
              completionPercentage: 0,
            },
            previousSemesters: user.degree.previousSemesters.map((ps) => ({
              id: ps.id,
              semester: ps.semester,
              gpa: ps.gpa,
              skills: ps.skills,
            })),
          }
        : null,
      studyRoutines: user.studyRoutines.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        schedule: r.schedule,
        frequency: r.frequency,
      })),
      recentActivity: user.activity.map((log) => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    throw new Error("Failed to fetch schedule data");
  }
}

// Save Degree Details
export async function saveDegreeDetails(
  userId: string,
  degreeName: string,
  currentSemester: number,
  semesterDuration?: number
) {
  if (!userId) throw new Error("User ID is required");

  try {
    const validated = DegreeSchema.parse({
      degreeName,
      currentSemester,
      semesterDuration,
    });

    const degree = await prisma.degree.upsert({
      where: { userId },
      create: {
        userId,
        name: validated.degreeName,
        totalSemesters: 8,
        currentSemester: validated.currentSemester,
        semesterDuration: validated.semesterDuration,
        status: "active",
        progress: {
          create: {
            totalPoints: 8000,
            earnedPoints: 0,
            completionPercentage: 0,
          },
        },
      },
      update: {
        name: validated.degreeName,
        currentSemester: validated.currentSemester,
        semesterDuration: validated.semesterDuration,
        status: "active",
      },
      include: { progress: true, previousSemesters: true },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Set degree to ${validated.degreeName}, semester ${validated.currentSemester}`,
        entityType: "schedule",
        entityId: degree.id,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId,
        degreeId: degree.id,
        eventType: "degree_setup",
        eventData: {
          degreeName: validated.degreeName,
          currentSemester,
          semesterDuration,
        },
        timestamp: new Date(),
      },
    });

    // Add default subjects for known degrees
    if (degreeName.toLowerCase().includes("computer science")) {
      const defaultSubjects = [
        { name: "Data Structures", credits: 3 },
        { name: "Algorithms", credits: 3 },
      ];

      for (const subj of defaultSubjects) {
        await prisma.subject.upsert({
          where: {
            userId_degreeId_name_semester: {
              userId,
              degreeId: degree.id,
              name: subj.name,
              semester: currentSemester,
            },
          },
          create: {
            userId,
            degreeId: degree.id,
            name: subj.name,
            semester: currentSemester,
            credits: subj.credits,
            progress: 0,
            recommendedContent: {
              create: [
                {
                  userId,
                  type: "video",
                  category: "lecture",
                  title: `Intro to ${subj.name}`,
                  url: `https://example.com/${subj.name.toLowerCase()}`,
                  description: `Learn the basics of ${subj.name}.`,
                  tags: [subj.name.toLowerCase(), "beginner"],
                  completed: false,
                  premium: false,
                },
              ],
            },
          },
          update: {},
        });
      }
    }

    return degree;
  } catch (error) {
    console.error("Error saving degree:", error);
    throw new Error("Failed to save degree details");
  }
}

// Update Degree Details
export async function updateDegreeDetails(
  userId: string,
  degreeId: string,
  degreeName: string,
  currentSemester: number,
  semesterDuration?: number
) {
  try {
    const validated = DegreeSchema.parse({
      degreeName,
      currentSemester,
      semesterDuration,
    });

    const degree = await prisma.degree.update({
      where: { id: degreeId, userId },
      data: {
        name: validated.degreeName,
        currentSemester: validated.currentSemester,
        semesterDuration: validated.semesterDuration,
      },
      include: { progress: true },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Updated degree to ${validated.degreeName}, semester ${validated.currentSemester}`,
        entityType: "schedule",
        entityId: degreeId,
      },
    });

    return degree;
  } catch (error) {
    console.error("Error updating degree:", error);
    throw new Error("Failed to update degree details");
  }
}

// Delete Degree
export async function deleteDegree(userId: string, degreeId: string) {
  try {
    await prisma.degree.delete({
      where: { id: degreeId, userId },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: "Deleted degree",
        entityType: "schedule",
        entityId: degreeId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting degree:", error);
    throw new Error("Failed to delete degree");
  }
}

// Save Previous Semester
export async function savePreviousSemester(
  userId: string,
  degreeId: string,
  semester: number,
  gpa?: number,
  skills: string[] = []
) {
  try {
    const validated = PreviousSemesterSchema.parse({ gpa, skills });

    const prevSemester = await prisma.previousSemester.upsert({
      where: {
        degreeId_semester: { degreeId, semester },
      },
      create: {
        degreeId,
        semester,
        gpa: validated.gpa,
        skills: validated.skills ?? [],
      },
      update: {
        gpa: validated.gpa,
        skills: validated.skills ?? [],
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Saved semester ${semester} data (GPA: ${gpa ?? "N/A"})`,
        entityType: "schedule",
        entityId: degreeId,
      },
    });

    return prevSemester;
  } catch (error) {
    console.error("Error saving previous semester:", error);
    throw new Error("Failed to save previous semester data");
  }
}

// Recommend Resources
export async function recommendResources(
  userId: string,
  degreeId: string,
  subjectId: string,
  gpa?: number,
  skills: string[] = []
) {
  try {
    const recommendations = [];
    const degree = await prisma.degree.findUnique({ where: { id: degreeId } });
    const isLowGpa = gpa !== undefined && gpa < 2.5;
    const hasFewSkills = skills.length < 3;

    if (isLowGpa || hasFewSkills) {
      recommendations.push({
        type: "video",
        category: "tutorial",
        title: `Strengthen ${degree?.name ?? "Your"} Fundamentals`,
        url: "https://example.com/fundamentals",
        description: "Boost your core skills with this tutorial.",
        tags: ["fundamentals", "beginner"],
        premium: false,
      });

      if (degree?.name.toLowerCase().includes("computer science")) {
        recommendations.push({
          type: "document",
          category: "notes",
          title: "Programming Basics",
          url: "https://example.com/programming-notes",
          description: "Review key programming concepts.",
          tags: ["programming", "reference"],
          premium: true,
        });
      }
    }

    for (const rec of recommendations) {
      await prisma.recommendedContent.upsert({
        where: {
          userId_subjectId_title: {
            userId,
            subjectId,
            title: rec.title,
          },
        },
        create: {
          userId,
          subjectId,
          type: rec.type,
          category: rec.category,
          title: rec.title,
          url: rec.url,
          description: rec.description,
          tags: rec.tags,
          completed: false,
          premium: rec.premium,
        },
        update: {},
      });
    }

    return recommendations;
  } catch (error) {
    console.error("Error recommending resources:", error);
    throw new Error("Failed to recommend resources");
  }
}

// Add Subject
export async function addSubject(
  userId: string,
  degreeId: string,
  name: string,
  semester: number,
  credits: number
) {
  try {
    const validated = SubjectSchema.parse({ name, credits });

    const subject = await prisma.subject.create({
      data: {
        userId,
        degreeId,
        name: validated.name,
        semester,
        credits: validated.credits,
        progress: 0,
        recommendedContent: {
          create: [
            {
              userId,
              type: "video",
              category: "tutorial",
              title: `Intro to ${validated.name}`,
              url: `https://example.com/${validated.name.toLowerCase()}`,
              description: `Learn the basics of ${validated.name}.`,
              tags: [validated.name.toLowerCase(), "beginner"],
              completed: false,
              premium: false,
            },
          ],
        },
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Added subject ${validated.name} for semester ${semester}`,
        entityType: "schedule",
        entityId: subject.id,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId,
        subjectId: subject.id,
        eventType: "subject_added",
        eventData: { subjectName: validated.name, semester, credits },
        timestamp: new Date(),
      },
    });

    // Create a task for the subject
    await prisma.task.create({
      data: {
        userId,
        title: `Complete ${validated.name} coursework`,
        description: `Start studying ${validated.name} for semester ${semester}.`,
        status: "pending",
        priority: "medium",
        points: 10,
        category: "study",
        subjectId: subject.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Update degree progress
    const subjects = await prisma.subject.findMany({
      where: { degreeId, semester },
    });
    const totalProgress =
      subjects.reduce((sum, s) => sum + s.progress, 0) / (subjects.length || 1);
    await prisma.degreeProgress.update({
      where: { degreeId },
      data: {
        earnedPoints: { increment: validated.credits * 50 },
        completionPercentage: Math.min(totalProgress, 100),
        lastUpdated: new Date(),
      },
    });

    return subject;
  } catch (error) {
    console.error("Error adding subject:", error);
    throw new Error("Failed to add subject");
  }
}

// Mark Content Completed
export async function markContentCompleted(
  userId: string,
  subjectId: string,
  contentId: string
) {
  try {
    const content = await prisma.recommendedContent.update({
      where: { id: contentId, subjectId, userId },
      data: { completed: true },
    });

    const subject = await prisma.subject.update({
      where: { id: subjectId, userId },
      data: { progress: { increment: 10 } },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Completed content "${content.title}" for ${subject.name}`,
        entityType: "schedule",
        entityId: content.id,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId,
        subjectId,
        recommendedContentId: content.id,
        eventType: "content_completed",
        eventData: { subjectId, contentId, contentTitle: content.title },
        timestamp: new Date(),
      },
    });

    // Update degree progress
    const degree = await prisma.degree.findFirst({
      where: { id: subject.degreeId },
    });
    if (degree) {
      const subjects = await prisma.subject.findMany({
        where: { degreeId: degree.id, semester: degree.currentSemester },
      });
      const totalProgress =
        subjects.reduce((sum, s) => sum + s.progress, 0) /
        (subjects.length || 1);
      await prisma.degreeProgress.update({
        where: { degreeId: degree.id },
        data: {
          earnedPoints: { increment: content.premium ? 150 : 100 },
          completionPercentage: Math.min(totalProgress, 100),
          lastUpdated: new Date(),
        },
      });
    }

    return content;
  } catch (error) {
    console.error("Error marking content completed:", error);
    throw new Error("Failed to mark content as completed");
  }
}

// Add Study Routine
export async function addStudyRoutine(
  userId: string,
  title: string,
  description: string,
  schedule: string,
  frequency: string
) {
  try {
    const validated = RoutineSchema.parse({ title, schedule, frequency });

    const routine = await prisma.studyRoutine.create({
      data: {
        userId,
        title: validated.title,
        description,
        schedule: validated.schedule,
        frequency: validated.frequency,
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Added study routine "${validated.title}"`,
        entityType: "schedule",
        entityId: routine.id,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType: "routine_added",
        eventData: { title: validated.title, schedule, frequency },
        timestamp: new Date(),
      },
    });

    return routine;
  } catch (error) {
    console.error("Error adding study routine:", error);
    throw new Error("Failed to add study routine");
  }
}

// Create Daily Task
export async function createDailyTask(
  userId: string,
  subjectId: string,
  title: string,
  description?: string,
  category?: "study" | "project" | "revision"
) {
  try {
    const validated = TaskSchema.parse({ title, description, category });

    const task = await prisma.task.create({
      data: {
        userId,
        subjectId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        points: validated.points,
        status: "pending",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: `Created task "${validated.title}"`,
        entityType: "schedule",
        entityId: task.id,
      },
    });

    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

// Complete Task
export async function completeTask(userId: string, taskId: string) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId, userId },
      data: { status: "completed" },
      include: { subject: true },
    });

    if (task.subject?.degreeId) {
      await prisma.degreeProgress.update({
        where: { degreeId: task.subject.degreeId },
        data: {
          earnedPoints: { increment: task.points },
          completionPercentage: {
            increment: 0.5,
          },
        },
      });
    }

    await prisma.activity.create({
      data: {
        userId,
        action: `Completed task "${task.title}" (+${task.points} points)`,
        entityType: "schedule",
        entityId: taskId,
      },
    });

    return task;
  } catch (error) {
    console.error("Error completing task:", error);
    throw new Error("Failed to complete task");
  }
}
