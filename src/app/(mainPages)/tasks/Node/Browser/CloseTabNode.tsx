import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { X, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

// Placeholder for logging (integrate with your production logging system)
const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const CloseTabNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [closeType, setCloseType] = useState(data.config?.closeType || "tab"); // tab or window
  const [targetType, setTargetType] = useState(
    data.config?.targetType || "active"
  ); // active, url, title, index
  const [targetValue, setTargetValue] = useState(
    data.config?.targetValue || ""
  ); // URL, title, or index
  const [confirmClose, setConfirmClose] = useState(
    data.config?.confirmClose || "no"
  ); // Require confirmation
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`CloseTabNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `CloseTabNode ${id}: ${closeType} closed - ${JSON.stringify(
          data.output
        )}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id, closeType]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`CloseTabNode ${id}: Deleted`);
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
    log.info(`CloseTabNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (targetType === "url" && targetValue && !isValidUrl(targetValue)) {
      setError("Invalid URL format");
      return false;
    }
    if (targetType === "index") {
      const indexNum = Number(targetValue);
      if (isNaN(indexNum) || indexNum < 0) {
        setError("Tab/Window index must be a non-negative number");
        return false;
      }
    }
    if (
      targetType !== "active" &&
      targetType !== "index" &&
      !targetValue.trim()
    ) {
      setError("Target value is required for URL or title");
      return false;
    }
    setError(null);
    return true;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
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
                  closeType,
                  targetType,
                  targetValue:
                    targetType === "index" ? Number(targetValue) : targetValue,
                  confirmClose,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `CloseTabNode ${id}: Configuration saved - ${description}, Type: ${closeType}, Target: ${targetType}`
    );
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
                      Configure Close Tab/Window
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
                        placeholder="e.g., Close payment tab"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeType" className="text-gray-300">
                        Close Type
                      </Label>
                      <Select value={closeType} onValueChange={setCloseType}>
                        <SelectTrigger
                          id="closeType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="tab">Tab</SelectItem>
                          <SelectItem value="window">Window</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetType" className="text-gray-300">
                        Target Type
                      </Label>
                      <Select value={targetType} onValueChange={setTargetType}>
                        <SelectTrigger
                          id="targetType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select target type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="index">Index</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {targetType !== "active" && (
                      <div>
                        <Label htmlFor="targetValue" className="text-gray-300">
                          {targetType === "index"
                            ? "Index"
                            : targetType === "url"
                            ? "URL"
                            : "Title"}
                        </Label>
                        <Input
                          id="targetValue"
                          type={targetType === "index" ? "number" : "text"}
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder={
                            targetType === "index"
                              ? "e.g., 0"
                              : targetType === "url"
                              ? "e.g., https://example.com"
                              : "e.g., Payment Page"
                          }
                          min={targetType === "index" ? "0" : undefined}
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="confirmClose" className="text-gray-300">
                        Confirm Before Closing
                      </Label>
                      <Select
                        value={confirmClose}
                        onValueChange={setConfirmClose}
                      >
                        <SelectTrigger
                          id="confirmClose"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select confirmation" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
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
              <p>Edit Close Tab/Window</p>
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
              <p>Delete Close Tab/Window</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md">
              <X size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md opacity-50">
              <X size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">
            Close {closeType === "tab" ? "Tab" : "Window"}
          </span>
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
                <p>{isEnabled ? "Disable Close" : "Enable Close"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        {targetType && (
          <p className="text-xs text-gray-300 capitalize">
            {targetType === "active"
              ? "Active"
              : targetType === "index"
              ? `Index: ${targetValue}`
              : `${targetType}: ${targetValue}`}
          </p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#fde047" }} // Matches icon color
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#fde047" }}
      />
    </div>
  );
};

export { CloseTabNode };
