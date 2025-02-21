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

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"; // For drag-and-drop
import { toast } from "@/hooks/use-toast";

// Types for workflows and steps
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

  // Fetch workflow list
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

  // Mutation to create a workflow
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

  // Mutation to update a workflow
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

  // Mutation to delete a workflow
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

  // Mutation to simulate a workflow
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

  // Drag-and-drop handler
  const onDragEnd = (result: any) => {
    if (!result.destination || !editingWorkflow) return;

    const reorderedSteps = Array.from(editingWorkflow.steps);
    const [movedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, movedStep);

    // Update step order
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      order: index,
    }));

    setEditingWorkflow({ ...editingWorkflow, steps: updatedSteps });
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
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-400" />
          Automation Studio
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-neutral-700 border-neutral-600 text-white"
          />
        </div>
      </header>

      {workflowsLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow List */}
          <Card className="lg:col-span-1 bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => createWorkflow.mutate()}
                disabled={createWorkflow.isPending}
                className="w-full mb-4"
              >
                {createWorkflow.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                New Workflow
              </Button>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-neutral-400">Name</TableHead>
                    <TableHead className="text-neutral-400">Status</TableHead>
                    <TableHead className="text-neutral-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows && filteredWorkflows.length > 0 ? (
                    filteredWorkflows.map((workflow) => (
                      <TableRow
                        key={workflow.id}
                        className="border-neutral-700"
                      >
                        <TableCell className="text-neutral-200">
                          {workflow.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-2 py-1 rounded-full",
                              workflow.status === "active"
                                ? "bg-green-700 text-green-100"
                                : "bg-neutral-600 text-neutral-200"
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => simulateWorkflow.mutate(workflow.id)}
                            disabled={simulateWorkflow.isPending}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWorkflow.mutate(workflow.id)}
                            disabled={deleteWorkflow.isPending}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-neutral-400 text-center"
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
          <Card className="lg:col-span-2 bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                {editingWorkflow
                  ? `Editing: ${editingWorkflow.name}`
                  : "Workflow Builder"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    className="bg-neutral-700 border-neutral-600 text-white"
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
                    className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <Button onClick={handleAddStep}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateWorkflow.isPending}
                    >
                      {updateWorkflow.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
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
                          className="space-y-2 max-h-[400px] overflow-y-auto"
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
                                  className="bg-neutral-700 border border-neutral-600 p-3 rounded-md flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                                    <span className="text-neutral-200">
                                      {step.name}
                                    </span>
                                    <span className="text-neutral-400 text-sm">
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
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                <p className="text-neutral-400 text-center">
                  Select a workflow to edit or create a new one.
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
