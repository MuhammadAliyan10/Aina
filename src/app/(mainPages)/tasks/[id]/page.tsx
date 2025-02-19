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
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Zap, FolderPlus, Globe, Chrome, Search } from "lucide-react";
import { GENERAL, BROWSER, INTERACTION } from "../data/Data";
import { TriggerNode } from "../Node/TriggerNode";
import { WorkflowNode } from "../Node/WorkflowNode";
import { DelayNode } from "../Node/DelayNode";
import { ExportDataNode } from "../Node/ExportDataNode";
import { HTTPRequestNode } from "../Node/HTTPRequestNode";
import { ClipBoardNode } from "../Node/ClipBoardNode";
import { WaitConnectionNode } from "../Node/WaitConnectionNode";
import { NotificationNode } from "../Node/NotificationNode";
import { NoteNode } from "../Node/NoteNode";
import { ActiveTabNode } from "../Node/ActiveTabNode";
import { NewTabNode } from "../Node/NewTabNode";
import { SwitchTabsNode } from "../Node/SwitchTabsNode";
import { NewWindowNode } from "../Node/NewWindowNode";
import { ProxyNode } from "../Node/ProxyNode";
import { CloseTabNode } from "../Node/CloseTabNode";
import { GoBackNode } from "../Node/GoBackNode";
import { GoForwardNode } from "../Node/GoForwardNode";
import { ScreenShotNode } from "../Node/ScreenShotNode";
import { Input } from "@/components/ui/input";

const nodeTypes = {
  customTriggerNode: TriggerNode,
  customWorkFlow: WorkflowNode,
  customDelay: DelayNode,
  customExport: ExportDataNode,
  customRequest: HTTPRequestNode,
  customClipBoard: ClipBoardNode,
  customWaitConnections: WaitConnectionNode,
  customNotifications: NotificationNode,
  customNotes: NoteNode,
  activeTab: ActiveTabNode,
  newTab: NewTabNode,
  switchTabs: SwitchTabsNode,
  newWindow: NewWindowNode,
  proxy: ProxyNode,
  closeTabs: CloseTabNode,
  goBack: GoBackNode,
  goForward: GoForwardNode,
  takeScreenShot: ScreenShotNode,
};

export default function Page() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<{ label: string }>[]
  >([
    {
      id: "1",
      type: "customTriggerNode",
      position: { x: 250, y: 150 },
      data: { label: "Trigger" },
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
  const onConnect = useCallback((connection: Connection) => {
    const edgeWithArrow = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}`,
      arrowHeadType: MarkerType.Arrow,
      style: { strokeWidth: 3, stroke: "#3b82f6" },
    };
    setEdges((eds) => addEdge(edgeWithArrow, eds));
  }, []);

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

// const [searchComponents, setSearchComponents] = useState("");
// const [filteredComponents, setFilteredComponents] = useState([]);
// const allData = [...GENERAL, ...BROWSER, INTERACTION];

const NodesPanel = () => (
  <div className="w-80 h-screen overflow-auto bg-[#27272A] p-4 border-r border-gray-800 flex flex-col gap-4">
    <div className="flex items-center gap-2 mb-4">
      <Zap size={20} className="text-blue-400" />
      <h2 className="text-lg font-semibold">Workflow Components</h2>
    </div>

    <div className="group relative">
      <Input
        // value={searchComponents}
        // onChange={(e) => setSearchComponents(e.target.value)}
        placeholder={"Search....."}
        className="border border-white bg-[#313134] py-2 px-2"
      />
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
  <div className="bg-[#313134] rounded-lg p-2">
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
    className="p-3 bg-[#27272A] rounded-lg cursor-move hover:bg-gray-600 transition-colors shadow-sm"
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
