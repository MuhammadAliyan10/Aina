"use client";

import React, { useState, useRef } from "react";
import {
  Zap,
  Play,
  Trash2,
  Edit,
  Loader2,
  Save,
  Plus,
  Search,
  X,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/app/(main)/SessionProvider";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition";
  name: string;
  config: Record<string, any>;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
}

const AutomationStudioPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "" });
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "status" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [configuringStep, setConfiguringStep] = useState<WorkflowStep | null>(
    null
  );
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const { data: workflows, isLoading: workflowsLoading } = useQuery<Workflow[]>(
    {
      queryKey: ["workflows", user?.id],
      queryFn: async () => {
        const response = await fetch(
          `/api/automation/workflows?userId=${user?.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch workflows");
        return response.json();
      },
      enabled: !!user?.id,
    }
  );

  const createWorkflow = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/automation/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name: newWorkflow.name || "Untitled Workflow",
          description: newWorkflow.description,
          steps: [],
          status: "inactive",
        }),
      });
      if (!response.ok) throw new Error("Failed to create workflow");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      setNewWorkflow({ name: "", description: "" });
      toast({ title: "Success", description: "Workflow created successfully" });
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async (workflow: Workflow) => {
      const response = await fetch(`/api/automation/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
          status: workflow.status,
        }),
      });
      if (!response.ok) throw new Error("Failed to update workflow");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      setEditingWorkflow(null);
      toast({ title: "Success", description: "Workflow updated successfully" });
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/automation/workflows/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to delete workflow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", user?.id] });
      setEditingWorkflow(null);
      toast({ title: "Success", description: "Workflow deleted successfully" });
    },
  });

  const toggleWorkflowStatus = useMutation({
    mutationFn: async (workflow: Workflow) => {
      const newStatus = workflow.status === "active" ? "inactive" : "active";
      const response = await fetch(`/api/automation/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to toggle workflow status");
      return { ...workflow, status: newStatus };
    },
    onSuccess: (updatedWorkflow) => {
      queryClient.setQueryData(
        ["workflows", user?.id],
        (old: Workflow[] | undefined) =>
          old?.map((w) => (w.id === updatedWorkflow.id ? updatedWorkflow : w))
      );
      if (editingWorkflow?.id === updatedWorkflow.id)
        setEditingWorkflow({
          ...updatedWorkflow,
          status: updatedWorkflow.status as "inactive" | "active",
        });
      toast({
        title: "Success",
        description: `Workflow ${updatedWorkflow.status}`,
      });
    },
  });

  const simulateWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/automation/workflows/${id}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to simulate workflow");
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Simulation Result",
        description: `Workflow simulated: ${result.message}`,
      });
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination || !editingWorkflow) return;
    const reorderedSteps = Array.from(steps);
    const [movedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, movedStep);
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      order: index,
    }));
    setSteps(updatedSteps);
    setEditingWorkflow({ ...editingWorkflow, steps: updatedSteps });
  };

  const filteredWorkflows = workflows
    ?.filter((workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(valueA).getTime() - new Date(valueB).getTime()
          : new Date(valueB).getTime() - new Date(valueA).getTime();
      }
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setSteps(workflow.steps);
  };

  const handleSave = () => {
    if (editingWorkflow) updateWorkflow.mutate({ ...editingWorkflow, steps });
  };

  const handleAddStep = () => {
    if (!editingWorkflow) return;
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: "action",
      name: `Step ${steps.length + 1}`,
      config: {},
      order: steps.length,
    };
    setSteps([...steps, newStep]);
  };

  const exportWorkflow = (workflow: Workflow) => {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workflow.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="md:text-4xl text-2xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Zap className="h-6 w-6 md:h-9 md:w-9 text-primary animate-pulse" />
          Automation Studio
        </h1>
        <div className="flex gap-4 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button
            onClick={() => createWorkflow.mutate()}
            disabled={createWorkflow.isPending}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {createWorkflow.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            New Workflow
          </Button>
        </div>
      </header>

      {workflowsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading workflows...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow List */}
          <Card className="lg:col-span-1 bg-card border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                <Zap className="h-6 w-6 text-primary" />
                Workflows ({filteredWorkflows?.length || 0})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("import-workflow")?.click()
                }
                className="border-primary/50 text-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                id="import-workflow"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const workflow = JSON.parse(
                        event.target?.result as string
                      );
                      createWorkflow.mutate(workflow);
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead
                      onClick={() => {
                        setSortBy("name");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="cursor-pointer"
                    >
                      Name{" "}
                      {sortBy === "name" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      onClick={() => {
                        setSortBy("status");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="cursor-pointer"
                    >
                      Status{" "}
                      {sortBy === "status" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows && filteredWorkflows.length > 0 ? (
                    filteredWorkflows.map((workflow) => (
                      <TableRow
                        key={workflow.id}
                        className="border-border hover:bg-muted/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium">
                          {workflow.name}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleWorkflowStatus.mutate(workflow)
                                  }
                                  disabled={
                                    toggleWorkflowStatus.isPending &&
                                    toggleWorkflowStatus.variables?.id ===
                                      workflow.id
                                  }
                                >
                                  {workflow.status === "active" ? (
                                    <ToggleRight className="h-5 w-5 text-success" />
                                  ) : (
                                    <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {workflow.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(workflow)}
                                >
                                  <Edit className="h-5 w-5 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Workflow</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    simulateWorkflow.mutate(workflow.id)
                                  }
                                  disabled={simulateWorkflow.isPending}
                                >
                                  <Play className="h-5 w-5 text-accent" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Simulate Workflow</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => exportWorkflow(workflow)}
                                >
                                  <Download className="h-5 w-5 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Export Workflow</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteWorkflow.mutate(workflow.id)
                                  }
                                  disabled={deleteWorkflow.isPending}
                                >
                                  <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Workflow</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No workflows found. Create one to start automating!
                        <Zap className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Workflow Builder */}
          <Card className="lg:col-span-2 bg-card border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                <Zap className="h-6 w-6 text-primary" />
                {editingWorkflow
                  ? `Editing: ${editingWorkflow.name}`
                  : "Workflow Builder"}
              </CardTitle>
              {editingWorkflow && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={updateWorkflow.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWorkflow(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {editingWorkflow ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Workflow Name"
                      value={editingWorkflow.name}
                      onChange={(e) =>
                        setEditingWorkflow({
                          ...editingWorkflow,
                          name: e.target.value,
                        })
                      }
                      className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
                    />
                    <Textarea
                      placeholder="Workflow Description"
                      value={editingWorkflow.description}
                      onChange={(e) =>
                        setEditingWorkflow({
                          ...editingWorkflow,
                          description: e.target.value,
                        })
                      }
                      className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 md:col-span-2 min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <Button
                      onClick={handleAddStep}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Step
                    </Button>
                    <Badge variant="outline" className="text-sm">
                      Steps: {steps.length}
                    </Badge>
                  </div>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="steps">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-muted/10 rounded-lg border border-border"
                        >
                          {steps.map((step, index) => (
                            <Draggable
                              key={step.id}
                              draggableId={step.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-card border border-border p-4 rounded-lg flex justify-between items-center hover:border-primary transition-all duration-300 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <ChevronDown className="h-5 w-5 text-muted-foreground cursor-move" />
                                    <Badge
                                      variant={
                                        step.type === "trigger"
                                          ? "default"
                                          : step.type === "action"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {step.type}
                                    </Badge>
                                    <span className="text-foreground font-medium">
                                      {step.name}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setConfiguringStep(step)}
                                      className="text-primary hover:bg-primary/10"
                                    >
                                      <Settings className="h-5 w-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSteps(
                                          steps.filter((s) => s.id !== step.id)
                                        )
                                      }
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  {steps.length > 0 && (
                    <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                      <h3 className="text-lg font-semibold mb-2">
                        Workflow Preview
                      </h3>
                      <div className="flex flex-col gap-2">
                        {steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2"
                          >
                            <div className="h-2 w-2 bg-primary rounded-full" />
                            <span className="text-sm text-foreground">
                              {step.name} ({step.type})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-lg border border-border">
                  <p className="text-xl font-medium">
                    Select a workflow to edit or create a new one.
                  </p>
                  <Zap className="h-12 w-12 mx-auto mt-6 text-primary animate-bounce" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step Configuration Dialog */}
      {configuringStep && (
        <Dialog
          open={!!configuringStep}
          onOpenChange={() => setConfiguringStep(null)}
        >
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Configure {configuringStep.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-1">
              <Input
                placeholder="Step Name"
                value={configuringStep.name}
                onChange={(e) =>
                  setConfiguringStep({
                    ...configuringStep,
                    name: e.target.value,
                  })
                }
                className="bg-input border-border rounded-lg shadow-inner"
              />
              <Textarea
                placeholder="Configuration (JSON)"
                value={JSON.stringify(configuringStep.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setConfiguringStep({ ...configuringStep, config });
                  } catch {
                    toast({
                      title: "Error",
                      description: "Invalid JSON",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-input border-border rounded-lg shadow-inner min-h-[150px]"
              />
              <Button
                onClick={() => {
                  setSteps(
                    steps.map((s) =>
                      s.id === configuringStep.id ? configuringStep : s
                    )
                  );
                  setConfiguringStep(null);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                Save Step
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AutomationStudioPage;
