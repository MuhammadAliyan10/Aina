"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Zap,
  FolderPlus,
  Globe,
  Chrome,
  Search,
  Plus,
  Minus,
  Circle,
  Undo2,
  Save,
  Play,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Crosshair,
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
import { Input } from "@/components/ui/input";
import { BrowserEventNode } from "../Node/Browser/BrowserEventNode";
import { HandleDownloadNode } from "../Node/Browser/HandleDownloadNode";
import { ReloadTabNode } from "../Node/Browser/ReloadTabNode";
import { GetURLNode } from "../Node/Browser/GetURLNode";
import { ClickElementNode } from "../Node/Web Interaction/ClickElementNode";
import { GetTextNode } from "../Node/Web Interaction/GetTextNode";
import { ScrollEventNode } from "../Node/Web Interaction/ScrollEventNode";
import { LinkEventNode } from "../Node/Web Interaction/LinkElementNode";
import { AttributeVariableNode } from "../Node/Web Interaction/AttributeVariableNode";
import { FormsNode } from "../Node/Web Interaction/FormsNode";
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
  customScrollElement: ScrollEventNode,
  customLink: LinkEventNode,
  customAttributeVariable: AttributeVariableNode,
  customForms: FormsNode,
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

const PageWithProvider = () => (
  <ReactFlowProvider>
    <Page />
  </ReactFlowProvider>
);
export default PageWithProvider;

function Page() {
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
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  function nodeColor(node: any) {
    switch (node.parent) {
      case "interaction":
        return "#6ede87";
      case "output":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  }

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex">
      <NodesPanel />
      <div className="flex-1 flex flex-col relative">
        {/* Top-Right Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button variant="outline" className="text-white border-white">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button
            variant="ghost"
            className="text-white border border-white bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" /> Run Automation
          </Button>
        </div>

        {/* React Flow Canvas */}
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

          {/* MiniMap for Navigation (Transparent Background) */}
          <MiniMap
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.2)"
            nodeColor={nodeColor}
            className="absolute bottom-16 right-4 border border-white rounded-lg"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Change the background color here
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// const [searchComponents, setSearchComponents] = useState("");
// const [filteredComponents, setFilteredComponents] = useState([]);
// const allData = [...GENERAL, ...BROWSER, INTERACTION];

const NodesPanel = () => {
  const [searchKeyWords, setSearchKeyWords] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    General: true,
    Browser: true,
    "Web Interactions": true,
    CONTROL_FLOW: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-80 h-screen overflow-auto bg-[#27272A] p-4 border-r border-gray-800 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold">Workflow Components</h2>
        </div>
        <div>
          <Link href={"/Workflow"}>
            <Undo2 className="cursor-pointer" />
          </Link>
        </div>
      </div>

      <div className="group relative">
        <Input
          placeholder="Search components..."
          value={searchKeyWords}
          onChange={(e) => setSearchKeyWords(e.target.value)}
          className="border border-white bg-[#313134] py-2 px-2"
        />
      </div>
      <div className="space-y-2">
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
            filteredItems.length > 0 &&
            searchKeyWords && (
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
                        ? "bg-black text-black"
                        : title === "Browser"
                        ? "bg-[#fde047] text-[#fde047]"
                        : title === "Web Interactions"
                        ? "bg-[#87EFAC] text-[#87EFAC]"
                        : "bg-[#92C5FD] text-[#92C5FD]"
                    } rounded-full`}
                  />
                }
              >
                {filteredItems.map((item) => (
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

      <div className="space-y-2">
        <PanelSection
          title="General"
          isOpen={openSections["General"]}
          toggle={() => toggleSection("General")}
          icon={
            <Circle size={16} className="bg-black text-black rounded-full" />
          }
        >
          {GENERAL.map((item) => (
            <DraggableNode
              type={item.type}
              icon={item.icon}
              label={item.label}
              key={item.id}
            />
          ))}
        </PanelSection>

        <PanelSection
          title="Browser"
          isOpen={openSections["Browser"]}
          toggle={() => toggleSection("Browser")}
          icon={
            <Circle
              size={13}
              className="bg-[#fde047] rounded-full text-[#fde047]"
            />
          }
        >
          {BROWSER.map((item) => (
            <DraggableNode
              type={item.type}
              icon={item.icon}
              label={item.label}
              key={item.id}
            />
          ))}
        </PanelSection>

        <PanelSection
          title="Web Interactions"
          isOpen={openSections["Web Interactions"]}
          toggle={() => toggleSection("Web Interactions")}
          icon={
            <Circle
              size={13}
              className="bg-[#87EFAC] rounded-full text-[#87EFAC]"
            />
          }
        >
          {INTERACTION.map((item) => (
            <DraggableNode
              type={item.type}
              icon={item.icon}
              label={item.label}
              key={item.id}
            />
          ))}
        </PanelSection>

        <PanelSection
          title="Control Flow"
          isOpen={openSections["Control Flow"]}
          toggle={() => toggleSection("Control Flow")}
          icon={
            <Circle
              size={13}
              className="bg-[#92C5FD] rounded-full text-[#92C5FD]"
            />
          }
        >
          {CONTROL_FLOW.map((item) => (
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
};

const PanelSection = ({
  title,
  icon,
  isOpen,
  toggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-[#313134] rounded-lg p-2">
    <div className="flex justify-between items-center">
      <div
        className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-300 cursor-pointer"
        onClick={toggle}
      >
        {icon}
        {title}
      </div>
      <div onClick={toggle} className="cursor-pointer">
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </div>
    </div>
    {isOpen && (
      <div className="gap-2 grid grid-cols-2 transition-all mt-2">
        {children}
      </div>
    )}
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
