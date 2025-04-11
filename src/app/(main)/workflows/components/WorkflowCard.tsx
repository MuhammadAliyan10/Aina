import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Workflow as WorkflowIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  className?: string;
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
        "relative bg-gradient-to-br from-card via-card/95 to-muted/20 border border-border rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group",
        isDeleting && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-4">
        <WorkflowIcon className="h-7 w-7 text-primary animate-pulse" />
        <h3 className="text-xl font-semibold text-card-foreground truncate group-hover:text-primary transition-colors duration-200">
          {workflow.title}
        </h3>
      </div>

      {/* Card Body */}
      <div className="flex-1">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
          {workflow.description || "No description provided"}
        </p>
        <Badge
          variant="outline"
          className="text-xs bg-muted/30 border-muted-foreground/20"
        >
          Created: {new Date(workflow.createdAt).toLocaleDateString()}
        </Badge>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center mt-6">
        <Link href={`/tasks/${workflow.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            View Tasks
          </Button>
        </Link>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(workflow)}
            className="text-primary hover:bg-primary/10 rounded-full p-2 transition-all duration-300"
            title="Edit Workflow"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(workflow.id)}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 rounded-full p-2 transition-all duration-300"
            title="Delete Workflow"
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Subtle Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
    </div>
  );
};

export default WorkflowCard;
