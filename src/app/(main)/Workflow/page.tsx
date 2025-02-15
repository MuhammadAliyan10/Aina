"use client"; // Mark as a Client Component

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ShinyText from "@/components/Animated/ShinyText";
import { fetchUserWorkFlow, handleAddWorkFlow } from "./action";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

interface WorkFlow {
  title: string;
  description: string;
}
interface UserWorkFlow {
  id: string;
  title: string;
  description: string | null; // Allow null values
  createdAt: Date;
}

export default function WorkFlow() {
  const [newWorkFlow, setNewWorkFlow] = useState<WorkFlow>({
    title: "",
    description: "",
  });
  const [workFlow, setWorkFlow] = useState<UserWorkFlow[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newWorkFlow.title || !newWorkFlow.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await handleAddWorkFlow(newWorkFlow);
      if (res) {
        toast({ title: "Success", description: "Workflow added successfully" });
        setIsDialogOpen(false);
        setNewWorkFlow({ title: "", description: "" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add workflow",
        variant: "destructive",
      });
      console.error("Failed to add workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userWorkFlow = await fetchUserWorkFlow();
      setWorkFlow(userWorkFlow);
    };
    fetchData();
  }, [handleSubmit]);

  return (
    <div className="flex items-center m-10 pt-5 md:pt-0">
      <div>
        <ShinyText
          text="Workflows"
          className="text-4xl md:text-8xl font-bold mb-4"
          disabled={false}
          speed={3}
        />

        {/* Header with Add Task Button */}
        <div className="p-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Workflow</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New WorkFlow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="WorkFlow Title"
                  value={newWorkFlow.title}
                  onChange={(e) =>
                    setNewWorkFlow({ ...newWorkFlow, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="WorkFlow Description"
                  value={newWorkFlow.description}
                  onChange={(e) =>
                    setNewWorkFlow({
                      ...newWorkFlow,
                      description: e.target.value,
                    })
                  }
                />

                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <p className="flex justify-center items-center gap-x-2">
                      <Loader2 className="size-5 animate-spin" />
                      <p>Adding...</p>
                    </p>
                  ) : (
                    "Add WorkFlow"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="py-4">
          <Separator />
        </div>
        <ShinyText
          text="Your Workflows"
          className="text-4xl md:text-3xl font-bold mb-4"
          disabled={false}
          speed={3}
        />
        {workFlow.length >= 1 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              {workFlow.map((flow) => {
                return (
                  <div className="p-4 border rounded-lg shadow-sm relative cursor-pointer">
                    <span className="absolute right-0 top-[1px]">
                      <Trash2
                        className="text-red-600 text-[10px] cursor-pointer"
                        size={16}
                      />
                    </span>
                    <Link href={`/tasks/${flow.id}`}>
                      <p className="absolute right-0 bottom-0 text-muted-foreground text-[10px]">
                        {new Date(flow.createdAt).toUTCString().slice(0, 17)}
                      </p>
                      <p className="font-bold">{flow.title}</p>
                      <p className="mt-2 text-gray-600">{flow.description}</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            No workflow founded. Kindly create one to start.
          </p>
        )}
        <div></div>
      </div>
    </div>
  );
}
