export interface AppInsightsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    recentLogins: number;
  };
  tasks: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    avgCompletionTime: string;
  };
  automations: {
    totalAutomations: number;
    activeAutomations: number;
    avgSuccessRate: string;
    recentExecutions: {
      id: string;
      executedAt: string;
      success: boolean;
      result: string;
    }[];
  };
  workflows: {
    totalWorkflows: number;
    activeWorkflows: number;
  };
  integrations: {
    connectedIntegrations: number;
    recentIntegrations: { name: string; connectedAt: string; status: string }[];
  };
  documents: {
    totalDocuments: number;
    recentDocument: { title: string; updatedAt: string } | null;
  };
  events: {
    totalEvents: number;
    upcomingEvents: number;
  };
  activity: {
    action: string;
    entityType: string | null;
    entityId: string | null;
    timestamp: string;
  }[];
  systemHealth: {
    avgResponseTime: string;
    uptime: string;
    recentMetrics: { metricType: string; value: number; recordedAt: string }[];
  };
  usagePatterns: {
    topEvents: { eventType: string; count: number }[];
  };
  team: {
    totalMembers: number;
    activeMembers: number;
  };
  billing: {
    plan: string;
    amount: number;
    nextBillingDate: string | null;
    totalInvoices: number;
  };
}
