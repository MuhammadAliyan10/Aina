// src/app/(mainPages)/workflows/page.tsx
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
  createdAt: string;
}

interface NewWorkflow {
  title: string;
  description: string;
}

export default function WorkflowPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<NewWorkflow>({
    title: "",
    description: "",
  });
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Fetch workflows using action
  const {
    data: workflows,
    isLoading: loadingWorkflows,
    refetch,
  } = useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: fetchUserWorkFlow,
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch workflows",
        variant: "destructive",
      });
    },
  });

  // Mutation to create a workflow
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

  // Mutation to update a workflow (not provided in action.ts, so we'll simulate it)
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

  // Mutation to delete a workflow
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
      // Since action.ts doesn't have an update function, we'll simulate it locally
      updateWorkflow.mutate(editingWorkflow);
    }
  };

  return (
    <div className="flex flex-col min-h-screen  text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-400" />
          Your Workflows
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-800 border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-neutral-200">
                Add New Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Workflow Title"
                value={newWorkflow.title}
                onChange={(e) =>
                  setNewWorkflow({ ...newWorkflow, title: e.target.value })
                }
                className="bg-neutral-700 border-neutral-600 text-white"
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
                className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
              />
              <Button
                onClick={handleSubmit}
                disabled={createWorkflow.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createWorkflow.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Add Workflow"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Separator className="bg-neutral-700 mb-6" />

      {loadingWorkflows ? (
        <div className="flex flex-1 justify-center items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p>Loading your workflows...</p>
        </div>
      ) : workflows && workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((flow) => (
            <WorkflowCard
              key={flow.id}
              workflow={flow}
              onEdit={(workflow) => setEditingWorkflow(workflow)}
              onDelete={(id) => deleteWorkflow.mutate(id)}
              isDeleting={
                deleteWorkflow.isPending && deleteWorkflow.variables === flow.id
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-400">
          <p>No workflows yet. Create one to get started!</p>
        </div>
      )}

      {/* Edit Workflow Dialog */}
      {editingWorkflow && (
        <Dialog
          open={!!editingWorkflow}
          onOpenChange={() => setEditingWorkflow(null)}
        >
          <DialogContent className="bg-neutral-800 border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-neutral-200">
                Edit Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Workflow Title"
                value={editingWorkflow.title}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    title: e.target.value,
                  })
                }
                className="bg-neutral-700 border-neutral-600 text-white"
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
                className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
              />
              <Button
                onClick={handleUpdate}
                disabled={updateWorkflow.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateWorkflow.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
