// components/AutomationCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  id: string;
  title: string;
  description?: string | null;
  onDelete: (id: string) => void;
  loading: boolean;
}
const WorkFlowCard: React.FC<AutomationCardProps> = ({
  id,
  title,
  description,
  onDelete,
  loading,
}) => {
  return (
    <div className="w-full border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/tasks/${id}`}>
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground text-[13px] italic my-2">
              {description}
            </p>
          </div>
          <div></div>
        </div>
      </Link>

      <div className="flex justify-end gap-2 mt-4 z-10 ">
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

export default WorkFlowCard;
