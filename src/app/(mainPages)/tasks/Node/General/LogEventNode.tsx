import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  FileText,
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

interface LogEventConfig {
  logLevel: string;
  logDestination: string;
  filePath?: string;
  isEnabled: boolean;
}

interface LogEventNodeData {
  description?: string;
  config?: LogEventConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`LogEventNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const LogEventNode = ({ id, data }: NodeProps<LogEventNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [logLevel, setLogLevel] = useState(data.config?.logLevel || "info");
  const [logDestination, setLogDestination] = useState(
    data.config?.logDestination || "console"
  );
  const [filePath, setFilePath] = useState(data.config?.filePath || "");
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">(
    data.error ? "error" : data.output ? "running" : "idle"
  );
  const { setNodes } = useReactFlow();

  const validateInputs = useCallback(() => {
    if (!description.trim()) {
      setErrorMessage("Description is required");
      return false;
    }
    if (!["info", "warn", "error"].includes(logLevel)) {
      setErrorMessage("Invalid log level");
      return false;
    }
    if (!["console", "file"].includes(logDestination)) {
      setErrorMessage("Invalid log destination");
      return false;
    }
    if (logDestination === "file" && !filePath.trim()) {
      setErrorMessage("File path is required when destination is file");
      return false;
    }
    setErrorMessage(null);
    return true;
  }, [description, logLevel, logDestination, filePath]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedFilePath =
      logDestination === "file" ? DOMPurify.sanitize(filePath) : undefined;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  logLevel,
                  logDestination,
                  filePath: sanitizedFilePath,
                  isEnabled,
                },
              },
            }
          : node
      )
    );

    setIsDialogOpen(false);
    setErrorMessage(null);
    log.info(
      `LogEventNode ${id}: Configuration saved - ${sanitizedDescription}, Level: ${logLevel}, Destination: ${logDestination}`
    );
  }, [
    id,
    description,
    logLevel,
    logDestination,
    filePath,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`LogEventNode ${id}: Deleted`);
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
    log.info(`LogEventNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative w-full min-w-[12rem] max-w-[20rem] text-foreground p-4 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Log Event Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Log Event">
                      <Edit
                        size={18}
                        className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[600px]"
                    aria-describedby="dialog-description"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">
                        Configure Log Event
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the logging details for the workflow.
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
                          placeholder="e.g., Log page load time"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logLevel" className="text-gray-300">
                          Log Level
                        </Label>
                        <Select value={logLevel} onValueChange={setLogLevel}>
                          <SelectTrigger
                            id="logLevel"
                            className="bg-gray-700 border-none text-white w-full"
                            aria-label="Select log level"
                          >
                            <SelectValue placeholder="Select log level" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warn">Warn</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="logDestination"
                          className="text-gray-300"
                        >
                          Log Destination
                        </Label>
                        <Select
                          value={logDestination}
                          onValueChange={setLogDestination}
                        >
                          <SelectTrigger
                            id="logDestination"
                            className="bg-gray-700 border-none text-white w-full"
                            aria-label="Select log destination"
                          >
                            <SelectValue placeholder="Select log destination" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="console">Console</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {logDestination === "file" && (
                        <div>
                          <Label htmlFor="filePath" className="text-gray-300">
                            File Path
                          </Label>
                          <Input
                            id="filePath"
                            type="text"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            placeholder="e.g., /logs/event.log"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                            aria-required="true"
                          />
                        </div>
                      )}
                      {errorMessage && (
                        <div
                          className="flex items-center gap-2 text-red-400"
                          role="alert"
                        >
                          <AlertCircle size={16} />
                          <span className="text-sm">{errorMessage}</span>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        className="text-white border-gray-600 hover:bg-gray-700"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setErrorMessage(null);
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
                <p>Edit Log Event</p>
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
                <button aria-label="Delete Log Event" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Log Event</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 w-full">
            <span
              className={`p-3 bg-[#FF9F1C] text-black rounded-lg shadow-md flex-shrink-0 ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <FileText size={20} />
            </span>
            <span className="text-sm font-semibold truncate flex-1">
              Log Event
            </span>
            <span
              className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 ${
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
                    className="ml-2 p-1 text-gray-400 hover:text-white flex-shrink-0"
                    onClick={handleToggleEnable}
                    aria-label={
                      isEnabled ? "Disable Log Event" : "Enable Log Event"
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
                  <p>{isEnabled ? "Disable Logger" : "Enable Logger"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-full line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-xs text-gray-400 capitalize">
            Level: {logLevel}, Dest: {logDestination}
          </p>
        </div>

        <Handle
          type="target"
          position={Position.Left}
          style={{ width: "0.6rem", height: "0.6rem", background: "#FF9F1C" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: "0.6rem", height: "0.6rem", background: "#FF9F1C" }}
        />
      </div>
    </ErrorBoundary>
  );
};

export { LogEventNode };
