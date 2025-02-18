import React from "react";
import { EvervaultCard, Icon } from "../ui/evervault-card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import Link from "next/link";

interface EvervaultProps {
  id: any;
  title: String;
  description: String;
  status: String;
  createdAt: any;
  onDelete: (id: string) => void;
}
export function EvervaultCardDemo({
  id,
  title,
  description,
  status,
  onDelete,
  createdAt,
}: EvervaultProps) {
  return (
    <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-sm mx-auto p-4 relative h-[30rem]">
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
      <EvervaultCard text={title.toString()} />
      <Separator />

      <h2 className="dark:text-white text-black mt-4 text-sm font-light">
        {description}
      </h2>
      <div className="flex w-full justify-end items-center gap-x-2">
        <Button className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black  px-2 py-0.5">
          {status}
        </Button>
        <Button
          className="bg-red-600 text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-white hover:text-black px-2 py-0.5"
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
        <Link href={`/automation/${id}`} className="cursor-pointer">
          <Button className="bg-green-600 text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-white hover:text-black px-2 py-0.5">
            Automate
          </Button>
        </Link>
      </div>
    </div>
  );
}
