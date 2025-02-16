"use client";

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
import {
  fetchUserWorkFlow,
  handleAddWorkFlow,
  handleRemoveWorkFlow,
} from "./action";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { DialogOverlay } from "@radix-ui/react-dialog";

interface WorkFlow {
  title: string;
  description: string;
}

interface UserWorkFlow {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

export default function WorkFlow() {
  const [workflowLoading, setWorkFlowLoading] = useState(false);
  const [removingWorkFlowId, setRemovingWorkFlowId] = useState<string | null>(
    null
  );
  const [newWorkFlow, setNewWorkFlow] = useState<WorkFlow>({
    title: "",
    description: "",
  });
  const [workFlow, setWorkFlow] = useState<UserWorkFlow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setWorkFlowLoading(true);
    try {
      const userWorkFlow = await fetchUserWorkFlow();
      setWorkFlow(
        userWorkFlow.map((flow) => ({
          ...flow,
          createdAt: flow.createdAt.toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive",
      });
    } finally {
      setWorkFlowLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!newWorkFlow.title.trim() || !newWorkFlow.description.trim()) {
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
        fetchData(); // Refresh workflows after adding
      }
    } catch (error) {
      console.error("Failed to add workflow:", error);
      toast({
        title: "Error",
        description: "Failed to add workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const removeWorkFlow = async (workFlowId: string) => {
    try {
      setRemovingWorkFlowId(workFlowId);
      const response = await handleRemoveWorkFlow(workFlowId);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Success",
        description: response.message,
      });

      fetchData();
    } catch (error) {
      console.error("Failed to remove workflow:", error);
      toast({
        title: "Error",
        description: "Failed to remove workflow",
        variant: "destructive",
      });
    } finally {
      setRemovingWorkFlowId(null);
    }
  };

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
                    <div className="flex justify-center items-center gap-x-2">
                      <Loader2 className="size-5 animate-spin" />
                      <span>Adding...</span>
                    </div>
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

        {workflowLoading ? (
          <div className="flex justify-center items-center gap-x-3">
            <Loader2 className="size-5 animate-spin" />
            <p>Fetching your workflows...</p>
          </div>
        ) : (
          <>
            {workFlow.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                {workFlow.map((flow) => (
                  <div
                    className="p-8 border rounded-xl shadow-md relative hover:shadow-lg transition-all duration-200"
                    key={flow.id}
                  >
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button className="p-2 text-white rounded-full transition">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-2 text-red-600 rounded-full transition"
                        onClick={() => removeWorkFlow(flow.id)}
                        disabled={removingWorkFlowId === flow.id}
                      >
                        {removingWorkFlowId === flow.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>

                    <Link href={`/tasks/${flow.id}`}>
                      {/* Workflow Title */}
                      <p className="font-semibold text-lg text-white">
                        {flow.title}
                      </p>

                      {/* Description */}
                      <p className="mt-2 text-gray-600 text-sm">
                        {flow.description || "No description provided."}
                      </p>

                      {/* Date */}
                      <p className="absolute right-3 bottom-3 text-gray-400 text-xs">
                        {new Date(flow.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No workflows found. Create one to get started.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
