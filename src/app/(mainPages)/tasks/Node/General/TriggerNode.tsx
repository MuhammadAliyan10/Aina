import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Play, Edit, Trash, AlertCircle, Power, PowerOff } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Placeholder for logging (to be integrated with your logging system)
const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const TriggerNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [triggerType, setTriggerType] = useState(
    data.config?.triggerType || "manual"
  );
  const [schedule, setSchedule] = useState(data.config?.schedule || ""); // e.g., cron expression
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (without displaying output/error in UI)
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

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`TriggerNode ${id}: Deleted`);
  };

  const handleToggleEnable = () => {
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
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (triggerType === "scheduled" && !schedule.trim()) {
      setError("Schedule is required for scheduled triggers");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description,
                config: {
                  ...node.data.config,
                  triggerType,
                  schedule: triggerType === "scheduled" ? schedule : undefined,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(`TriggerNode ${id}: Configuration saved - ${description}`);
  };

  return (
    <div
      className={`relative min-w-[12rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg ${
        !isEnabled ? "opacity-50" : ""
      }`}
    >
      {/* Action buttons, visible on hover */}
      <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Play
                size={18}
                className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleDelete} // Note: This was originally a delete action; adjust if intended for run
              />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white">
              <p>Run Trigger</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="border border-r-white h-[15px]"></span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Edit
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={() => setIsDialogOpen(true)}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-700 text-white">
                  <p>Edit Trigger</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white rounded-lg shadow-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Configure Trigger
              </DialogTitle>
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
                  >
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white">
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="event">Event-Based</SelectItem>
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
                    placeholder="e.g., * * * * * (every minute)"
                    className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
                onClick={() => setIsDialogOpen(false)}
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
        <span className="border border-r-white h-[15px]"></span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Trash
                size={18}
                className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleDelete}
              />
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
          {(isEnabled && (
            <span className="p-3 bg-black text-white rounded-lg shadow-md">
              <Play size={20} />
            </span>
          )) || (
            <span className="p-3 bg-black text-white rounded-lg shadow-md opacity-50">
              <Play size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Trigger</span>
          {/* Status Indicator */}
          <span
            className={`ml-2 w-2 h-2 rounded-full ${
              status === "running"
                ? "bg-green-500 animate-pulse"
                : status === "error"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          />
          {/* Enable/Disable Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 p-1 text-gray-400 hover:text-white"
                  onClick={handleToggleEnable}
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

      {/* Handle (Source Only) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#6ede87" }}
      />
    </div>
  );
};

export { TriggerNode };
