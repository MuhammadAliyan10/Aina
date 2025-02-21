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
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div
      className={cn(
        "bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between",
        isDeleting && "opacity-50"
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <WorkflowIcon className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-neutral-200 truncate">
            {workflow.title}
          </h3>
        </div>
        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
          {workflow.description || "No description provided"}
        </p>
        <p className="text-neutral-500 text-xs">
          Created: {new Date(workflow.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex justify-between mt-4">
        <Link href={`/tasks/${workflow.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-400 border-blue-400 hover:bg-blue-900 hover:text-blue-300"
          >
            View Tasks
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(workflow)}
            className="text-blue-400 hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(workflow.id)}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
