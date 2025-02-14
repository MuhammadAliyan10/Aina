"use client";
import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  MarkerType,
  Node,
  EdgeChange,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  MiniMap,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ShinyText from "@/components/Animated/ShinyText";

interface User {
  id: string;
  name: string;
  interests: string[];
}

// CustomNode type extends Node with a label in the data
interface CustomNode extends Node {
  data: {
    label: string;
  };
}

// CustomEdge type extends Edge with additional properties
interface CustomEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  markerEnd: {
    type: MarkerType;
  };
}

// Main App Component
const Page: React.FC = () => {
  const initialNodes: CustomNode[] = [
    {
      id: "1",
      data: { label: "Muhammad Aliyan" },
      position: { x: 0, y: 0 },
      type: "default",
    },
    {
      id: "2",
      data: { label: "Usama Zulfiqar" },
      position: { x: 150, y: 100 },
      type: "default",
    },
    {
      id: "3",
      data: { label: "Muhammad Zarar" },
      position: { x: 250, y: 150 },
      type: "default",
    },
    {
      id: "4",
      data: { label: "Hashir Abdullah" },
      position: { x: 300, y: 200 },
      type: "default",
    },
    {
      id: "5",
      data: { label: "Noor-ul-Ain" },
      position: { x: 350, y: 250 },
      type: "default",
    },
    {
      id: "6",
      data: { label: "Mohsin Akhlaq" },
      position: { x: 400, y: 300 },
      type: "default",
    },
    {
      id: "7",
      data: { label: "Hafiz Zubair" },
      position: { x: 400, y: 300 },
      type: "default",
    },
  ];

  const initialEdges: CustomEdge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e1-4",
      source: "1",
      target: "4",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e3-6",
      source: "3",
      target: "6",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e2-5",
      source: "2",
      target: "5",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e3-7",
      source: "3",
      target: "7",
      label: "Friend",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ];

  const mockUsers: User[] = [
    {
      id: "1",
      name: "Muhammad Aliyan",
      interests: ["Football", "Coding", "GYM", "Chess"],
    },
    { id: "2", name: "Usama Zulfiqar", interests: ["TikTok", "Cricket"] },
    {
      id: "3",
      name: "Muhammad Zarar",
      interests: ["TikTok", "Gaming", "Instagram"],
    },
    {
      id: "4",
      name: "Hashir Abdullah",
      interests: ["Coding", "Gaming", "Instagram"],
    },
    { id: "5", name: "Noor-ul-Ain", interests: ["TikTok", "Gaming"] },
    {
      id: "6",
      name: "Mohsin Akhlaq",
      interests: ["TikTok", "Blogs", "Cricket"],
    },
    {
      id: "7",
      name: "Hafiz Zubair",
      interests: ["TikTok", "Instagram", "Songs"],
    },
  ];

  const [nodes, setNodes] = useState<CustomNode[]>(initialNodes);
  const [edges, setEdges] = useState<CustomEdge[]>(initialEdges);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const newEdge: CustomEdge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        label: "New Edge",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds) as CustomEdge[]);
    }
  }, []);

  const addNode = (name: string) => {
    const id = (nodes.length + 1).toString();
    const newNode: CustomNode = {
      id,
      data: { label: name },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: "default",
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const suggestFriends = (currentUser: User): User[] => {
    return users.filter(
      (user) =>
        user.id !== currentUser.id &&
        user.interests.some((interest) =>
          currentUser.interests.includes(interest)
        )
    );
  };
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => {
      const updatedEdges = applyEdgeChanges(changes, eds) as CustomEdge[];
      return updatedEdges;
    });

  const handleUserClick = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setSelectedUser(user);

    const suggestions = suggestFriends(user);

    suggestions.forEach((friend) => {
      if (!nodes.find((node) => node.id === friend.id)) {
        addNode(friend.name);
      }
      if (
        !edges.find((edge) => edge.source === id && edge.target === friend.id)
      ) {
        setEdges((prevEdges) => [
          ...prevEdges,
          {
            id: `e${id}-${friend.id}`,
            source: id,
            target: friend.id,
            label: "Suggested Friend",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
        ]);
      }
    });
  };

  return (
    <div className="container my-8 mx-1 md:mx-auto">
      <ShinyText
        text="Friends Suggestion"
        className="text-4xl md:text-5xl font-bold mb-8"
        disabled={false}
        speed={3}
      />
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-1/5 p-2 ">
          <div>
            <ShinyText
              text="Friends"
              className="md:text-xl text-lg font-bold mb-4 text-muted-foreground"
              disabled={false}
              speed={3}
            />

            <ul className="space-y-4">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-3 bg-inherit border-b border-gray-500 shadow-md hover:text-white cursor-pointer transition-all duration-300 text-muted-foreground"
                  onClick={() => handleUserClick(user.id)}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          </div>
          {selectedUser && (
            <div className="mt-8">
              <ShinyText
                text="Selected Friend"
                className="md:text-xl text-lg font-bold mb-4 text-muted-foreground"
                disabled={false}
                speed={3}
              />
              <div className="p-3 bg-white rounded-sm shadow-md">
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Interests:</strong>{" "}
                  {selectedUser.interests.join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <Card className="w-full shadow-xl">
            <CardHeader>
              <ShinyText
                text="Friends Network"
                className="md:text-xl text-lg font-bold mb-4 text-muted-foreground"
                disabled={false}
                speed={2}
              />
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: "500px" }}>
                <ReactFlow
                  nodes={nodes.map((node) => ({
                    ...node,

                    data: {
                      label: (
                        <Card className="p-1 rounded-lg">
                          <CardHeader>
                            <div className="font-semibold text-md">
                              {node.data.label}
                            </div>
                          </CardHeader>
                        </Card>
                      ),
                    },
                    style: {
                      backgroundColor: "#F6F9FB",
                      borderRadius: "10px",
                      fontFamily: "Arial, sans-serif",
                      padding: "4px", // Balanced padding
                      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
                      color: "#f8fafc", // Light text color for contrast
                      fontSize: "14px", // Readable font size
                      border: "1px solid #475569", // Slight border to define card edges
                    },
                  }))}
                  edges={edges}
                  onNodesChange={(changes) =>
                    setNodes((nds) => applyNodeChanges(changes, nds))
                  }
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Controls />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
