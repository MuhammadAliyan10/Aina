// src/app/(mainPages)/workflows/components/WorkflowCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Workflow as WorkflowIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Workflow {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  className?: string; // Accept custom className from parent
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onDelete,
  isDeleting,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 shadow-lg hover:shadow-2xl hover:border-primary transition-all duration-300 flex flex-col justify-between",
        isDeleting && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <WorkflowIcon className="h-6 w-6 text-primary animate-pulse" />
          <h3 className="text-xl font-semibold text-card-foreground truncate">
            {workflow.title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {workflow.description || "No description provided"}
        </p>
        <p className="text-muted-foreground text-xs">
          Created: {new Date(workflow.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link href={`/tasks/${workflow.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium rounded-lg transition-all duration-300"
          >
            View Tasks
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(workflow)}
            className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2 transition-all duration-300"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(workflow.id)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2 transition-all duration-300"
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
