"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Background,
  Controls,
  addEdge,
  ReactFlowInstance,
  Node,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import { Zap, FolderPlus, Globe, Chrome } from "lucide-react";
import { GENERAL, BROWSER, INTERACTION } from "../data/Data";
import { TriggerNode } from "../Node/TriggerNode";

const nodeTypes = {
  customTriggerNode: TriggerNode,
  customWorkFlow: TriggerNode,
};

export default function Page() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<{ label: string }>[]
  >([
    {
      id: "1",
      type: "default",
      position: { x: 250, y: 150 },
      data: { label: "Start Node" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // UUID generator
  const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // Dragging handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: uuidv4(),
        type: type,
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance]
  );

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex">
      <NodesPanel />
      <div className="flex-1 flex flex-col">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          nodeTypes={nodeTypes}
          panOnDrag
          zoomOnScroll
          zoomOnDoubleClick
        >
          <Background />
          <Controls
            className="bg-gray-800 text-white"
            position="bottom-right"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Sidebar Panel for Dragging Nodes
const NodesPanel = () => (
  <div className="w-80 h-screen overflow-auto bg-gray-900 p-4 border-r border-gray-800 flex flex-col gap-4">
    <div className="flex items-center gap-2 mb-4">
      <Zap size={20} className="text-blue-400" />
      <h2 className="text-lg font-semibold">Workflow Components</h2>
    </div>

    <div className="space-y-2">
      <PanelSection title="General" icon={<FolderPlus size={16} />}>
        {GENERAL.map((item) => (
          <DraggableNode
            type={item.type}
            icon={item.icon}
            label={item.label}
            key={item.id}
          />
        ))}
      </PanelSection>

      <PanelSection title="Browser" icon={<Globe size={16} />}>
        {BROWSER.map((item) => (
          <DraggableNode
            type={item.type}
            icon={item.icon}
            label={item.label}
            key={item.id}
          />
        ))}
      </PanelSection>

      <PanelSection title="Web Interactions" icon={<Chrome size={16} />}>
        {INTERACTION.map((item) => (
          <DraggableNode
            type={item.type}
            icon={item.icon}
            label={item.label}
            key={item.id}
          />
        ))}
      </PanelSection>
    </div>
  </div>
);

const PanelSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-800 rounded-lg p-2">
    <div className="flex items-center gap-2 mb-2 px-2 py-1 text-sm font-medium text-gray-300">
      {icon}
      {title}
    </div>
    <div className="gap-2 grid grid-cols-2">{children}</div>
  </div>
);

const DraggableNode = ({
  type,
  label,
  icon,
}: {
  type: string;
  label: string;
  icon: React.ReactNode;
}) => (
  <div
    className="p-3 bg-gray-700 rounded-lg cursor-move hover:bg-gray-600 transition-colors shadow-sm"
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("application/reactflow", type);
      e.dataTransfer.effectAllowed = "move";
    }}
  >
    <span className="text-gray-300 group-hover:text-white transition-colors">
      {icon}
    </span>
    <p className="text-sm mt-2 text-gray-200 group-hover:text-white transition-colors whitespace-nowrap">
      {label}
    </p>
  </div>
);
