import {
  Play,
  Workflow,
  Timer,
  Download,
  Globe,
  Boxes,
  Clipboard,
  ClockAlert,
  AlertCircle,
  NotebookPen,
  Settings,
  Command,
  PanelsTopLeft,
  ArrowLeftRight,
  Shield,
  Undo2,
  Redo2,
  CircleX,
  Image,
  Lightbulb,
  MessageCircle,
  MonitorDown,
  RotateCcw,
  Link2,
  MousePointerClick,
  LetterText,
  Mouse,
  Brackets,
  ClipboardList,
  Code,
  Upload,
  Keyboard,
  Heading1,
  Bell,
  Repeat2,
  Split,
  LocateFixed,
  Infinity,
  RefreshCw,
  RefreshCwOff,
  Lock,
  FileOutput,
  FileInput,
  Database,
  Bug,
  FileText,
  User,
  Mail,
} from "lucide-react";

// Define a type for node definitions
interface NodeDefinition {
  id: number;
  type: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  supportedInputs?: string[]; // Data types this node can accept
  supportedOutputs?: string[]; // Data types this node can produce
}

export const GENERAL: NodeDefinition[] = [
  {
    id: 0,
    type: "customTriggerNode",
    label: "Trigger Workflow",
    category: "Workflow",
    icon: <Play size={16} />,
    description:
      "Initiates the workflow execution based on a specified event or schedule.",
    supportedOutputs: ["timestamp", "boolean"],
  },
  {
    id: 1,
    type: "customWorkFlow",
    label: "Execute Sub-Workflow",
    category: "Workflow",
    icon: <Workflow size={16} />,
    description: "Runs a nested sub-workflow or reusable process.",
    supportedInputs: ["any"],
    supportedOutputs: ["any"],
  },
  {
    id: 2,
    type: "customDelay",
    label: "Delay Execution",
    category: "Timing",
    icon: <Timer size={16} />,
    description: "Pauses the workflow for a specified duration.",
    supportedInputs: ["number"],
  },
  {
    id: 3,
    type: "customExport",
    label: "Export Data",
    category: "Data",
    icon: <Download size={16} />,
    description: "Exports data to a file or external system (e.g., CSV, JSON).",
    supportedInputs: ["object", "array"],
  },
  {
    id: 4,
    type: "customRequest",
    label: "HTTP Request",
    category: "Network",
    icon: <Globe size={16} />,
    description:
      "Makes HTTP requests (GET, POST, etc.) to APIs or web services.",
    supportedInputs: ["string", "object"],
    supportedOutputs: ["object", "string"],
  },
  {
    id: 5,
    type: "customClipBoard",
    label: "Clipboard Operations",
    category: "Utilities",
    icon: <Clipboard size={16} />,
    description: "Reads from or writes to the system clipboard.",
    supportedInputs: ["string"],
    supportedOutputs: ["string"],
  },
  {
    id: 6,
    type: "customWaitConnections",
    label: "Wait for Connection",
    category: "Timing",
    icon: <ClockAlert size={16} />,
    description: "Pauses execution until a network connection is available.",
    supportedInputs: ["string"],
  },
  {
    id: 7,
    type: "customNotifications",
    label: "Send Notification",
    category: "Communication",
    icon: <Bell size={16} />,
    description: "Sends notifications via email, SMS, or system alerts.",
    supportedInputs: ["string", "object"],
  },
  {
    id: 8,
    type: "customNotes",
    label: "Documentation Note",
    category: "Documentation",
    icon: <NotebookPen size={16} />,
    description: "Adds documentation or comments to the workflow.",
    supportedInputs: ["string"],
  },
  {
    id: 9,
    type: "customErrorHandler",
    label: "Error Handler",
    category: "Error Handling",
    icon: <AlertCircle size={16} />,
    description: "Catches and handles errors in the workflow.",
    supportedInputs: ["error"],
    supportedOutputs: ["boolean", "string"],
  },
  {
    id: 10,
    type: "customLogger",
    label: "Log Event",
    category: "Utilities",
    icon: <FileText size={16} />,
    description: "Logs events or data to a file or console for debugging.",
    supportedInputs: ["any"],
  },
];

export const BROWSER: NodeDefinition[] = [
  {
    id: 0,
    type: "activeTab",
    label: "Get Active Tab",
    category: "Browser",
    icon: <PanelsTopLeft size={16} />,
    description:
      "Retrieves information about the currently active browser tab.",
    supportedOutputs: ["object"],
  },
  {
    id: 1,
    type: "newTab",
    label: "Open New Tab",
    category: "Browser",
    icon: <Globe size={16} />,
    description: "Opens a new browser tab with a specified URL.",
    supportedInputs: ["string"],
  },
  {
    id: 2,
    type: "switchTabs",
    label: "Switch Browser Tabs",
    category: "Browser",
    icon: <ArrowLeftRight size={16} />,
    description: "Switches focus between open browser tabs.",
    supportedInputs: ["number", "string"],
  },
  {
    id: 3,
    type: "newWindow",
    label: "Open New Window",
    category: "Browser",
    icon: <PanelsTopLeft size={16} />,
    description: "Opens a new browser window.",
    supportedInputs: ["string"],
  },
  {
    id: 4,
    type: "proxy",
    label: "Set Proxy",
    category: "Browser",
    icon: <Shield size={16} />,
    description: "Configures proxy settings for browser requests.",
    supportedInputs: ["object"],
  },
  {
    id: 5,
    type: "closeTabs",
    label: "Close Tabs",
    category: "Browser",
    icon: <CircleX size={16} />,
    description: "Closes specified browser tabs.",
    supportedInputs: ["string", "array"],
  },
  {
    id: 6,
    type: "goBack",
    label: "Navigate Back",
    category: "Browser",
    icon: <Undo2 size={16} />,
    description: "Navigates back in the browser history.",
  },
  {
    id: 7,
    type: "goForward",
    label: "Navigate Forward",
    category: "Browser",
    icon: <Redo2 size={16} />,
    description: "Navigates forward in the browser history.",
  },
  {
    id: 8,
    type: "takeScreenShot",
    label: "Capture Screenshot",
    category: "Browser",
    icon: <Image size={16} />,
    description: "Captures a screenshot of the current browser view.",
    supportedOutputs: ["buffer", "string"],
  },
  {
    id: 9,
    type: "browserEvent",
    label: "Monitor Browser Event",
    category: "Browser",
    icon: <Lightbulb size={16} />,
    description: "Listens for and reacts to browser events (e.g., page load).",
    supportedOutputs: ["object"],
  },
  {
    id: 10,
    type: "handleDownload",
    label: "Manage Download",
    category: "Browser",
    icon: <MonitorDown size={16} />,
    description: "Handles file downloads from the browser.",
    supportedInputs: ["string"],
    supportedOutputs: ["string"],
  },
  {
    id: 11,
    type: "reloadTab",
    label: "Reload Tab",
    category: "Browser",
    icon: <RotateCcw size={16} />,
    description: "Reloads the current browser tab.",
  },
  {
    id: 12,
    type: "getTabURL",
    label: "Get Tab URL",
    category: "Browser",
    icon: <Link2 size={16} />,
    description: "Retrieves the URL of the specified browser tab.",
    supportedOutputs: ["string"],
  },
  {
    id: 13,
    type: "authentication",
    label: "Browser Authentication",
    category: "Browser",
    icon: <Lock size={16} />,
    description: "Manages browser authentication (e.g., login forms, OAuth).",
    supportedInputs: ["object"],
  },
];

export const INTERACTION: NodeDefinition[] = [
  {
    id: 0,
    type: "customClickElement",
    label: "Click Element",
    category: "Web Interaction",
    icon: <MousePointerClick size={16} />,
    description: "Simulates a click on a specified web element.",
    supportedInputs: ["string"],
  },
  {
    id: 1,
    type: "customGetText",
    label: "Extract Text",
    category: "Web Interaction",
    icon: <LetterText size={16} />,
    description: "Extracts text content from a web element.",
    supportedInputs: ["string"],
    supportedOutputs: ["string"],
  },
  {
    id: 2,
    type: "customScrollElement",
    label: "Scroll to Element",
    category: "Web Interaction",
    icon: <Mouse size={16} />,
    description: "Scrolls the page to a specified element or position.",
    supportedInputs: ["string", "number"],
  },
  {
    id: 3,
    type: "customLink",
    label: "Follow Link",
    category: "Web Interaction",
    icon: <Link2 size={16} />,
    description: "Navigates to a URL specified in a hyperlink.",
    supportedInputs: ["string"],
  },
  {
    id: 4,
    type: "customAttributeVariable",
    label: "Get Attribute",
    category: "Web Interaction",
    icon: <Brackets size={16} />,
    description: "Retrieves an attribute value from a web element.",
    supportedInputs: ["string"],
    supportedOutputs: ["string"],
  },
  {
    id: 5,
    type: "customForms",
    label: "Form Operations",
    category: "Web Interaction",
    icon: <ClipboardList size={16} />,
    description: "Fills out or submits web forms.",
    supportedInputs: ["object"],
  },
  {
    id: 6,
    type: "customJavaScript",
    label: "Execute JavaScript",
    category: "Web Interaction",
    icon: <Code size={16} />,
    description: "Executes custom JavaScript code in the browser.",
    supportedInputs: ["string"],
    supportedOutputs: ["any"],
  },
  {
    id: 7,
    type: "customTriggerEvent",
    label: "Trigger DOM Event",
    category: "Web Interaction",
    icon: <Lightbulb size={16} />,
    description: "Triggers a specified DOM event on an element.",
    supportedInputs: ["string"],
  },
  {
    id: 8,
    type: "customSwitchFrame",
    label: "Switch Frame",
    category: "Web Interaction",
    icon: <ArrowLeftRight size={16} />,
    description: "Switches context to an iframe or back to main content.",
    supportedInputs: ["string"],
  },
  {
    id: 9,
    type: "customUploadFile",
    label: "Upload File",
    category: "Web Interaction",
    icon: <Upload size={16} />,
    description: "Uploads a file to a web form.",
    supportedInputs: ["string"],
  },
  {
    id: 10,
    type: "customHoverElement",
    label: "Hover Element",
    category: "Web Interaction",
    icon: <MousePointerClick size={16} />,
    description: "Simulates hovering over a web element.",
    supportedInputs: ["string"],
  },
  {
    id: 11,
    type: "customSaveAssets",
    label: "Download Assets",
    category: "Web Interaction",
    icon: <Image size={16} />,
    description: "Downloads assets (images, files) from a webpage.",
    supportedInputs: ["string"],
    supportedOutputs: ["buffer"],
  },
  {
    id: 12,
    type: "customPressKey",
    label: "Press Key",
    category: "Web Interaction",
    icon: <Keyboard size={16} />,
    description: "Simulates pressing a keyboard key.",
    supportedInputs: ["string"],
  },
  {
    id: 13,
    type: "customCreateElement",
    label: "Create DOM Element",
    category: "Web Interaction",
    icon: <Heading1 size={16} />,
    description: "Creates a new DOM element on the page.",
    supportedInputs: ["object"],
  },
];

export const CONTROL_FLOW: NodeDefinition[] = [
  {
    id: 0,
    type: "repeatTask",
    label: "Repeat Task",
    category: "Control Flow",
    icon: <Repeat2 size={16} />,
    description: "Repeats a task a specified number of times.",
    supportedInputs: ["number"],
  },
  {
    id: 1,
    type: "conditions",
    label: "Conditional Branch",
    category: "Control Flow",
    icon: <Split size={16} />,
    description: "Executes different paths based on a condition.",
    supportedInputs: ["boolean", "string", "number"],
    supportedOutputs: ["boolean"],
  },
  {
    id: 2,
    type: "elementExist",
    label: "Check Element Exists",
    category: "Control Flow",
    icon: <LocateFixed size={16} />,
    description: "Checks if a specified element exists on the page.",
    supportedInputs: ["string"],
    supportedOutputs: ["boolean"],
  },
  {
    id: 3,
    type: "whileLoop",
    label: "While Loop",
    category: "Control Flow",
    icon: <Infinity size={16} />,
    description: "Executes a loop while a condition is true.",
    supportedInputs: ["boolean"],
  },
  {
    id: 4,
    type: "loopData",
    label: "Loop Through Data",
    category: "Control Flow",
    icon: <RefreshCw size={16} />,
    description: "Iterates over an array or dataset.",
    supportedInputs: ["array"],
    supportedOutputs: ["any"],
  },
  {
    id: 5,
    type: "loopElement",
    label: "Loop Through Elements",
    category: "Control Flow",
    icon: <RotateCcw size={16} />,
    description: "Iterates over a collection of web elements.",
    supportedInputs: ["string"],
    supportedOutputs: ["object"],
  },
  {
    id: 6,
    type: "loopBreak",
    label: "Break Loop",
    category: "Control Flow",
    icon: <RefreshCwOff size={16} />,
    description: "Exits the current loop execution.",
  },
  {
    id: 7,
    type: "databaseQuery",
    label: "Database Query",
    category: "Data",
    icon: <Database size={16} />,
    description: "Executes a query against a database.",
    supportedInputs: ["string"],
    supportedOutputs: ["array", "object"],
  },
  {
    id: 8,
    type: "fileInput",
    label: "Read File",
    category: "Data",
    icon: <FileInput size={16} />,
    description: "Reads data from a file (e.g., CSV, JSON).",
    supportedInputs: ["string"],
    supportedOutputs: ["object", "array"],
  },
  {
    id: 9,
    type: "fileOutput",
    label: "Write File",
    category: "Data",
    icon: <FileOutput size={16} />,
    description: "Writes data to a file.",
    supportedInputs: ["object", "array", "string"],
  },
];
