"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Background,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
  Node,
  MarkerType,
  addEdge,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Zap,
  Circle,
  Undo2,
  Save,
  Play,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Crosshair,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { GENERAL, BROWSER, INTERACTION, CONTROL_FLOW } from "../data/Data";
import { TriggerNode } from "../Node/General/TriggerNode";
import { WorkflowNode } from "../Node/General/WorkflowNode";
import { DelayNode } from "../Node/General/DelayNode";
import { ExportDataNode } from "../Node/General/ExportDataNode";
import { HTTPRequestNode } from "../Node/General/HTTPRequestNode";
import { ClipBoardNode } from "../Node/General/ClipBoardNode";
import { WaitConnectionNode } from "../Node/General/WaitConnectionNode";
import { NotificationNode } from "../Node/General/NotificationNode";
import { NoteNode } from "../Node/General/NoteNode";
import { ActiveTabNode } from "../Node/Browser/ActiveTabNode";
import { NewTabNode } from "../Node/Browser/NewTabNode";
import { SwitchTabsNode } from "../Node/Browser/SwitchTabsNode";
import { NewWindowNode } from "../Node/Browser/NewWindowNode";
import { ProxyNode } from "../Node/Browser/ProxyNode";
import { CloseTabNode } from "../Node/Browser/CloseTabNode";
import { GoBackNode } from "../Node/Browser/GoBackNode";
import { GoForwardNode } from "../Node/Browser/GoForwardNode";
import { ScreenShotNode } from "../Node/Browser/ScreenShotNode";
import { BrowserEventNode } from "../Node/Browser/BrowserEventNode";
import { HandleDownloadNode } from "../Node/Browser/HandleDownloadNode";
import { ReloadTabNode } from "../Node/Browser/ReloadTabNode";
import { GetURLNode } from "../Node/Browser/GetURLNode";
import { ClickElementNode } from "../Node/Web Interaction/ClickElementNode";
import { GetTextNode } from "../Node/Web Interaction/GetTextNode";
import { ScrollElementNode } from "../Node/Web Interaction/ScrollEventNode";
import { LinkEventNode } from "../Node/Web Interaction/LinkElementNode";
import { GetAttributeNode } from "../Node/Web Interaction/AttributeVariableNode";
import { FillFormNode } from "../Node/Web Interaction/FormsNode";
import { JavaScriptCodeNode } from "../Node/Web Interaction/JavaScriptCodeNode";
import { TriggerEventNode } from "../Node/Web Interaction/TriggerEventNode";
import { SwitchFrameNode } from "../Node/Web Interaction/SwitchFrameNode";
import { UploadFileNode } from "../Node/Web Interaction/UploadFileNode";
import { HoverElementNode } from "../Node/Web Interaction/HoverElementNode";
import { SaveAssetsNode } from "../Node/Web Interaction/SaveAssetsNode";
import { PressKeyNode } from "../Node/Web Interaction/PressKeyNode";
import { CreateElementNode } from "../Node/Web Interaction/CreateElementNode";
import { RepeatTaskNode } from "../Node/Control Flow/RepeatTaskNode";
import { ConditionsNode } from "../Node/Control Flow/ConditionsNode";
import { ElementExistNode } from "../Node/Control Flow/ElementExistNode";
import { WhileLoopNode } from "../Node/Control Flow/WhileLoppNode";
import { LoopDataNode } from "../Node/Control Flow/LoopDataNode";
import { LoopElementNode } from "../Node/Control Flow/LoopElementNode";
import { LoopBreakNode } from "../Node/Control Flow/LoopBreakNode";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define types
interface NodeData {
  label: string;
  output?: any;
  error?: string;
  config?: Record<string, any>;
}

interface CustomNode extends Node<NodeData> {
  data: NodeData;
}

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
  browserEvent: BrowserEventNode,
  handleDownload: HandleDownloadNode,
  reloadTab: ReloadTabNode,
  getTabURL: GetURLNode,
  customClickElement: ClickElementNode,
  customGetText: GetTextNode,
  customScrollElement: ScrollElementNode,
  customLink: LinkEventNode,
  customAttributeVariable: GetAttributeNode,
  customForms: FillFormNode,
  customJavaScript: JavaScriptCodeNode,
  customTriggerEvent: TriggerEventNode,
  customSwitchFrame: SwitchFrameNode,
  customUploadFile: UploadFileNode,
  customHoverElement: HoverElementNode,
  customSaveAssets: SaveAssetsNode,
  customPressKey: PressKeyNode,
  customCreateElement: CreateElementNode,
  repeatTask: RepeatTaskNode,
  conditions: ConditionsNode,
  elementExist: ElementExistNode,
  whileLoop: WhileLoopNode,
  loopData: LoopDataNode,
  loopElement: LoopElementNode,
  loopBreak: LoopBreakNode,
};

class AutomationExecutor {
  private nodes: CustomNode[];
  private edges: Edge[];
  private nodeOutputs: Map<string, any>; // Store outputs by node ID

  constructor(nodes: CustomNode[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeOutputs = new Map();
  }

  async execute(): Promise<any> {
    try {
      const triggerNode = this.nodes.find(
        (n) => n.type === "customTriggerNode"
      );
      if (!triggerNode) throw new Error("No trigger node found");

      const result = await this.processNode(triggerNode);
      return {
        data: Object.fromEntries(this.nodeOutputs),
        result,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async processNode(node: CustomNode, inputData?: any): Promise<any> {
    try {
      // Get input from previous nodes
      const incomingEdges = this.edges.filter((e) => e.target === node.id);
      const inputs = incomingEdges
        .map((edge) => this.nodeOutputs.get(edge.source))
        .filter((output) => output !== undefined);

      // Default to provided inputData if no incoming edges, otherwise use first input
      const effectiveInput = inputs.length > 0 ? inputs[0] : inputData;

      let outputData: any;
      switch (node.type) {
        case "customTriggerNode":
          outputData = { started: true, timestamp: Date.now() };
          break;
        case "customDelay":
          await new Promise((resolve) =>
            setTimeout(resolve, node.data.config?.delay || 1000)
          );
          outputData = effectiveInput;
          break;
        case "newTab":
          outputData = { url: node.data.config?.url || "https://example.com" }; // Example URL output
          break;
        case "getTabURL":
          outputData = { url: effectiveInput?.url || "No URL provided" }; // Uses URL from previous node
          break;
        case "customRequest":
          // Simulate an HTTP request using input URL if available
          outputData = {
            response: effectiveInput?.url
              ? `Fetched data from ${effectiveInput.url}`
              : "No URL provided",
          };
          break;
        // Add more node-specific logic here as needed
        default:
          outputData = effectiveInput; // Pass through by default
      }

      // Store the output for this node
      this.nodeOutputs.set(node.id, outputData);

      // Process next nodes
      const nextEdges = this.edges.filter((e) => e.source === node.id);
      const results = await Promise.all(
        nextEdges.map((edge) => {
          const targetNode = this.nodes.find((n) => n.id === edge.target);
          return targetNode ? this.processNode(targetNode) : null; // No inputData passed directly, relies on nodeOutputs
        })
      );

      return { data: outputData, next: results.filter((r) => r !== null) };
    } catch (error) {
      this.nodeOutputs.set(node.id, {
        error: error instanceof Error ? error.message : "Node execution failed",
      });
      return {
        error: error instanceof Error ? error.message : "Node execution failed",
      };
    }
  }
}

const PageWithProvider = () => (
  <ReactFlowProvider>
    <Page />
  </ReactFlowProvider>
);

export default PageWithProvider;

function Page() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode[]>([
    {
      id: "1",
      type: "customTriggerNode",
      position: { x: 250, y: 150 },
      data: { label: "Trigger" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const uuidv4 = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CustomNode = {
        id: uuidv4(),
        type,
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onConnect = useCallback<OnConnect>(
    (connection) => {
      const edge: Edge = {
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: "smoothstep",
        markerEnd: { type: MarkerType.Arrow },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const runAutomation = useCallback(async () => {
    setIsRunning(true);
    setExecutionResult(null);

    const executor = new AutomationExecutor(nodes, edges);
    const result = await executor.execute();

    setExecutionResult(result);
    setIsRunning(false);

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          output: result.data?.[node.id],
          error:
            result.data?.[node.id]?.error ||
            (result.error && node.id === "1" ? result.error : undefined),
        },
      }))
    );
  }, [nodes, edges, setNodes]);

  const nodeColor = (node: CustomNode): string => {
    switch (node.type) {
      case "customTriggerNode":
        return "#6ede87";
      case "customDelay":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  };

  const handleNodesChange: OnNodesChange = onNodesChange;
  const handleEdgesChange: OnEdgesChange = onEdgesChange;

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex">
      <NodesPanel />
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button variant="outline" className="text-white border-white">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button
            variant="ghost"
            className="text-white border border-white bg-transparent disabled:opacity-50"
            onClick={runAutomation}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? "Running..." : "Run Automation"}
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <div className="absolute bottom-4 left-4 flex z-10 gap-3 p-3 rounded-lg shadow-lg">
            <Button
              variant="ghost"
              className="text-white border-white bg-[#27272A]"
              onClick={() => zoomIn()}
            >
              <ZoomIn size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-[#27272A]"
              onClick={() => zoomOut()}
            >
              <ZoomOut size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-[#27272A]"
              onClick={() => fitView()}
            >
              <RefreshCw size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-[#27272A]"
              onClick={() => fitView({ duration: 800 })}
            >
              <Crosshair size={20} />
            </Button>
          </div>
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={nodeColor}
            className="absolute bottom-16 right-4 border border-white rounded-lg"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          />
          {executionResult && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-20">
              <h3 className="text-lg font-semibold mb-2">Execution Result</h3>
              {executionResult.error ? (
                <div className="text-red-400">
                  Error: {executionResult.error}
                </div>
              ) : (
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              )}
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setExecutionResult(null)}
              >
                Close
              </Button>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

const NodesPanel = () => {
  const [searchKeyWords, setSearchKeyWords] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    General: true,
    Browser: true,
    "Web Interactions": true,
    "Control Flow": true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-80 h-screen overflow-auto bg-[#1E1E20] p-4 border-r border-[#2D2D30] flex flex-col gap-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-[#92C5FD] drop-shadow-sm" />
          <h2 className="text-lg font-semibold text-gray-100 tracking-wide">
            Workflow Components
          </h2>
        </div>
        <Link href="/Workflow">
          <Undo2 className="cursor-pointer text-gray-400 hover:text-[#92C5FD] transition-colors" />
        </Link>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search components..."
        value={searchKeyWords}
        onChange={(e) => setSearchKeyWords(e.target.value)}
        className="bg-[#2A2A2C] border-[#3A3A3C] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#92C5FD] focus:border-transparent rounded-lg py-2 px-3 transition-all"
      />

      {/* Sections */}
      <div className="space-y-4">
        {Object.entries({
          General: GENERAL,
          Browser: BROWSER,
          "Web Interactions": INTERACTION,
          "Control Flow": CONTROL_FLOW,
        }).map(([title, items]) => {
          const filteredItems = items.filter((item) =>
            item.label.toLowerCase().includes(searchKeyWords.toLowerCase())
          );

          return (
            (filteredItems.length > 0 || !searchKeyWords) && (
              <PanelSection
                key={title}
                title={title}
                isOpen={openSections[title]}
                toggle={() => toggleSection(title)}
                icon={
                  <Circle
                    size={13}
                    className={`${
                      title === "General"
                        ? "fill-[#000000] stroke-[#000000]"
                        : title === "Browser"
                        ? "fill-[#FDE047] stroke-[#FDE047]"
                        : title === "Web Interactions"
                        ? "fill-[#87EFAC] stroke-[#87EFAC]"
                        : "fill-[#92C5FD] stroke-[#92C5FD]"
                    } drop-shadow-sm`}
                  />
                }
              >
                {(searchKeyWords ? filteredItems : items).map((item) => (
                  <DraggableNode
                    key={item.id}
                    type={item.type}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </PanelSection>
            )
          );
        })}
      </div>
    </div>
  );
};

interface PanelSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
  children: React.ReactNode;
}

const PanelSection = ({
  title,
  icon,
  isOpen,
  toggle,
  children,
}: PanelSectionProps) => (
  <div className="bg-[#252527] rounded-xl p-3 shadow-md transition-all duration-200 hover:shadow-lg">
    <div className="flex justify-between items-center">
      <div
        className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:text-gray-100 transition-colors"
        onClick={toggle}
      >
        {icon}
        <span className="tracking-tight">{title}</span>
      </div>
      <div
        onClick={toggle}
        className="cursor-pointer text-gray-400 hover:text-[#92C5FD] w-5 h-5 flex items-center justify-center rounded-full bg-[#313134] transition-colors"
      >
        {isOpen ? <Minus /> : <Plus />}
      </div>
    </div>
    {isOpen && (
      <div className="grid grid-cols-2 gap-2 mt-3 transition-all duration-200">
        {children}
      </div>
    )}
  </div>
);

interface DraggableNodeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const DraggableNode = ({ type, label, icon }: DraggableNodeProps) => (
  <div
    className="p-3 bg-[#2A2A2C] rounded-lg cursor-move hover:bg-[#353538] transition-all duration-150 shadow-sm hover:shadow-md  overflow-hidden border border-[#3A3A3C]"
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("application/reactflow", type);
      e.dataTransfer.effectAllowed = "move";
    }}
  >
    <span className="text-gray-300 drop-shadow-sm">{icon}</span>
    <p className="text-sm mt-2 text-gray-200 font-medium tracking-tight whitespace-nowrap ">
      {label}
    </p>
  </div>
);
