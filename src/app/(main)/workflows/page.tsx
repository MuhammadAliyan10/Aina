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
import { Loader2, Plus, Zap, Search } from "lucide-react";
import WorkflowCard from "./components/WorkflowCard";
import {
  fetchUserWorkFlow,
  handleAddWorkFlow,
  handleRemoveWorkFlow,
} from "./action";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<NewWorkflow>({
    title: "",
    description: "",
  });
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: workflows,
    isLoading,
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
    if (editingWorkflow) updateWorkflow.mutate(editingWorkflow);
  };

  const filteredWorkflows = workflows?.filter(
    (flow) =>
      flow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.description &&
        flow.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Zap className="h-9 w-9 text-primary animate-pulse" />
          Workflows
        </h1>
        <div className="flex gap-4 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-border rounded-2xl shadow-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-card-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text ">
                  Add New Workflow
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-1">
                <Input
                  placeholder="Workflow Title"
                  value={newWorkflow.title}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, title: e.target.value })
                  }
                  className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
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
                  className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={createWorkflow.isPending}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
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
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading your workflows...
          </p>
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredWorkflows.map((flow) => (
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
        <div className="text-center text-muted-foreground py-16 bg-card/50 border border-border rounded-xl shadow-lg">
          <p className="text-2xl font-semibold">
            No workflows yet. Create one to get started!
          </p>
          <Zap className="h-16 w-16 mx-auto mt-6 text-primary animate-bounce" />
        </div>
      )}

      {/* Edit Workflow Dialog */}
      {editingWorkflow && (
        <Dialog
          open={!!editingWorkflow}
          onOpenChange={() => setEditingWorkflow(null)}
        >
          <DialogContent className="bg-card border border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-card-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Edit Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-1">
              <Input
                placeholder="Workflow Title"
                value={editingWorkflow.title}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    title: e.target.value,
                  })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
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
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 min-h-[120px]"
              />
              <Button
                onClick={handleUpdate}
                disabled={updateWorkflow.isPending}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
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
