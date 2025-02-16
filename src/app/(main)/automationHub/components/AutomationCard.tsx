// components/AutomationCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  id: string;
  title: string;
  automationUrl: string;
  description: string;
  status: string;
  type: "UNIVERSITY" | "WORK" | "BLANK" | string;
  executeAt: Date;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  loading: boolean;
}

const AutomationCard: React.FC<AutomationCardProps> = ({
  id,
  title,
  description,
  automationUrl,
  status,
  type,
  executeAt,
  onDelete,
  onEdit,
  loading,
}) => {
  return (
    <div className="w-full border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground text-[14px]">{description}</p>
        </div>
        <div>
          <Button
            className={cn("text-[12px] capitalize text-white", {
              "bg-red-600 hover:bg-red-600": status === "PENDING",
              "bg-green-600 hover:bg-green-600": status !== "PENDING",
            })}
          >
            {status}
          </Button>
        </div>
      </div>
      <Link className="text-red-600 text-[12px] underline" href={automationUrl}>
        {automationUrl}
      </Link>
      <div className="mt-2">
        <span className="text-sm text-blue-600">{type}</span>
        <p className="text-sm text-gray-500">
          Due: {new Date(executeAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(id)}
          className="flex items-center gap-1"
        >
          <Edit className="size-4" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(id)}
          className="flex items-center gap-1"
        >
          <Trash2 className="size-4" /> {loading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default AutomationCard;
