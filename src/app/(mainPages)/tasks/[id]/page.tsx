"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Redo2,
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
  X,
  CheckCircle,
  AlertTriangle,
  Check,
  Download,
  Upload,
} from "lucide-react";
import { debounce } from "lodash";
import axios from "axios";
import axiosRetry from "axios-retry";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GENERAL,
  BROWSER,
  INTERACTION,
  CONTROL_FLOW,
  DATA,
  ADVANCED,
  USER_INTERACTION,
} from "../data/NodeDefinitions";
import { TriggerNode } from "../Node/General/TriggerNode";
import { WorkflowNode } from "../Node/General/WorkflowNode";
import { DelayNode } from "../Node/General/DelayNode";
import { ExportDataNode } from "../Node/General/ExportDataNode";
import { HTTPRequestNode } from "../Node/General/HTTPRequestNode";
import { ClipboardNode } from "../Node/General/ClipBoardNode";
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
import { ErrorHandlerNode } from "../Node/General/ErrorHandlerNode";
import { LogEventNode } from "../Node/General/LogEventNode";
import { SetVariableNode } from "../Node/General/SetVariableNode";
import { ScheduleTimerNode } from "../Node/General/ScheduleTimmerNode";
import { BrowserAuthenticationNode } from "../Node/Browser/BrowserAuthenticationNode";
import { ClearCookiesNode } from "../Node/Browser/ClearCookiesNode";
import { SetUserAgentNode } from "../Node/Browser/SetUserAgentNode";
import { CustomScriptNode } from "../Node/Advance/CustomScriptNode";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { DebugBreakpointNode } from "../Node/Advance/DebugBreakpointNode";
import { ConsoleCommandNode } from "../Node/Advance/ConsoleCommandNode";
import { SystemMonitorNode } from "../Node/Advance/SystemMonitorNode";
import { CloudSyncNode } from "../Node/Advance/CloudSyncNode";
import { DatabaseQueryNode } from "../Node/Data/DatabaseQueryNode";
import { FileInputNode } from "../Node/Data/FileInputNode";
import { FileOutputNode } from "../Node/Data/FileOutputNode";
import { DataTransformNode } from "../Node/Data/DataTransformNode";
import { DataFilterNode } from "../Node/Data/DataFilterNode";
import { DataAggregateNode } from "../Node/Data/DataAggregateNode";
import { PromptUserNode } from "../Node/User Interaction/PromptUserNode";
import { ConfirmDialogNode } from "../Node/User Interaction/ConfirmDialogNode";
import { AlertUserNode } from "../Node/User Interaction/AlertUserNode";
import { SendEmailNode } from "../Node/User Interaction/SendEmailNode";
import { UserProfileNode } from "../Node/User Interaction/UserProfileNode";

// Define types
interface NodeData {
  label: string;
  description?: string;
  output?: any;
  error?: string;
  config?: Record<string, any>;
}

interface CustomNode extends Node<NodeData> {
  label: string;
  data: NodeData;
  description: string;
}

// Node types mapping
const nodeTypes = {
  customTriggerNode: TriggerNode,
  customWorkFlow: WorkflowNode,
  customDelay: DelayNode,
  customExport: ExportDataNode,
  customRequest: HTTPRequestNode,
  customClipBoard: ClipboardNode,
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
  debug: DebugBreakpointNode,
  consoleCommand: ConsoleCommandNode,
  systemMonitor: SystemMonitorNode,
  cloudSync: CloudSyncNode,
  customScript: CustomScriptNode,
  databaseQuery: DatabaseQueryNode,
  fileInput: FileInputNode,
  fileOutput: FileOutputNode,
  dataTransform: DataTransformNode,
  dataFilter: DataFilterNode,
  dataAggregate: DataAggregateNode,
  promptUser: PromptUserNode,
  confirmDialog: ConfirmDialogNode,
  alertUser: AlertUserNode,
  sendEmail: SendEmailNode,
  userProfile: UserProfileNode,
};

// Configure axios with retries
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
});

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
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [workflowTitle, setWorkflowTitle] = useState("New Workflow");
  const [isDirty, setIsDirty] = useState(false);
  const [appError, setAppError] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<
    { nodes: CustomNode[]; edges: Edge[] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const params = useParams();
  const workflowId = params.id as string;
  const { user } = useSession();

  // Use refs to track state changes without triggering re-renders
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const historyIndexRef = useRef(historyIndex);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Update refs when state changes
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // UUID generator
  const uuidv4 = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Helper function to get node category and color
  const getNodeCategoryAndColor = (
    nodeType: string
  ): { category: string; color: string } => {
    const allNodes = [
      ...GENERAL,
      ...BROWSER,
      ...INTERACTION,
      ...CONTROL_FLOW,
      ...DATA,
      ...ADVANCED,
      ...USER_INTERACTION,
    ];
    const nodeDef = allNodes.find((node) => node.type === nodeType);
    const category = nodeDef?.category || "General";
    const categoryColors: Record<string, string> = {
      General: "#6ede87", // Green
      Browser: "#FDE047", // Yellow
      "Web Interaction": "#87EFAC", // Light Green
      "Control Flow": "#92C5FD", // Light Blue
      Data: "#F472B6", // Pink
      Advanced: "#A78BFA", // Purple
      "User Interaction": "#FBBF24", // Amber
    };
    return { category, color: categoryColors[category] || "#6ede87" };
  };

  // Node color function for MiniMap
  const nodeColor = (node: CustomNode): string => {
    return getNodeCategoryAndColor(node.type).color;
  };

  // History management - using refs to avoid infinite update loops
  const saveHistory = useCallback(
    debounce(() => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      const currentHistoryIndex = historyIndexRef.current;

      const currentState = {
        nodes: [...currentNodes],
        edges: [...currentEdges],
      };

      setHistory((prev) => {
        const newHistory = [...prev.slice(0, currentHistoryIndex + 1)];

        const lastState = newHistory[currentHistoryIndex];
        if (
          !lastState ||
          JSON.stringify(lastState.nodes) !==
            JSON.stringify(currentState.nodes) ||
          JSON.stringify(lastState.edges) !== JSON.stringify(currentState.edges)
        ) {
          newHistory.push({
            nodes: currentState.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                label: node.data.label || "Unnamed Node",
              },
            })) as CustomNode[],
            edges: currentState.edges,
          });

          setTimeout(() => {
            setHistoryIndex(newHistory.length - 1);
          }, 0);
        }

        return newHistory;
      });
    }, 300),
    []
  );

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      if (history.length === 0) {
        saveHistory();
      }
    }
  }, [nodes.length, edges.length, history.length, saveHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(
        history[newIndex].nodes as Node<CustomNode, string | undefined>[]
      );
      setEdges(history[newIndex].edges);
      setIsDirty(true);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(
        history[newIndex].nodes as Node<CustomNode, string | undefined>[]
      );
      setEdges(history[newIndex].edges);
      setIsDirty(true);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Drag and drop handlers
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

      const newNode: any = {
        id: uuidv4(),
        type,
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        return updatedNodes;
      });
      setIsDirty(true);
      setTimeout(() => saveHistory(), 0);
    },
    [reactFlowInstance, setNodes, saveHistory]
  );

  // Connection handlers
  const onConnect = useCallback<OnConnect>(
    (connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const { color } = getNodeCategoryAndColor(
        sourceNode?.type || "customTriggerNode"
      );
      const edge: Edge = {
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          // color: "#1F2937",
        },
        style: {
          // stroke: "#1F2937",
          strokeWidth: 2,
          strokeDasharray: "5,5",
          animation: "dash 1.5s linear infinite",
        },
        animated: true,
      };
      setEdges((eds) => {
        const updatedEdges = addEdge(edge, eds);
        return updatedEdges;
      });
      setIsDirty(true);
      setTimeout(() => saveHistory(), 0);
    },
    [setEdges, saveHistory, nodes]
  );

  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => {
        const updatedEdges = eds.filter((e) => e.id !== edge.id);
        return updatedEdges;
      });
      setIsDirty(true);
      setTimeout(() => saveHistory(), 0);
    },
    [setEdges, saveHistory]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setIsDirty(true);
      setTimeout(() => saveHistory(), 0);
    },
    [onNodesChange, saveHistory]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setIsDirty(true);
      setTimeout(() => saveHistory(), 0);
    },
    [onEdgesChange, saveHistory]
  );

  const validateWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      setAppError({
        type: "execution",
        message: "Add at least one node to run the workflow",
      });
      return false;
    }
    if (edges.length === 0 && nodes.length > 1) {
      setAppError({
        type: "execution",
        message: "Connect your nodes to define the workflow",
      });
      return false;
    }
    return true;
  }, [nodes, edges]);

  const runAutomation = useCallback(
    debounce(async () => {
      if (!validateWorkflow()) {
        setIsRunning(false);
        return;
      }
      setIsRunning(true);
      setExecutionResult(null);
      setShowDetails(false);

      try {
        const response = await axios.post(
          "/api/execute",
          { nodes, edges },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const result = response.data;
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
    }, 300),
    [nodes, edges, setNodes, validateWorkflow]
  );

  const saveWorkflow = useCallback(
    debounce(async () => {
      if (!user) {
        setAppError({
          type: "save",
          message: "Please log in to save workflows",
        });
        return;
      }
      setIsSaving(true);
      setAppError(null);
      const previousState = { nodes, edges, workflowTitle };
      setIsDirty(false);

      try {
        const payload = {
          workflowId: workflowId || uuidv4(),
          title: workflowTitle || "Untitled Workflow",
          description: "Auto-generated workflow",
          nodes: nodes.map((node) => ({
            id: node.id,
            name: node.data.label,
            description: node.data?.description || null,
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

        const response = await axios.post("/api/workflows/save", payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Workflow-Save": "true",
          },
        });

        if (!response.status.toString().startsWith("2")) {
          throw new Error(`Failed to save workflow: ${response.statusText}`);
        }
      } catch (error) {
        setNodes(previousState.nodes);
        setEdges(previousState.edges);
        setWorkflowTitle(previousState.workflowTitle);
        setIsDirty(true);
        setAppError({
          type: "save",
          message:
            error instanceof Error ? error.message : "Failed to save workflow",
        });
      } finally {
        setIsSaving(false);
      }
    }, 300),
    [nodes, edges, workflowTitle, workflowId, user]
  );

  const exportWorkflow = useCallback(() => {
    const data = JSON.stringify({ nodes, edges, workflowTitle });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, workflowTitle]);

  const importWorkflow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setNodes(data.nodes);
            setEdges(
              data.edges.map((edge: Edge) => {
                const sourceNode = data.nodes.find(
                  (node: CustomNode) => node.id === edge.source
                );
                const { color } = getNodeCategoryAndColor(
                  sourceNode?.type || "customTriggerNode"
                );
                return {
                  ...edge,
                  type: "smoothstep",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 10,
                    height: 10,
                    // color: "#1F2937",
                  },
                  style: {
                    // stroke: "#1F2937",
                    strokeWidth: 2,
                    strokeDasharray: "5,5",
                    animation: "dash 1.5s linear infinite",
                  },
                  animated: true,
                };
              })
            );
            setWorkflowTitle(data.workflowTitle);
            setIsDirty(true);
            setTimeout(() => saveHistory(), 0);
          } catch (error) {
            setAppError({
              type: "import",
              message: "Invalid workflow file format",
            });
          }
        };
        reader.readAsText(file);
      }
    },
    [setNodes, setEdges, saveHistory]
  );

  const {
    data: workflowData,
    error: fetchError,
    isLoading,
  } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const response = await axios.get(`/api/workflows/${workflowId}`, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    enabled: !!workflowId && !!user,
  });

  useEffect(() => {
    if (workflowData && !isLoading) {
      const { workflow } = workflowData;
      const workflowNodes = (workflow.nodes || []).map((node: any) => ({
        id: node.id,
        type: node.type,
        position: { x: node.positionX ?? 0, y: node.positionY ?? 0 },
        data: {
          label: node.name || "Unnamed Node",
          config: node.config || {},
        },
      }));

      const workflowEdges = (workflow.edges || []).map((edge: any) => {
        const sourceNode = workflowNodes.find(
          (node: CustomNode) => node.id === edge.sourceId
        );
        const { color } = getNodeCategoryAndColor(
          sourceNode?.type || "customTriggerNode"
        );
        return {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            // color: "#1F2937",
          },
          style: {
            // stroke: "#1F2937",
            strokeWidth: 2,
            strokeDasharray: "5,5",
            animation: "dash 1.5s linear infinite",
          },
          animated: true,
        };
      });

      setNodes(workflowNodes);
      setEdges(workflowEdges);
      setWorkflowTitle(workflow.title || "New Workflow");
      setIsDirty(false);

      setTimeout(() => {
        setHistory([{ nodes: workflowNodes, edges: workflowEdges }]);
        setHistoryIndex(0);
      }, 100);
    }
  }, [workflowData, isLoading, setNodes, setEdges]);

  useEffect(() => {
    if (fetchError) {
      setAppError({
        type: "fetch",
        message:
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load workflow",
      });
    }
  }, [fetchError]);

  return (
    <div className="h-screen w-full bg-card text-white flex">
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
      {isSidebarOpen && <NodesPanel />}
      <div
        className={`flex-1 flex flex-col relative ${
          !isSidebarOpen ? "w-full" : ""
        }`}
      >
        {/* Sidebar Toggle Button */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleSidebar}
            className="bg-input border-border text-foreground"
          >
            {isSidebarOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
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

        {/* Top Bar */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo2 className="w-4 h-4 mr-2" /> Undo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo last change</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo2 className="w-4 h-4 mr-2" /> Redo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo last change</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
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
              </TooltipTrigger>
              <TooltipContent>Save workflow</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={exportWorkflow}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export workflow as JSON</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" /> Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importWorkflow}
                        className="hidden"
                      />
                    </span>
                  </Button>
                </label>
              </TooltipTrigger>
              <TooltipContent>Import workflow from JSON</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
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
              </TooltipTrigger>
              <TooltipContent>Run the workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* React Flow Canvas */}
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
          <TooltipProvider>
            <div className="absolute bottom-4 left-4 flex z-10 gap-3 p-3 rounded-lg shadow-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white border-white bg-primary"
                    onClick={() => zoomIn()}
                  >
                    <ZoomIn size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white border-white bg-primary"
                    onClick={() => zoomOut()}
                  >
                    <ZoomOut size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white border-white bg-primary"
                    onClick={() => fitView()}
                  >
                    <RefreshCw size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white border-white bg-primary"
                    onClick={() => fitView({ duration: 800 })}
                  >
                    <Crosshair size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Center View</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={nodeColor}
            className="absolute bottom-16 right-4 border border-primary rounded-lg"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          />
          {executionResult && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md bg-gray-800 p-6 rounded-lg shadow-lg z-20 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Automation Result
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExecutionResult(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </Button>
              </div>
              {executionResult.error ? (
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={24}
                    className="text-red-400 flex-shrink-0"
                  />
                  <div>
                    <p className="text-red-400 font-medium">
                      Something Went Wrong
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {executionResult.error === "Execution failed"
                        ? "We couldn’t complete the task. Please check your setup and try again."
                        : executionResult.error}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={24}
                    className="text-green-400 flex-shrink-0"
                  />
                  <div>
                    <p className="text-green-400 font-medium">Success!</p>
                    <p className="text-sm text-gray-300 mt-1">
                      The automation ran successfully. Here’s what happened:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-200">
                      {Object.entries(executionResult.data || {}).map(
                        ([nodeId, result]: [string, any]) => (
                          <li key={nodeId} className="flex items-center gap-2">
                            {result.error ? (
                              <AlertTriangle
                                size={16}
                                className="text-yellow-400"
                              />
                            ) : (
                              <Check size={16} className="text-green-400" />
                            )}
                            <span>
                              {nodes.find((n) => n.id === nodeId)?.data
                                .description || `Node ${nodeId}`}
                              :{" "}
                              {result.error
                                ? `Failed - ${result.error}`
                                : result.skipped
                                ? "Skipped"
                                : "Completed"}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
              {!executionResult.error && (
                <div className="mt-4">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowDetails((prev) => !prev)}
                    className="text-blue-400 hover:text-blue-300 p-0"
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </Button>
                  {showDetails && (
                    <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-2 rounded-md overflow-auto max-h-40">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
          {appError && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-800 p-4 rounded-lg shadow-lg z-20 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{appError.message}</span>
              <Button variant="ghost" onClick={() => setAppError(null)}>
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

// NodesPanel, PanelSection, and DraggableNode
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
          <Zap size={20} className="text-primary animate-pulse" />
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
                        ? "fill-[#6ede87] stroke-[#6ede87]"
                        : title === "Browser"
                        ? "fill-[#FDE047] stroke-[#FDE047]"
                        : title === "Web Interactions"
                        ? "fill-[#87EFAC] stroke-[#87EFAC]"
                        : title === "Control Flow"
                        ? "fill-[#92C5FD] stroke-[#92C5FD]"
                        : title === "Data"
                        ? "fill-[#F472B6] stroke-[#F472B6]"
                        : title === "Advance"
                        ? "fill-[#A78BFA] stroke-[#A78BFA]"
                        : "fill-[#FBBF24] stroke-[#FBBF24]"
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
    className="p-3 bg-card text-foreground rounded-lg cursor-move hover:bg-primary/9 transition-all duration-150 shadow-sm hover:shadow-md overflow-hidden border border-border"
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
