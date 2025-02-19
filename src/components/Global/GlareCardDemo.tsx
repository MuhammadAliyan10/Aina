import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { GlareCard } from "../ui/glare-card";
import Link from "next/link";

interface GlareCardProps {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  status?: string;
  createdAt?: Date | string;
  onDelete: (id: string) => void;
  loading?: boolean;
  href?: string;
}

export function GlareCardDemo({
  id,
  title,
  description,
  type,
  href,
  status,
  createdAt,
  onDelete,
  loading,
}: GlareCardProps) {
  // Format the createdAt date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No date available";

  return (
    <div className="relative group overflow-hidden max-w-[325px]">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-2 border border-white"
        onClick={() => onDelete(id)}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4 text-white" />
      </Button>

      <Link href={`${href}/${id}`} className="block">
        <GlareCard className="flex flex-col items-center justify-center p-6 hover:bg-opacity-90 transition-all">
          <svg
            width="66"
            height="65"
            viewBox="0 0 66 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-white"
          >
            <path
              d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
              stroke="currentColor"
              strokeWidth="15"
              strokeMiterlimit="3.86874"
              strokeLinecap="round"
            />
          </svg>

          {/* Card content */}
          <div className="text-center cursor-pointer z-100">
            <p className="text-white font-bold text-xl mt-4">
              {title}
              {type && `(${type})`}
            </p>
            <p className="text-muted-foreground font-bold text-sm mt-2">
              {description}
            </p>
            <p className="text-muted-foreground font-bold text-sm mt-2">
              {formattedDate}
            </p>
            {status && (
              <Button className="mt-4" variant={"outline"}>
                {status}
              </Button>
            )}
          </div>
        </GlareCard>
      </Link>
    </div>
  );
}
