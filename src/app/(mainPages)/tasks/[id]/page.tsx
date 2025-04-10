"use client";

import { useState, useCallback, useEffect } from "react";
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
  AlertCircle,
} from "lucide-react";
import {
  GENERAL,
  BROWSER,
  INTERACTION,
  CONTROL_FLOW,
  DATA,
  ADVANCED,
  USER_INTERACTION,
} from "../data/Data";
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
import { ErrorHandlerNode } from "../Node/General/ErrorHandlerNode";
import { LogEventNode } from "../Node/General/LogEventNode";
import { SetVariableNode } from "../Node/General/SetVariableNode";
import { ScheduleTimerNode } from "../Node/General/ScheduleTimmerNode";
import { BrowserAuthenticationNode } from "../Node/Browser/BrowserAuthenticationNode";
import { ClearCookiesNode } from "../Node/Browser/ClearCookiesNode";
import { SetUserAgentNode } from "../Node/Browser/SetUserAgentNode";
import { useParams } from "next/navigation";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

// Define types
interface NodeData {
  label: string;
  output?: any;
  error?: string;
  config?: Record<string, any>;
}

// Correct CustomNode to extend Node with NodeData
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
  customErrorHandler: ErrorHandlerNode,
  customLogger: LogEventNode,
  customVariable: SetVariableNode,
  customTimer: ScheduleTimerNode,
  authentication: BrowserAuthenticationNode,
  clearCookies: ClearCookiesNode,
  setUserAgent: SetUserAgentNode,
};

// Create a QueryClient instance
const queryClient = new QueryClient();

const PageWithProvider = () => (
  <ReactFlowProvider>
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  </ReactFlowProvider>
);

export default PageWithProvider;

function Page() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]); // Correct typing
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [workflowTitle, setWorkflowTitle] = useState("New Workflow");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const params = useParams();
  const workflowId = params.id as string;
  const { user } = useSession();

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

      setNodes((nds) => [...nds, newNode]); // Type matches now
      setIsDirty(true);
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
      setIsDirty(true);
    },
    [setEdges]
  );

  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      setIsDirty(true);
    },
    [setEdges]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setIsDirty(true);
    },
    [onNodesChange]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setIsDirty(true);
    },
    [onEdgesChange]
  );

  const runAutomation = useCallback(async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setExecutionResult(result);

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
    } catch (error) {
      setExecutionResult({
        error: error instanceof Error ? error.message : "Execution failed",
      });
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, setNodes]);

  const saveWorkflow = useCallback(async () => {
    if (!user) {
      setError("Please log in to save workflows");
      return;
    }

    if (isSaving) {
      console.log("Save already in progress, skipping");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        workflowId: workflowId || uuidv4(),
        title: workflowTitle || "Untitled Workflow",
        description: "Auto-generated workflow",
        nodes: nodes.map((node) => ({
          id: node.id,
          name: node.data.label,
          type: node.type,
          positionX: node.position.x,
          positionY: node.position.y,
          config: node.data.config || {},
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
        })),
      };

      console.log(
        "Sending save request with payload:",
        JSON.stringify(payload)
      );

      const response = await fetch("/api/workflows/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Workflow-Save": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save workflow: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Workflow saved successfully:", result);
      setIsDirty(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save workflow"
      );
      console.error("Save workflow error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowTitle, workflowId, user, isSaving]);

  // Fetch workflow data using Tanstack Query
  const {
    data: workflowData,
    error: fetchError,
    isLoading,
  } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to load workflow");
      return response.json();
    },
    enabled: !!workflowId && !!user,
  });

  useEffect(() => {
    if (workflowData && !isLoading) {
      const { workflow } = workflowData;
      setNodes(
        (workflow.nodes || []).map((node: any) => ({
          id: node.id,
          type: node.type,
          position: { x: node.positionX ?? 0, y: node.positionY ?? 0 },
          data: {
            label: node.name || "Unnamed Node",
            config: node.config || {},
          },
        }))
      );
      setEdges(
        (workflow.edges || []).map((edge: any) => ({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: "smoothstep",
          markerEnd: { type: MarkerType.Arrow },
        }))
      );
      setWorkflowTitle(workflow.title || "New Workflow");
      setIsDirty(false);
    }
  }, [workflowData, isLoading, setNodes, setEdges]);

  useEffect(() => {
    if (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load workflow"
      );
    }
  }, [fetchError]);

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

  return (
    <div className="h-screen w-full bg-card text-white flex">
      <NodesPanel />
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <div className="relative">
            <Button
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-lg transition-all duration-300 hover:text-primary-foreground"
              onClick={saveWorkflow}
              disabled={isSaving || !user}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
              {isDirty && !isSaving && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-lg transition-all duration-300 hover:text-primary-foreground"
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

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Input
            value={workflowTitle}
            onChange={(e) => {
              setWorkflowTitle(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Workflow Title"
            className="bg-input border-border text-foreground w-48"
          />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <div className="absolute bottom-4 left-4 flex z-10 gap-3 p-3 rounded-lg shadow-lg">
            <Button
              variant="ghost"
              className="text-white border-white bg-primary"
              onClick={() => zoomIn()}
            >
              <ZoomIn size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-primary"
              onClick={() => zoomOut()}
            >
              <ZoomOut size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-primary"
              onClick={() => fitView()}
            >
              <RefreshCw size={20} />
            </Button>
            <Button
              variant="ghost"
              className="text-white border-white bg-primary"
              onClick={() => fitView({ duration: 800 })}
            >
              <Crosshair size={20} />
            </Button>
          </div>
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={nodeColor}
            className="absolute bottom-16 right-4 border border-primary rounded-lg"
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
          {error && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-800 p-4 rounded-lg shadow-lg z-20 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
              <Button variant="ghost" onClick={() => setError(null)}>
                Close
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-20 flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading workflow...</span>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

// NodesPanel, PanelSection, and DraggableNode remain unchanged
const NodesPanel = () => {
  const [searchKeyWords, setSearchKeyWords] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    General: true,
    Browser: true,
    "Web Interactions": true,
    "Control Flow": true,
    Data: true,
    Advance: true,
    "User Interaction": true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-80 h-screen overflow-auto bg-background p-4 border-r border-border flex flex-col gap-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className=" text-primary animate-pulse" />
          <h2 className="text-lg font-semibold text-foreground tracking-wide">
            Workflow Components
          </h2>
        </div>
        <Link href="/workflows">
          <Undo2 className="cursor-pointer text-primary animate-pulse transition-colors" />
        </Link>
      </div>

      <Input
        placeholder="Search components..."
        value={searchKeyWords}
        onChange={(e) => setSearchKeyWords(e.target.value)}
        className="bg-input border-border text-foreground placeholder-foreground focus:ring-2 focus:ring-[#92C5FD] focus:border-transparent rounded-lg py-2 px-3 transition-all"
      />

      <div className="space-y-4">
        {Object.entries({
          General: GENERAL,
          Browser: BROWSER,
          "Web Interactions": INTERACTION,
          "Control Flow": CONTROL_FLOW,
          Data: DATA,
          Advance: ADVANCED,
          "User Interaction": USER_INTERACTION,
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
  <div className="bg-card rounded-xl p-3 shadow-md transition-all duration-200 hover:shadow-lg">
    <div className="flex justify-between items-center">
      <div
        className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:text-gray-100 transition-colors"
        onClick={toggle}
      >
        {icon}
        <span className="tracking-tight text-foreground">{title}</span>
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
    className="p-3 bg-primary text-foreground rounded-lg cursor-move hover:bg-primary/9 transition-all duration-150 shadow-sm hover:shadow-md overflow-hidden border border-border"
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("application/reactflow", type);
      e.dataTransfer.effectAllowed = "move";
    }}
  >
    <span className="text-gray-300 drop-shadow-sm">{icon}</span>
    <p className="text-sm mt-2 text-gray-200 font-medium tracking-tight whitespace-nowrap">
      {label}
    </p>
  </div>
);
