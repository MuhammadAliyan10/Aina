import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Server,
  Edit,
  Trash,
  Power,
  PowerOff,
  AlertCircle,
} from "lucide-react";
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

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const SystemMonitorNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [resource, setResource] = useState(data.config?.resource || "cpu");
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (data.error) {
      setStatus("error");
      setError(data.error);
      log.error(`SystemMonitorNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `SystemMonitorNode ${id}: Monitored - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
      setError(null);
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`SystemMonitorNode ${id}: Deleted`);
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
    log.info(
      `SystemMonitorNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
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
                config: { ...node.data.config, resource, isEnabled },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `SystemMonitorNode ${id}: Configuration saved - ${description}, Resource: ${resource}`
    );
  };

  return (
    <div
      className={`relative min-w-[12rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg ${
        !isEnabled ? "opacity-50" : ""
      }`}
    >
      <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Edit
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={() => setIsDialogOpen(true)}
                  />
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white rounded-lg shadow-xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                      Configure System Monitor
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
                        placeholder="e.g., Monitor CPU usage"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resource" className="text-gray-300">
                        Resource to Monitor
                      </Label>
                      <Select value={resource} onValueChange={setResource}>
                        <SelectTrigger
                          id="resource"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select resource" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="cpu">CPU</SelectItem>
                          <SelectItem value="memory">Memory</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white">
              <p>Edit System Monitor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              <p>Delete System Monitor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#92C5FD] text-black rounded-lg shadow-md">
              <Server size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#92C5FD] text-black rounded-lg shadow-md opacity-50">
              <Server size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">System Monitor</span>
          <span
            className={`ml-2 w-2 h-2 rounded-full ${
              status === "running"
                ? "bg-green-500 animate-pulse"
                : status === "error"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          />
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
                <p>{isEnabled ? "Disable" : "Enable"} System Monitor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        {resource && (
          <div className="text-xs text-gray-300 flex items-center gap-1">
            <Server size={12} />
            <span className="truncate max-w-[9rem]">{resource}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#92C5FD" }}
      />
    </div>
  );
};

export { SystemMonitorNode };
