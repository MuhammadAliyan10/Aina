// src/app/(mainPages)/automation-studio/page.tsx
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
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const { data: workflows, isLoading: workflowsLoading } = useQuery<Workflow[]>(
    {
      queryKey: ["workflows", user?.id],
      queryFn: async () => {
        const response = await fetch(
          `/api/automation/workflows?userId=${user?.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
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
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete workflow",
        variant: "destructive",
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
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to simulate workflow",
        variant: "destructive",
      });
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination || !editingWorkflow) return;

    const reorderedSteps = Array.from(editingWorkflow.steps);
    const [movedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, movedStep);

    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      order: index,
    }));

    setEditingWorkflow({ ...editingWorkflow, steps: updatedSteps });
    setSteps(updatedSteps);
  };

  const filteredWorkflows = workflows?.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setSteps(workflow.steps);
  };

  const handleSave = () => {
    if (editingWorkflow) {
      updateWorkflow.mutate({ ...editingWorkflow, steps });
    }
  };

  const handleAddStep = () => {
    if (!editingWorkflow) return;
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: "action",
      name: "New Action",
      config: {},
      order: steps.length,
    };
    setSteps([...steps, newStep]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Zap className="h-9 w-9 text-primary animate-pulse" />
          Automation Studio
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
      </header>

      {workflowsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading workflows...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow List */}
          <Card className="lg:col-span-1 bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => createWorkflow.mutate()}
                disabled={createWorkflow.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {createWorkflow.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                New Workflow
              </Button>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows && filteredWorkflows.length > 0 ? (
                    filteredWorkflows.map((workflow) => (
                      <TableRow
                        key={workflow.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium">
                          {workflow.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1 rounded-full",
                              workflow.status === "active"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {workflow.status}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(workflow)}
                            className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => simulateWorkflow.mutate(workflow.id)}
                            disabled={simulateWorkflow.isPending}
                            className="text-accent hover:text-accent/80 hover:bg-muted rounded-full p-2"
                          >
                            <Play className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWorkflow.mutate(workflow.id)}
                            disabled={deleteWorkflow.isPending}
                            className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground text-center py-6"
                      >
                        No workflows found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Workflow Builder */}
          <Card className="lg:col-span-2 bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {editingWorkflow
                  ? `Editing: ${editingWorkflow.name}`
                  : "Workflow Builder"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {editingWorkflow ? (
                <>
                  <Input
                    placeholder="Workflow Name"
                    value={editingWorkflow.name}
                    onChange={(e) =>
                      setEditingWorkflow({
                        ...editingWorkflow,
                        name: e.target.value,
                      })
                    }
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
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
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[120px]"
                  />
                  <div className="flex justify-between items-center gap-4">
                    <Button
                      onClick={handleAddStep}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Step
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateWorkflow.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      {updateWorkflow.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      Save Workflow
                    </Button>
                  </div>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="steps">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3 max-h-[400px] overflow-y-auto p-2 bg-card rounded-lg"
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
                                  className="bg-card border border-border p-4 rounded-lg flex justify-between items-center hover:border-primary transition-all duration-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <ChevronDown className="h-5 w-5 text-muted-foreground cursor-move" />
                                    <span className="text-foreground font-medium">
                                      {step.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      ({step.type})
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setSteps(
                                        steps.filter((s) => s.id !== step.id)
                                      )
                                    }
                                    className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-12">
                  Select a workflow to edit or create a new one.
                  <Zap className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomationStudioPage;
