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
import WorkFlowCard from "./components/WorkflowCard";
import { GlareCardDemo } from "@/components/Global/GlareCardDemo";
import { useQuery } from "@tanstack/react-query";

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
  const [workflowDeleteLoading, setWorkFlowDeleteLoading] = useState(false);
  const [removingWorkFlowId, setRemovingWorkFlowId] = useState<string | null>(
    null
  );
  const [newWorkFlow, setNewWorkFlow] = useState<WorkFlow>({
    title: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // const fetchData = async () => {
  //   setWorkFlowLoading(true);
  //   try {
  //     const userWorkFlow = await fetchUserWorkFlow();
  //     setWorkFlow(
  //       userWorkFlow.map((flow) => ({
  //         ...flow,
  //         createdAt: flow.createdAt.toISOString(),
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Error fetching workflows:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch workflows",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setWorkFlowLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const {
    data: workFlow,
    refetch,
    isLoading: loadingWorkFlow,
  } = useQuery({
    queryKey: ["automations"],
    queryFn: async (): Promise<UserWorkFlow[]> => {
      const result = await fetchUserWorkFlow();
      if ("error" in result) {
        if (typeof result.error === "string") {
          throw new Error(result.error);
        } else {
          throw new Error("An unknown error occurred");
        }
      }
      return result.map((flow) => ({
        ...flow,
        createdAt: flow.createdAt.toISOString(),
      }));
    },
  });

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
        refetch();
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
      setWorkFlowDeleteLoading(true);
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

      refetch();
    } catch (error) {
      console.error("Failed to remove workflow:", error);
      toast({
        title: "Error",
        description: "Failed to remove workflow",
        variant: "destructive",
      });
    } finally {
      setWorkFlowDeleteLoading(false);
      setRemovingWorkFlowId(null);
    }
  };

  return (
    <div className="w-full m-10 pt-5 md:pt-0">
      <div>
        <ShinyText
          text="Workflows"
          className="text-4xl md:text-8xl font-bold mb-4 text-center"
          disabled={false}
          speed={3}
        />

        {/* Header with Add Task Button */}
        <div className="p-4 text-center">
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

        {workflowLoading ? (
          <div className="flex justify-center items-center gap-x-3">
            <Loader2 className="size-5 animate-spin" />
            <p>Fetching your workflows...</p>
          </div>
        ) : (
          <>
            {workFlow && workFlow.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
                {workFlow.map((flow) => (
                  <GlareCardDemo
                    key={flow.id}
                    id={flow.id}
                    title={flow.title}
                    createdAt={flow.createdAt}
                    description={flow.description}
                    onDelete={() => removeWorkFlow(flow.id)}
                    loading={workflowDeleteLoading}
                    href="/tasks"
                  />
                  // <WorkFlowCard
                  //   key={flow.id}
                  //   id={flow.id}
                  //   title={flow.title}
                  //   description={flow.description}
                  //   onDelete={() => removeWorkFlow(flow.id)}
                  //   loading={workflowDeleteLoading}
                  // />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                No workflows found. Create one to get started.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
