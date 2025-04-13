import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Workflow,
  Edit,
  Trash,
  AlertCircle,
  Power,
  PowerOff,
  Play,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DOMPurify from "dompurify";
import { ErrorBoundary } from "react-error-boundary";

interface WorkflowConfig {
  workflowId: string;
  parameters?: object;
  isEnabled: boolean;
}

interface WorkflowNodeData {
  description?: string;
  config?: WorkflowConfig;
  error?: string;
  output?: { result: any; timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`WorkflowNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const WorkflowNode = ({ id, data }: NodeProps<WorkflowNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [workflowId, setWorkflowId] = useState(data.config?.workflowId || "");
  const [parameters, setParameters] = useState(
    data.config?.parameters ? JSON.stringify(data.config.parameters) : ""
  );
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">(
    data.error ? "error" : data.output?.result ? "running" : "idle"
  );
  const { setNodes } = useReactFlow();

  const validateInputs = useCallback(() => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!workflowId.trim()) {
      setError("Workflow ID is required");
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(workflowId)) {
      setError("Workflow ID must be alphanumeric with underscores or hyphens");
      return false;
    }
    if (parameters) {
      try {
        JSON.parse(parameters);
      } catch (e) {
        setError("Parameters must be valid JSON");
        return false;
      }
    }
    setError(null);
    return true;
  }, [description, workflowId, parameters]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedWorkflowId = DOMPurify.sanitize(workflowId);
    let sanitizedParameters: object | undefined;
    if (parameters) {
      try {
        sanitizedParameters = JSON.parse(DOMPurify.sanitize(parameters));
      } catch (e) {
        setError("Failed to parse sanitized parameters");
        return;
      }
    }

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  workflowId: sanitizedWorkflowId,
                  parameters: sanitizedParameters,
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
      `WorkflowNode ${id}: Configuration saved - ${sanitizedDescription}`
    );
  }, [
    id,
    description,
    workflowId,
    parameters,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`WorkflowNode ${id}: Deleted`);
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
    log.info(`WorkflowNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  }, [id, isEnabled, setNodes]);

  const handleRun = useCallback(() => {
    if (!isEnabled) {
      setError("Cannot run a disabled workflow");
      return;
    }
    setStatus("running");
    log.info(`WorkflowNode ${id}: Manually triggered`);
    setTimeout(() => setStatus("idle"), 2000);
  }, [id, isEnabled]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative min-w-[12rem] text-foreground p-3 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Workflow Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Run Workflow"
                  onClick={handleRun}
                  disabled={!isEnabled}
                >
                  <Play
                    size={18}
                    className={`cursor-pointer transition-colors ${
                      isEnabled
                        ? "text-gray-400 hover:text-green-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Run Workflow</p>
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Workflow">
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
                        Configure Workflow
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the workflow details for execution.
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
                          placeholder="e.g., Execute user signup workflow"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflowId" className="text-gray-300">
                          Workflow ID
                        </Label>
                        <Input
                          id="workflowId"
                          type="text"
                          value={workflowId}
                          onChange={(e) => setWorkflowId(e.target.value)}
                          placeholder="e.g., signup_workflow_v1"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parameters" className="text-gray-300">
                          Parameters (JSON)
                        </Label>
                        <Input
                          id="parameters"
                          type="text"
                          value={parameters}
                          onChange={(e) => setParameters(e.target.value)}
                          placeholder='e.g., {"userId": "123"}'
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                <p>Edit Workflow</p>
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
                <button aria-label="Delete Workflow" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Workflow</p>
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
              <Workflow size={20} />
            </span>
            <span className="text-sm font-semibold">Workflow</span>
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
                      isEnabled ? "Disable Workflow" : "Enable Workflow"
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
                  <p>{isEnabled ? "Disable Workflow" : "Enable Workflow"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
              {description}
            </p>
          )}
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

export { WorkflowNode };
