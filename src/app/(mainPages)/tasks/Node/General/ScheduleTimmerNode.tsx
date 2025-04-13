import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Calendar,
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

interface ScheduleTimerConfig {
  scheduleType: string;
  interval?: number;
  specificTime?: string;
  isEnabled: boolean;
}

interface ScheduleTimerNodeData {
  description?: string;
  config?: ScheduleTimerConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`ScheduleTimerNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const ScheduleTimerNode = ({ id, data }: NodeProps<ScheduleTimerNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [scheduleType, setScheduleType] = useState(
    data.config?.scheduleType || "interval"
  );
  const [interval, setInterval] = useState(data.config?.interval || "");
  const [specificTime, setSpecificTime] = useState(
    data.config?.specificTime || ""
  );
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
    if (!["interval", "specific"].includes(scheduleType)) {
      setErrorMessage("Invalid schedule type");
      return false;
    }
    if (scheduleType === "interval") {
      const intervalNum = Number(interval);
      if (isNaN(intervalNum) || intervalNum <= 0) {
        setErrorMessage("Interval must be a positive number");
        return false;
      }
    } else if (scheduleType === "specific") {
      if (!specificTime.trim()) {
        setErrorMessage("Specific time is required for specific type");
        return false;
      }
      try {
        new Date(specificTime).toISOString();
      } catch (e) {
        setErrorMessage(
          "Specific time must be a valid date (e.g., 2023-10-25T14:30:00Z)"
        );
        return false;
      }
    }
    setErrorMessage(null);
    return true;
  }, [description, scheduleType, interval, specificTime]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedSpecificTime =
      scheduleType === "specific"
        ? DOMPurify.sanitize(specificTime)
        : undefined;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  scheduleType,
                  interval:
                    scheduleType === "interval" ? Number(interval) : undefined,
                  specificTime: sanitizedSpecificTime,
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
      `ScheduleTimerNode ${id}: Configuration saved - ${sanitizedDescription}, Type: ${scheduleType}`
    );
  }, [
    id,
    description,
    scheduleType,
    interval,
    specificTime,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`ScheduleTimerNode ${id}: Deleted`);
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
      `ScheduleTimerNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative w-full min-w-[12rem] max-w-[20rem] text-white p-4 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Schedule Timer Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Schedule Timer">
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
                        Configure Schedule Timer
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the timer schedule for the workflow.
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
                          placeholder="e.g., Schedule daily check"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduleType" className="text-gray-300">
                          Schedule Type
                        </Label>
                        <Select
                          value={scheduleType}
                          onValueChange={setScheduleType}
                        >
                          <SelectTrigger
                            id="scheduleType"
                            className="bg-gray-700 border-none text-white w-full"
                            aria-label="Select schedule type"
                          >
                            <SelectValue placeholder="Select schedule type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="interval">Interval</SelectItem>
                            <SelectItem value="specific">
                              Specific Time
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {scheduleType === "interval" && (
                        <div>
                          <Label htmlFor="interval" className="text-gray-300">
                            Interval (ms)
                          </Label>
                          <Input
                            id="interval"
                            type="number"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            placeholder="e.g., 60000 (1 minute)"
                            min="1"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                            aria-required="true"
                          />
                        </div>
                      )}
                      {scheduleType === "specific" && (
                        <div>
                          <Label
                            htmlFor="specificTime"
                            className="text-gray-300"
                          >
                            Specific Time (ISO)
                          </Label>
                          <Input
                            id="specificTime"
                            type="text"
                            value={specificTime}
                            onChange={(e) => setSpecificTime(e.target.value)}
                            placeholder="e.g., 2023-10-25T14:30:00Z"
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
                <p>Edit Schedule Timer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="border border-r-white h-[15px]" aria-hidden="true" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Delete Schedule Timer"
                  onClick={handleDelete}
                >
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Schedule Timer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 w-full">
            <span
              className={`p-3 bg-[#000000] text-white rounded-lg shadow-md flex-shrink-0 ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <Calendar size={20} />
            </span>
            <span className="text-sm font-semibold truncate flex-1">
              Schedule Timer
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
                        ? "Disable Schedule Timer"
                        : "Enable Schedule Timer"
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
                  <p>{isEnabled ? "Disable Timer" : "Enable Timer"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-full line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-xs text-gray-300 capitalize">
            {scheduleType === "interval"
              ? `Every ${interval}ms`
              : specificTime || "Not Set"}
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

export { ScheduleTimerNode };
