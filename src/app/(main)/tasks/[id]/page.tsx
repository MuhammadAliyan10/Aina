// app/tasks/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import { CustomTaskNode } from "../components/CustomTaskNode";
import { CustomAssignmentNode } from "../components/CustomFileNode";
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
import { toast } from "@/hooks/use-toast";

const nodeTypes = {
  customTask: CustomTaskNode,
  customAssignment: CustomAssignmentNode,
};

export default function TasksPage({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: null as Date | null,
  });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "All fields are required.",
      });
      return;
    }

    const taskId = `task-${nodes.length + 1}`;
    const newNode: Node = {
      id: taskId,
      type: "customTask",
      data: {
        ...newTask,
        formattedDate: format(newTask.dueDate, "PPPp"),
        assignments: [],
      },
      position: { x: Math.random() * 600, y: Math.random() * 400 },
    };

    setNodes([...nodes, newNode]);
    setNewTask({ title: "", description: "", dueDate: null });
    setIsTaskDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const fileId = `file-${nodes.length + 1}`;
    const newFileNode: Node = {
      id: fileId,
      type: "customAssignment",
      data: {
        fileName: file.name,
      },
      position: { x: Math.random() * 600, y: Math.random() * 400 },
    };

    setNodes((prevNodes) => [...prevNodes, newFileNode]);
    setIsFileDialogOpen(false);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.target) {
            const assignmentNode = nodes.find((n) => n.id === params.source);
            if (assignmentNode) {
              return {
                ...node,
                data: {
                  ...node.data,
                  assignments: [
                    ...(node.data.assignments || []),
                    assignmentNode.data.fileName,
                  ],
                },
              };
            }
          }
          return node;
        })
      );
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes]
  );

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800 gap-4 flex justify-between items-center">
        <div className="flex gap-4">
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Add Task</Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter the title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Enter the description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
                <DatePicker
                  selected={newTask.dueDate}
                  onChange={(date) =>
                    setNewTask((prev) => ({ ...prev, dueDate: date }))
                  }
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Pick a date & time"
                  className="w-full px-3 py-2 text-[12px] border-b border-muted-foreground cursor-pointer bg-transparent text-white"
                />

                <div className="flex justify-end">
                  <Button onClick={handleAddTask}>Add Task</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Add Assignment</Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Attach a File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="bg-gray-800 text-white border-gray-600"
                />
                <div className="flex justify-end">
                  <Button onClick={() => setIsFileDialogOpen(false)}>
                    Attach
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#1e293b" />
          <Controls className="text-white" />
        </ReactFlow>
      </div>
    </div>
  );
}
