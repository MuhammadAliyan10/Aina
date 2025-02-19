// app/tasks/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import ReactFlow, {
  useEdgesState,
  useNodesState,
  Connection,
  Background,
  Controls,
  Node,
  ReactFlowInstance,
  XYPosition,
} from "reactflow";
import {
  ChevronDown,
  Plus,
  File,
  Bot,
  Save,
  Trash,
  MousePointer2,
  Zap,
  FolderPlus,
  Clock,
  Globe,
  Chrome,
} from "lucide-react";
import { GENERAL, BROWSER, INTERACTION } from "../data/Data";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import { CustomAutomationNode } from "../components/CustomAutomationNode";
import { CustomFileNode } from "../components/CustomFileNode";
import { CustomTaskNode } from "../components/CustomTaskNode";
import { saveFlow } from "../action";

export default function Page({ params }: { params: { id: string } }) {
  const { user } = useSession();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const nodeTypes = {
    customTask: CustomTaskNode,
    customFile: CustomFileNode,
    customAutomation: CustomAutomationNode,
  };
  const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };
  // Drag and drop handlers
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
        type,
        position,
        data: {
          label: `${type} node`,
          ...(type === "customTask" && { dueDate: new Date() }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setIsDirty(true);
    },
    [reactFlowInstance]
  );

  // Rest of the existing code...

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex">
      <NodesPanel />
      <div className="flex-1 flex flex-col">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          // Rest of the props...
        >
          <Background
            gap={36}
            className="bg-gray-900"
            color="#374151"
            // variant="lines"
          />
          <Controls
            className="[&>button]:bg-gray-800 [&>button]:text-white [&>button]:border-gray-700 [&>button]:hover:bg-gray-700"
            position="bottom-right"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Enhanced Nodes Panel Component
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
            label={item.label}
            icon={item.icon}
            key={item.id}
          />
        ))}
      </PanelSection>

      <PanelSection title="Browser" icon={<Globe size={16} />}>
        {BROWSER.map((item) => (
          <DraggableNode
            type={item.type}
            label={item.label}
            icon={item.icon}
            key={item.id}
          />
        ))}
      </PanelSection>
      <PanelSection title="Web Interactions" icon={<Chrome size={16} />}>
        {INTERACTION.map((item) => (
          <DraggableNode
            type={item.type}
            label={item.label}
            icon={item.icon}
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

// Define DraggableNodeProps type
type DraggableNodeProps = {
  type: string;
  label: string;
  icon: React.ReactNode;
};

// Enhanced Draggable Node Component
const DraggableNode = ({ type, label, icon }: DraggableNodeProps) => (
  <div
    className="p-3 bg-gray-700 rounded-lg cursor-move 
      hover:bg-gray-600 transition-colors group shadow-sm"
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

// Template Item Component
const TemplateItem = ({ label }: { label: string }) => (
  <div className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors group shadow-sm">
    <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
      {label}
    </span>
  </div>
);
