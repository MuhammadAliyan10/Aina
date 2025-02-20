import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Camera,
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
import { Checkbox } from "@/components/ui/checkbox";
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

const ScreenShotNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [screenshotType, setScreenshotType] = useState(
    data.config?.screenshotType || "page"
  ); // page, fullPage, element
  const [elementSelector, setElementSelector] = useState(
    data.config?.elementSelector || ""
  ); // CSS selector for element
  const [fileName, setFileName] = useState(
    data.config?.fileName || "screenshot"
  ); // Default filename
  const [saveFormat, setSaveFormat] = useState(
    data.config?.saveFormat || "png"
  ); // png, jpg
  const [saveToFile, setSaveToFile] = useState(
    data.config?.saveToFile || false
  ); // Save to file toggle
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`ScreenShotNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `ScreenShotNode ${id}: Screenshot taken - ${JSON.stringify(
          data.output
        )}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`ScreenShotNode ${id}: Deleted`);
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
      `ScreenShotNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (screenshotType === "element" && !elementSelector.trim()) {
      setError("Element selector is required for element screenshot");
      return false;
    }
    if (saveToFile && !fileName.trim()) {
      setError("File name is required when saving to file");
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
                  screenshotType,
                  elementSelector:
                    screenshotType === "element" ? elementSelector : undefined,
                  fileName: saveToFile ? fileName : undefined,
                  saveFormat: saveToFile ? saveFormat : undefined,
                  saveToFile,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `ScreenShotNode ${id}: Configuration saved - ${description}, Type: ${screenshotType}, Save: ${saveToFile}`
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
                      Configure Screenshot
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
                        placeholder="e.g., Capture payment page screenshot"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="screenshotType" className="text-gray-300">
                        Screenshot Type
                      </Label>
                      <Select
                        value={screenshotType}
                        onValueChange={setScreenshotType}
                      >
                        <SelectTrigger
                          id="screenshotType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="fullPage">Full Page</SelectItem>
                          <SelectItem value="element">Element</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {screenshotType === "element" && (
                      <div>
                        <Label
                          htmlFor="elementSelector"
                          className="text-gray-300"
                        >
                          Element Selector (CSS)
                        </Label>
                        <Input
                          id="elementSelector"
                          type="text"
                          value={elementSelector}
                          onChange={(e) => setElementSelector(e.target.value)}
                          placeholder="e.g., #payment-form"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveToFile"
                        checked={saveToFile}
                        onCheckedChange={(checked) =>
                          setSaveToFile(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="saveToFile"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Save to File
                      </Label>
                    </div>
                    {saveToFile && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fileName" className="text-gray-300">
                            File Name
                          </Label>
                          <Input
                            id="fileName"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="e.g., screenshot"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="saveFormat" className="text-gray-300">
                            Format
                          </Label>
                          <Select
                            value={saveFormat}
                            onValueChange={setSaveFormat}
                          >
                            <SelectTrigger
                              id="saveFormat"
                              className="bg-gray-700 border-none text-white"
                            >
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white">
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="jpg">JPG</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white">
              <p>Edit Screenshot</p>
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
              <p>Delete Screenshot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md">
              <Camera size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md opacity-50">
              <Camera size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Screenshot</span>
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
                <p>{isEnabled ? "Disable Screenshot" : "Enable Screenshot"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        <p className="text-xs text-gray-300 capitalize">
          {screenshotType === "page"
            ? "Page"
            : screenshotType === "fullPage"
            ? "Full Page"
            : "Element"}
        </p>
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

export { ScreenShotNode };
