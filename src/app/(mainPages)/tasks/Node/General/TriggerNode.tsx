import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Play, Edit, Trash, AlertCircle, Power, PowerOff } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
import DOMPurify from "dompurify"; // Default import for sanitization
import { ErrorBoundary } from "react-error-boundary"; // For error handling

// Type definitions
interface TriggerConfig {
  triggerType: string;
  schedule?: string;
  eventSource?: string;
  eventCondition?: string;
  isEnabled: boolean;
}

interface TriggerNodeData {
  description?: string;
  config?: TriggerConfig;
  error?: string;
  output?: { started: boolean; timestamp: string };
}

// Trigger type registry
const TRIGGER_TYPES = {
  manual: { label: "Manual", value: "manual" },
  scheduled: { label: "Scheduled", value: "scheduled" },
  event: { label: "Event-Based", value: "event" },
};

// Logging placeholder
const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

// Error Boundary Fallback
const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`TriggerNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

// Custom cron validation function
const validateCronExpression = (expression: string): boolean => {
  try {
    // Split into fields (expect 5: seconds, minutes, hours, day of month, month)
    const fields = expression.trim().split(/\s+/);
    if (fields.length !== 5) {
      log.error(`Cron expression must have 5 fields, got ${fields.length}`);
      return false;
    }

    // Define valid ranges for each field
    const ranges = [
      { name: "seconds", min: 0, max: 59 },
      { name: "minutes", min: 0, max: 59 },
      { name: "hours", min: 0, max: 23 },
      { name: "day of month", min: 1, max: 31 },
      { name: "month", min: 1, max: 12 },
    ];

    // Validate each field
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const { name, min, max } = ranges[i];

      // Handle wildcard
      if (field === "*") {
        continue;
      }

      // Handle step values (e.g., */5)
      if (field.startsWith("*/")) {
        const step = parseInt(field.slice(2), 10);
        if (isNaN(step) || step < 1 || step > max) {
          log.error(`Invalid step value in ${name}: ${field}`);
          return false;
        }
        continue;
      }

      // Handle numeric values
      const value = parseInt(field, 10);
      if (isNaN(value) || value < min || value > max) {
        log.error(`Invalid ${name} value: ${field}`);
        return false;
      }
    }

    log.info(`Cron expression ${expression} is valid`);
    return true;
  } catch (err: any) {
    log.error(`Cron validation failed: ${err.message}`);
    return false;
  }
};

const TriggerNode = ({ id, data }: NodeProps<TriggerNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [triggerType, setTriggerType] = useState(
    data.config?.triggerType || "manual"
  );
  const [schedule, setSchedule] = useState(data.config?.schedule || "");
  const [eventSource, setEventSource] = useState(
    data.config?.eventSource || ""
  );
  const [eventCondition, setEventCondition] = useState(
    data.config?.eventCondition || ""
  );
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const { setNodes } = useReactFlow();

  // Sync status
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`TriggerNode ${id}: ${data.error}`);
    } else if (data.output?.started) {
      setStatus("running");
      log.info(`TriggerNode ${id}: Started at ${data.output.timestamp}`);
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  // Validate inputs
  const validateInputs = useCallback(() => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (triggerType === "scheduled") {
      if (!schedule.trim()) {
        setError("Schedule is required for scheduled triggers");
        return false;
      }
      if (!validateCronExpression(schedule)) {
        setError("Invalid cron expression");
        return false;
      }
    }
    if (triggerType === "event") {
      if (!eventSource.trim()) {
        setError("Event source is required for event-based triggers");
        return false;
      }
      if (!eventCondition.trim()) {
        setError("Event condition is required for event-based triggers");
        return false;
      }
    }
    setError(null);
    return true;
  }, [description, triggerType, schedule, eventSource, eventCondition]);

  // Save configuration
  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedSchedule =
      triggerType === "scheduled" ? DOMPurify.sanitize(schedule) : undefined;
    const sanitizedEventSource =
      triggerType === "event" ? DOMPurify.sanitize(eventSource) : undefined;
    const sanitizedEventCondition =
      triggerType === "event" ? DOMPurify.sanitize(eventCondition) : undefined;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  triggerType,
                  schedule: sanitizedSchedule,
                  eventSource: sanitizedEventSource,
                  eventCondition: sanitizedEventCondition,
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
      `TriggerNode ${id}: Configuration saved - ${sanitizedDescription}`
    );
  }, [
    id,
    description,
    triggerType,
    schedule,
    eventSource,
    eventCondition,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  // Delete node
  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`TriggerNode ${id}: Deleted`);
  }, [id, setNodes]);

  // Toggle enable/disable
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
    log.info(`TriggerNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  }, [id, isEnabled, setNodes]);

  // Run trigger
  const handleRun = useCallback(() => {
    if (!isEnabled) {
      setError("Cannot run a disabled trigger");
      return;
    }
    setStatus("running");
    log.info(`TriggerNode ${id}: Manually triggered`);
    setTimeout(() => setStatus("idle"), 2000); // Simulate async
  }, [id, isEnabled]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative min-w-[12rem] text-foreground p-3 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Trigger Node ${id}`}
      >
        {/* Action buttons */}
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Run Trigger"
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
                <p>Run Trigger</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="border border-r-white h-[15px]" aria-hidden="true" />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Trigger">
                      <Edit
                        size={18}
                        className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-700 text-white">
                  <p>Edit Trigger</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent
              className="bg-gray-800 text-white rounded-lg shadow-xl p-6"
              aria-describedby="dialog-description"
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Configure Trigger
                </DialogTitle>
                <DialogDescription id="dialog-description">
                  Set up the trigger details for your workflow.
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
                    placeholder="e.g., Start workflow on button click"
                    className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    aria-required="true"
                  />
                </div>
                <div>
                  <Label htmlFor="triggerType" className="text-gray-300">
                    Trigger Type
                  </Label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
                    <SelectTrigger
                      id="triggerType"
                      className="bg-gray-700 border-none text-white"
                      aria-label="Select trigger type"
                    >
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 text-white">
                      {Object.values(TRIGGER_TYPES).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {triggerType === "scheduled" && (
                  <div>
                    <Label htmlFor="schedule" className="text-gray-300">
                      Schedule (Cron)
                    </Label>
                    <Input
                      id="schedule"
                      type="text"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="e.g., */5 * * * * (every 5 seconds)"
                      className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      aria-required="true"
                    />
                  </div>
                )}
                {triggerType === "event" && (
                  <>
                    <div>
                      <Label htmlFor="eventSource" className="text-gray-300">
                        Event Source
                      </Label>
                      <Input
                        id="eventSource"
                        type="text"
                        value={eventSource}
                        onChange={(e) => setEventSource(e.target.value)}
                        placeholder="e.g., AWS S3, Kafka Topic"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventCondition" className="text-gray-300">
                        Event Condition
                      </Label>
                      <Input
                        id="eventCondition"
                        type="text"
                        value={eventCondition}
                        onChange={(e) => setEventCondition(e.target.value)}
                        placeholder="e.g., fileUploaded == true"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        aria-required="true"
                      />
                    </div>
                  </>
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
          <span className="border border-r-white h-[15px]" aria-hidden="true" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Delete Trigger" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Trigger</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Node Display */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-3 bg-black text-white rounded-lg shadow-md ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <Play size={20} />
            </span>
            <span className="text-sm font-semibold">Trigger</span>
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
                      isEnabled ? "Disable Trigger" : "Enable Trigger"
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
                  <p>{isEnabled ? "Disable Trigger" : "Enable Trigger"}</p>
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

        {/* Handle */}
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: "0.6rem", height: "0.6rem", background: "#6ede87" }}
        />
      </div>
    </ErrorBoundary>
  );
};

export { TriggerNode };
