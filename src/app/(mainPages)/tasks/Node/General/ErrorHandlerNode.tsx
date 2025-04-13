import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { AlertCircle, Edit, Trash, Power, PowerOff } from "lucide-react";
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

interface ErrorHandlerConfig {
  errorAction: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  isEnabled: boolean;
}

interface ErrorHandlerNodeData {
  description?: string;
  config?: ErrorHandlerConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`ErrorHandlerNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const ErrorHandlerNode = ({ id, data }: NodeProps<ErrorHandlerNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [errorAction, setErrorAction] = useState(
    data.config?.errorAction || "log"
  );
  const [maxRetries, setMaxRetries] = useState(data.config?.maxRetries || 3);
  const [retryDelay, setRetryDelay] = useState(data.config?.retryDelay || 1000);
  const [timeout, setTimeout] = useState(data.config?.timeout || 5000);
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
    if (!["log", "retry", "redirect"].includes(errorAction)) {
      setErrorMessage("Invalid error action");
      return false;
    }
    const maxRetriesNum = Number(maxRetries);
    if (
      errorAction === "retry" &&
      (isNaN(maxRetriesNum) || maxRetriesNum < 0)
    ) {
      setErrorMessage("Max retries must be a non-negative number");
      return false;
    }
    const retryDelayNum = Number(retryDelay);
    if (
      errorAction === "retry" &&
      (isNaN(retryDelayNum) || retryDelayNum < 0)
    ) {
      setErrorMessage("Retry delay must be a non-negative number");
      return false;
    }
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 0) {
      setErrorMessage("Timeout must be a non-negative number");
      return false;
    }
    setErrorMessage(null);
    return true;
  }, [description, errorAction, maxRetries, retryDelay, timeout]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  errorAction,
                  maxRetries: errorAction === "retry" ? Number(maxRetries) : 0,
                  retryDelay: errorAction === "retry" ? Number(retryDelay) : 0,
                  timeout: Number(timeout),
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
      `ErrorHandlerNode ${id}: Configuration saved - ${sanitizedDescription}, Action: ${errorAction}, Max Retries: ${maxRetries}`
    );
  }, [
    id,
    description,
    errorAction,
    maxRetries,
    retryDelay,
    timeout,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`ErrorHandlerNode ${id}: Deleted`);
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
      `ErrorHandlerNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative w-full min-w-[12rem] max-w-[20rem] text-foreground p-4 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Error Handler Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Error Handler">
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
                        Configure Error Handler
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the error handling behavior for the workflow.
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
                          placeholder="e.g., Handle page load errors"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="errorAction" className="text-gray-300">
                          Error Action
                        </Label>
                        <Select
                          value={errorAction}
                          onValueChange={setErrorAction}
                        >
                          <SelectTrigger
                            id="errorAction"
                            className="bg-gray-700 border-none text-white w-full"
                            aria-label="Select error action"
                          >
                            <SelectValue placeholder="Select error action" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="log">Log Error</SelectItem>
                            <SelectItem value="retry">
                              Retry Operation
                            </SelectItem>
                            <SelectItem value="redirect">
                              Redirect Flow
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {errorAction === "retry" && (
                        <>
                          <div>
                            <Label
                              htmlFor="maxRetries"
                              className="text-gray-300"
                            >
                              Max Retries
                            </Label>
                            <Input
                              id="maxRetries"
                              type="number"
                              value={maxRetries}
                              onChange={(e) =>
                                setMaxRetries(Number(e.target.value))
                              }
                              placeholder="e.g., 3"
                              min="0"
                              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="retryDelay"
                              className="text-gray-300"
                            >
                              Retry Delay (ms)
                            </Label>
                            <Input
                              id="retryDelay"
                              type="number"
                              value={retryDelay}
                              onChange={(e) =>
                                setRetryDelay(Number(e.target.value))
                              }
                              placeholder="e.g., 1000"
                              min="0"
                              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                              aria-required="true"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <Label htmlFor="timeout" className="text-gray-300">
                          Timeout (ms)
                        </Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={timeout}
                          onChange={(e) => setTimeout(Number(e.target.value))}
                          placeholder="e.g., 5000"
                          min="0"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
                        />
                      </div>
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
                <p>Edit Error Handler</p>
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
                <button
                  aria-label="Delete Error Handler"
                  onClick={handleDelete}
                >
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Error Handler</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 w-full">
            <span
              className={`p-3 bg-black text-white rounded-lg shadow-md flex-shrink-0 ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <AlertCircle size={20} />
            </span>
            <span className="text-sm font-semibold truncate flex-1">
              Error Handler
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
                      isEnabled
                        ? "Disable Error Handler"
                        : "Enable Error Handler"
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
                  <p>{isEnabled ? "Disable Handler" : "Enable Handler"}</p>
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
            Action: {errorAction}
            {errorAction === "retry" ? `, Retries: ${maxRetries}` : ""}
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
          id="success"
          style={{
            top: "30%",
            width: "0.6rem",
            height: "0.6rem",
            background: "#6ede87",
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="failure"
          style={{
            top: "70%",
            width: "0.6rem",
            height: "0.6rem",
            background: "#FF6B6B",
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export { ErrorHandlerNode };
