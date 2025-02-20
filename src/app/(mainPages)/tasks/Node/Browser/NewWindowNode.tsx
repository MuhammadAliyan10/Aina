import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Globe, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

const NewWindowNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [url, setUrl] = useState(data.config?.url || ""); // Renamed URL to url
  const [windowType, setWindowType] = useState(
    data.config?.windowType || "normal"
  ); // normal, popup, panel
  const [windowState, setWindowState] = useState(
    data.config?.windowState || "normal"
  ); // normal, minimized, maximized, fullscreen
  const [width, setWidth] = useState(data.config?.width || 800); // Window width in pixels
  const [height, setHeight] = useState(data.config?.height || 600); // Window height in pixels
  const [left, setLeft] = useState(data.config?.left || 0); // X-position
  const [top, setTop] = useState(data.config?.top || 0); // Y-position
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`NewWindowNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `NewWindowNode ${id}: Window opened - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`NewWindowNode ${id}: Deleted`);
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
      `NewWindowNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (url && !isValidUrl(url)) {
      setError("Invalid URL format");
      return false;
    }
    const widthNum = Number(width);
    const heightNum = Number(height);
    const leftNum = Number(left);
    const topNum = Number(top);
    if (isNaN(widthNum) || widthNum <= 0) {
      setError("Width must be a positive number");
      return false;
    }
    if (isNaN(heightNum) || heightNum <= 0) {
      setError("Height must be a positive number");
      return false;
    }
    if (isNaN(leftNum) || isNaN(topNum)) {
      setError("Position values must be numbers");
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
                  url,
                  windowType,
                  windowState,
                  width: Number(width),
                  height: Number(height),
                  left: Number(left),
                  top: Number(top),
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `NewWindowNode ${id}: Configuration saved - ${description}, URL: ${url}, Type: ${windowType}, State: ${windowState}`
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
                      Configure New Window
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
                        placeholder="e.g., Open new browser window"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-gray-300">
                        URL (Optional)
                      </Label>
                      <Input
                        id="url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., https://example.com"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="windowType" className="text-gray-300">
                        Window Type
                      </Label>
                      <Select value={windowType} onValueChange={setWindowType}>
                        <SelectTrigger
                          id="windowType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="popup">Popup</SelectItem>
                          <SelectItem value="panel">Panel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="windowState" className="text-gray-300">
                        Window State
                      </Label>
                      <Select
                        value={windowState}
                        onValueChange={setWindowState}
                      >
                        <SelectTrigger
                          id="windowState"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="minimized">Minimized</SelectItem>
                          <SelectItem value="maximized">Maximized</SelectItem>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width" className="text-gray-300">
                          Width (px)
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="e.g., 800"
                          min="100"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-gray-300">
                          Height (px)
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="e.g., 600"
                          min="100"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="left" className="text-gray-300">
                          Left (px)
                        </Label>
                        <Input
                          id="left"
                          type="number"
                          value={left}
                          onChange={(e) => setLeft(e.target.value)}
                          placeholder="e.g., 0"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="top" className="text-gray-300">
                          Top (px)
                        </Label>
                        <Input
                          id="top"
                          type="number"
                          value={top}
                          onChange={(e) => setTop(e.target.value)}
                          placeholder="e.g., 0"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
              <p>Edit New Window</p>
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
              <p>Delete New Window</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md">
              <Globe size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md opacity-50">
              <Globe size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">New Window</span>
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
                <p>{isEnabled ? "Disable New Window" : "Enable New Window"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        {url && (
          <div className="text-xs text-gray-300 flex items-center gap-1">
            <Globe size={12} />
            <span className="truncate max-w-[9rem]">{url}</span>
          </div>
        )}
      </div>

      {/* Handle (Source only, as it’s an initiator node) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#fde047" }} // Matches icon color
      />
    </div>
  );
};

export { NewWindowNode };
