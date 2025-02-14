// app/tasks/page.tsx
"use client"; // Mark as a Client Component

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
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
import { Calendar } from "@/components/ui/calendar";
import { FileInput } from "@/components/FileInput"; // Custom file input component
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  attachment?: string;
  time: string;
  date: Date;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function WorkFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    time: "",
    date: new Date(),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTask = () => {
    const taskId = `task-${nodes.length + 1}`;
    const newNode: Node = {
      id: taskId,
      type: "default",
      data: { label: newTask.title, ...newTask },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    };

    setNodes([...nodes, newNode]);
    setNewTask({
      id: "",
      title: "",
      description: "",
      time: "",
      date: new Date(),
    });
    setIsDialogOpen(false); // Close the dialog after adding the task
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="mx-4">
      <div className="h-screen w-[100%] flex flex-col">
        {/* Header with Add Task Button */}
        <div className="p-4 border-b">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
                <Input
                  type="time"
                  value={newTask.time}
                  onChange={(e) =>
                    setNewTask({ ...newTask, time: e.target.value })
                  }
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !newTask.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.date ? (
                        format(newTask.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.date}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FileInput
                  onChange={(file) =>
                    setNewTask({ ...newTask, attachment: file.name })
                  }
                />
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
