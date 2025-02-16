// components/AutomationCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  onDelete: (id: string) => void;
  loading: boolean;
}
const AutomationCard: React.FC<AutomationCardProps> = ({
  id,
  title,
  description,
  status,
  type,
  onDelete,
  loading,
}) => {
  return (
    <div className="w-full border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/automation/${id}`}>
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-semibold">
              {title}
              <span className="text-muted-foreground text-[11px]">
                ({type})
              </span>
            </h3>
            <p className="text-muted-foreground text-[13px] italic my-4">
              {description}
            </p>
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
      </Link>

      <div className="flex gap-2 mt-4 z-10 ">
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
