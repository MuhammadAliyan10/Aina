import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Clipboard,
  Edit,
  Trash,
  Power,
  PowerOff,
  AlertCircle,
} from "lucide-react";
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DOMPurify from "dompurify";
import { ErrorBoundary } from "react-error-boundary";

interface ClipboardConfig {
  operation: string;
  content?: string;
  isEnabled: boolean;
}

interface ClipboardNodeData {
  description?: string;
  config?: ClipboardConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`ClipboardNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const requestClipboardPermission = async (): Promise<boolean> => {
  try {
    const permissionStatus = await navigator.permissions.query({
      name: "clipboard-read" as PermissionName,
    });
    if (
      permissionStatus.state === "granted" ||
      permissionStatus.state === "prompt"
    ) {
      return true;
    }
    log.error("Clipboard permission denied");
    return false;
  } catch (error) {
    log.error(`Clipboard permission request failed: ${error}`);
    return false;
  }
};

const ClipboardNode = ({ id, data }: NodeProps<ClipboardNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [operation, setOperation] = useState(data.config?.operation || "read");
  const [content, setContent] = useState(data.config?.content || "");
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">(
    data.error ? "error" : data.output ? "running" : "idle"
  );
  const { setNodes } = useReactFlow();

  const validateInputs = useCallback(async () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!["read", "write"].includes(operation)) {
      setError("Invalid operation");
      return false;
    }
    if (operation === "write" && !content.trim()) {
      setError("Content is required for write operation");
      return false;
    }
    const hasPermission = await requestClipboardPermission();
    if (!hasPermission) {
      setError("Clipboard permission not granted");
      return false;
    }
    setError(null);
    return true;
  }, [description, operation, content]);

  const handleSave = useCallback(async () => {
    if (!(await validateInputs())) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedContent =
      operation === "write" ? DOMPurify.sanitize(content) : undefined;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  operation,
                  content: sanitizedContent,
                  isEnabled,
                },
              },
            }
          : node
      )
    );

    setIsDialogOpen(false);
    setError(null);
    log.info(
      `ClipboardNode ${id}: Configuration saved - ${sanitizedDescription}, Operation: ${operation}`
    );
  }, [
    id,
    description,
    operation,
    content,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`ClipboardNode ${id}: Deleted`);
  }, [id, setNodes]);

  const handleToggleEnable = useCallback(() => {
    const newEnabledState = !isEnabled;
    setIsEnabled(newEnabledState);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                config: { ...node.data.config, isEnabled: newEnabledState },
              },
            }
          : node
      )
    );
    log.info(
      `ClipboardNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative min-w-[12rem] text-foreground p-3 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Clipboard Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Clipboard">
                      <Edit
                        size={18}
                        className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="bg-gray-800 text-white rounded-lg shadow-xl p-6"
                    aria-describedby="dialog-description"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">
                        Configure Clipboard
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the clipboard operation for the workflow.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description" className="text-gray-300">
                          Description
                        </Label>
                        <Input
                          id="description"
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g., Copy user ID to clipboard"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operation" className="text-gray-300">
                          Operation
                        </Label>
                        <Select value={operation} onValueChange={setOperation}>
                          <SelectTrigger
                            id="operation"
                            className="bg-gray-700 border-none text-white"
                            aria-label="Select operation"
                          >
                            <SelectValue placeholder="Select operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="write">Write</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {operation === "write" && (
                        <div>
                          <Label htmlFor="content" className="text-gray-300">
                            Content to Write
                          </Label>
                          <Input
                            id="content"
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="e.g., Example text"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            aria-required="true"
                          />
                        </div>
                      )}
                      {error && (
                        <div
                          className="flex items-center gap-2 text-red-400"
                          role="alert"
                        >
                          <AlertCircle size={16} />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="text-white border-gray-600 hover:bg-gray-700"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setError(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md"
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Edit Clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span
            className="border border-r border-border h-[15px]"
            aria-hidden="true"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Delete Clipboard" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-3 bg-black text-white rounded-lg shadow-md ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <Clipboard size={20} />
            </span>
            <span className="text-sm font-semibold">Clipboard</span>
            <span
              className={`ml-2 w-2 h-2 rounded-full ${
                status === "running"
                  ? "bg-green-500 animate-pulse"
                  : status === "error"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
              aria-live="polite"
              aria-label={`Status: ${status}`}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-1 text-gray-400 hover:text-white"
                    onClick={handleToggleEnable}
                    aria-label={
                      isEnabled ? "Disable Clipboard" : "Enable Clipboard"
                    }
                  >
                    {isEnabled ? (
                      <Power size={16} className="text-green-500" />
                    ) : (
                      <PowerOff size={16} className="text-red-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-700 text-white">
                  <p>{isEnabled ? "Disable Clipboard" : "Enable Clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
              {description}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {operation === "read" ? "Read" : "Write"}
          </p>
        </div>

        <Handle
          type="target"
          position={Position.Left}
          style={{ width: "0.6rem", height: "0.6rem", background: "#6ede87" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: "0.6rem", height: "0.6rem", background: "#6ede87" }}
        />
      </div>
    </ErrorBoundary>
  );
};

export { ClipboardNode };
