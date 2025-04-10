"use client";

import React, { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Zap } from "lucide-react";
import WorkflowCard from "./components/WorkflowCard";
import {
  fetchUserWorkFlow,
  handleAddWorkFlow,
  handleRemoveWorkFlow,
} from "./action";

// Types for workflows
interface Workflow {
  id: string;
  title: string;
  description?: string | null;
  createdAt: Date;
}

interface NewWorkflow {
  title: string;
  description: string;
}

// Simulated update function
const handleUpdateWorkFlow = async (
  id: string,
  data: { title: string; description: string }
) => {
  const response = await fetch(`/api/workflows/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update workflow");
  return response.json();
};

export default function WorkflowPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<NewWorkflow>({
    title: "",
    description: "",
  });
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const {
    data: workflows,
    isLoading: loadingWorkflows,
    error,
    refetch,
  } = useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: fetchUserWorkFlow,
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch workflows",
        variant: "destructive",
      });
    }
  }, [error]);

  const createWorkflow = useMutation({
    mutationFn: handleAddWorkFlow,
    onSuccess: (data) => {
      if ("error" in data) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setNewWorkflow({ title: "", description: "" });
      setIsDialogOpen(false);
      refetch();
      toast({ title: "Success", description: "Workflow created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async (workflow: Workflow) =>
      handleUpdateWorkFlow(workflow.id, {
        title: workflow.title,
        description: workflow.description || "",
      }),
    onSuccess: (data) => {
      if ("error" in data) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setEditingWorkflow(null);
      refetch();
      toast({ title: "Success", description: "Workflow updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: handleRemoveWorkFlow,
    onSuccess: (data) => {
      if ("error" in data) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      refetch();
      toast({ title: "Success", description: data.message });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete workflow",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newWorkflow.title.trim() || !newWorkflow.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createWorkflow.mutate(newWorkflow);
  };

  const handleUpdate = () => {
    if (
      editingWorkflow &&
      (!editingWorkflow.title.trim() || !editingWorkflow.description?.trim())
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (editingWorkflow) {
      updateWorkflow.mutate(editingWorkflow);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Zap className="h-9 w-9 text-primary animate-pulse" />
          Workflows
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-lg transition-all duration-300">
              <Plus className="h-5 w-5 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-card-foreground">
                Add New Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Input
                placeholder="Workflow Title"
                value={newWorkflow.title}
                onChange={(e) =>
                  setNewWorkflow({ ...newWorkflow, title: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
              />
              <Textarea
                placeholder="Workflow Description"
                value={newWorkflow.description}
                onChange={(e) =>
                  setNewWorkflow({
                    ...newWorkflow,
                    description: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[120px]"
              />
              <Button
                onClick={handleSubmit}
                disabled={createWorkflow.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {createWorkflow.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  "Add Workflow"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Separator className="bg-border mb-8" />

      {loadingWorkflows ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading your workflows...
          </p>
        </div>
      ) : Array.isArray(workflows) && workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflows.map((flow) => (
            <WorkflowCard
              key={flow.id}
              workflow={{ ...flow, createdAt: flow.createdAt.toISOString() }}
              onEdit={(workflow) =>
                setEditingWorkflow({
                  ...workflow,
                  createdAt: new Date(workflow.createdAt),
                })
              }
              onDelete={(id) => deleteWorkflow.mutate(id)}
              isDeleting={
                deleteWorkflow.isPending && deleteWorkflow.variables === flow.id
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-xl font-medium">
            No workflows yet. Create one to get started!
          </p>
          <Zap className="h-12 w-12 mx-auto mt-4 text-primary animate-bounce" />
        </div>
      )}

      {/* Edit Workflow Dialog */}
      {editingWorkflow && (
        <Dialog
          open={!!editingWorkflow}
          onOpenChange={() => setEditingWorkflow(null)}
        >
          <DialogContent className="bg-card border border-border rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-card-foreground">
                Edit Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Input
                placeholder="Workflow Title"
                value={editingWorkflow.title}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    title: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
              />
              <Textarea
                placeholder="Workflow Description"
                value={editingWorkflow.description || ""}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    description: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[120px]"
              />
              <Button
                onClick={handleUpdate}
                disabled={updateWorkflow.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {updateWorkflow.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
