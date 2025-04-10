export interface DashboardData {
  team: {
    totalMembers: number;
    activeMembers: number;
    members: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      status: "active" | "pending" | "inactive";
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
      assignedTo: string;
    }[];
  };
  activity: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
  }[];
  stats: {
    avgTaskCompletionTime: number; // in hours
    teamWorkload: number; // percentage
  };
}
