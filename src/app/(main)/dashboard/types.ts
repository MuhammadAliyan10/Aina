export interface DashboardData {
  overview: {
    workflows: { total: number; active: number };
    tasks: {
      total: number;
      completed: number;
      overdue: number;
      completionRate: string;
      recent: {
        id: string;
        title: string;
        status: string;
        dueDate: string | null;
        assignedTo: string;
      }[];
    };
    team: {
      totalMembers: number;
      activeMembers: number;
      recentMembers: {
        id: string;
        email: string;
        role: string;
        status: string;
      }[];
    };
    billing: {
      plan: string;
      nextBillingDate: string | null;
      amountDue: number;
      recentInvoice: {
        id: string;
        amount: number;
        status: string;
        issuedAt: string;
      } | null;
    };
  };
  aiAssistant: {
    recentMessages: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
    }[];
  };
  integrations: {
    connected: number;
    recent: { name: string; status: string; connectedAt: string }[];
  };
  documents: {
    total: number;
    recent: { title: string; updatedAt: string } | null;
  };
  calendar: {
    upcomingEvents: {
      id: string;
      title: string;
      start: string;
      linkedTask: { id: string; title: string } | null;
    }[];
  };
  automations: {
    total: number;
    active: number;
    recent: { title: string; status: string; updatedAt: string } | null;
  };
  activity: {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    timestamp: string;
  }[];
}
