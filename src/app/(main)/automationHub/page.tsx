"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import ShinyText from "@/components/Animated/ShinyText";

const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.ReactFlow),
  {
    ssr: false,
  }
);

export default function GraphPage() {
  const initialNodes = [
    {
      id: "1",
      type: "input",
      data: { label: "Gmail" },
      position: { x: -150, y: 0 },
    },
    {
      id: "2",
      type: "input",
      data: { label: "Instagram" },
      position: { x: 150, y: 0 },
    },
    { id: "3", data: { label: "Google" }, position: { x: 0, y: 100 } },
    { id: "4", data: { label: "Facebook" }, position: { x: 0, y: 200 } },
    {
      id: "5",
      type: "output",
      data: { label: "X" },
      position: { x: 0, y: 300 },
    },
  ];

  const initialEdges = [
    { id: "1->3", source: "1", target: "3" },
    { id: "2->3", source: "2", target: "3" },
    { id: "3->4", source: "3", target: "4" },
    { id: "4->5", source: "4", target: "5" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeGroup, setNewNodeGroup] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    []
  );

  const addNode = () => {
    if (!newNodeName || !newNodeGroup) {
      alert("Please enter node name and group.");
      return;
    }

    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: `${newNodeName} (${newNodeGroup})` },
      position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeName("");
    setNewNodeGroup("");
  };

  interface Node {
    id: string;
    type?: string;
    data: { label: string };
    position: { x: number; y: number };
  }

  interface Edge {
    id: string;
    source: string;
    target: string;
  }

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges((eds: Edge[]) =>
        deleted.reduce((acc: Edge[], node: Node) => {
          const incomers = nodes.filter(
            (n: Node) =>
              n.id !== node.id && edges.some((e: Edge) => e.target === n.id)
          );
          const outgoers = nodes.filter(
            (n: Node) =>
              n.id !== node.id && edges.some((e: Edge) => e.source === n.id)
          );
          const connectedEdges = edges.filter(
            (e: Edge) => e.source === node.id || e.target === node.id
          );

          const remainingEdges = acc.filter(
            (edge: Edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap((incomer: Node) =>
            outgoers.map((outgoer: Node) => ({
              id: `${incomer.id}->${outgoer.id}`,
              source: incomer.id,
              target: outgoer.id,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, eds)
      );
    },
    [nodes, edges]
  );
  const customStyles = {
    node: {
      color: "text-muted-foreground ",
      borderRadius: "5px",
    },
    edge: {
      strokeWidth: 2,
    },
  };

  return (
    <div className="container mx-auto my-10">
      <ShinyText
        text="Social Graph"
        className="text-4xl md:text-5xl font-bold mb-4"
        disabled={false}
        speed={3}
      />

      <Card>
        <CardHeader>
          <CardTitle>Social Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: "500px" }}>
            <ReactFlow
              nodes={nodes.map((node) => ({
                ...node,
                style: customStyles.node,
              }))}
              edges={edges.map((edge) => ({
                ...edge,
                style: customStyles.edge,
              }))}
              onNodesChange={onNodesChange}
              onNodesDelete={onNodesDelete}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-right"
            ></ReactFlow>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Node</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Node</DialogTitle>
                <DialogDescription>
                  Make sure to add correct node name and group name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                <div className="flex justify-between items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    placeholder="Node Name"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center gap-4">
                  <Label htmlFor="nodeGroup" className="text-right">
                    Group
                  </Label>
                  <Input
                    placeholder="Group Name"
                    value={newNodeGroup}
                    onChange={(e) => setNewNodeGroup(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={addNode}>Save Node</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
