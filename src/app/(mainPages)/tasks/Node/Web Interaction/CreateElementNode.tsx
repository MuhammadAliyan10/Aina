import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Code2, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

const CreateElementNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [elementTag, setElementTag] = useState(
    data.config?.elementTag || "div"
  ); // HTML tag to create
  const [attributes, setAttributes] = useState(data.config?.attributes || ""); // JSON string for attributes
  const [innerContent, setInnerContent] = useState(
    data.config?.innerContent || ""
  ); // Inner HTML or text
  const [appendLocation, setAppendLocation] = useState(
    data.config?.appendLocation || "body"
  ); // body or specific element
  const [selectorType, setSelectorType] = useState(
    data.config?.selectorType || "css"
  ); // css or xpath (if specific)
  const [selectorValue, setSelectorValue] = useState(
    data.config?.selectorValue || ""
  ); // Parent selector (if specific)
  const [timeout, setTimeout] = useState(data.config?.timeout || 5000); // Timeout in milliseconds
  const [retryOnFail, setRetryOnFail] = useState(
    data.config?.retryOnFail || false
  ); // Retry if creation fails
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`CreateElementNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `CreateElementNode ${id}: Element created - ${JSON.stringify(
          data.output
        )}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`CreateElementNode ${id}: Deleted`);
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
      `CreateElementNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!elementTag.trim()) {
      setError("Element tag is required");
      return false;
    }
    if (appendLocation === "specific" && !selectorValue.trim()) {
      setError("Selector value is required for specific append location");
      return false;
    }
    if (attributes) {
      try {
        JSON.parse(attributes);
      } catch (e) {
        setError("Attributes must be valid JSON");
        return false;
      }
    }
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 0) {
      setError("Timeout must be a non-negative number");
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
                  elementTag,
                  attributes: attributes ? JSON.parse(attributes) : undefined,
                  innerContent,
                  appendLocation,
                  selectorType:
                    appendLocation === "specific" ? selectorType : undefined,
                  selectorValue:
                    appendLocation === "specific" ? selectorValue : undefined,
                  timeout: Number(timeout),
                  retryOnFail,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `CreateElementNode ${id}: Configuration saved - ${description}, Tag: ${elementTag}, Append: ${appendLocation}`
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
                      Configure Create Element
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
                        placeholder="e.g., Create a new div"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="elementTag" className="text-gray-300">
                        Element Tag
                      </Label>
                      <Select value={elementTag} onValueChange={setElementTag}>
                        <SelectTrigger
                          id="elementTag"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select element tag" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="div">div</SelectItem>
                          <SelectItem value="span">span</SelectItem>
                          <SelectItem value="p">p</SelectItem>
                          <SelectItem value="button">button</SelectItem>
                          <SelectItem value="img">img</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="attributes" className="text-gray-300">
                        Attributes (JSON, Optional)
                      </Label>
                      <Textarea
                        id="attributes"
                        value={attributes}
                        onChange={(e) => setAttributes(e.target.value)}
                        placeholder='e.g., {"id": "newDiv", "class": "custom"}'
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 h-20 font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="innerContent" className="text-gray-300">
                        Inner Content (Optional)
                      </Label>
                      <Input
                        id="innerContent"
                        type="text"
                        value={innerContent}
                        onChange={(e) => setInnerContent(e.target.value)}
                        placeholder="e.g., Hello World"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appendLocation" className="text-gray-300">
                        Append Location
                      </Label>
                      <Select
                        value={appendLocation}
                        onValueChange={setAppendLocation}
                      >
                        <SelectTrigger
                          id="appendLocation"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select append location" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="body">Body</SelectItem>
                          <SelectItem value="specific">
                            Specific Element
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {appendLocation === "specific" && (
                      <>
                        <div>
                          <Label
                            htmlFor="selectorType"
                            className="text-gray-300"
                          >
                            Selector Type
                          </Label>
                          <Select
                            value={selectorType}
                            onValueChange={setSelectorType}
                          >
                            <SelectTrigger
                              id="selectorType"
                              className="bg-gray-700 border-none text-white"
                            >
                              <SelectValue placeholder="Select selector type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white">
                              <SelectItem value="css">CSS Selector</SelectItem>
                              <SelectItem value="xpath">XPath</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="selectorValue"
                            className="text-gray-300"
                          >
                            Selector Value
                          </Label>
                          <Input
                            id="selectorValue"
                            type="text"
                            value={selectorValue}
                            onChange={(e) => setSelectorValue(e.target.value)}
                            placeholder={
                              selectorType === "css"
                                ? "e.g., #container"
                                : "e.g., //div[@id='container']"
                            }
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
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
                        onChange={(e) => setTimeout(e.target.value)}
                        placeholder="e.g., 5000"
                        min="0"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="retryOnFail"
                        checked={retryOnFail}
                        onCheckedChange={(checked) =>
                          setRetryOnFail(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="retryOnFail"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Retry on Failure
                      </Label>
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
              <p>Edit Create Element</p>
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
              <p>Delete Create Element</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#87EFAC] text-black rounded-lg shadow-md">
              <Code2 size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#87EFAC] text-black rounded-lg shadow-md opacity-50">
              <Code2 size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Create Element</span>
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
                <p>{isEnabled ? "Disable Create" : "Enable Create"}</p>
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
          {elementTag} -{" "}
          {appendLocation === "specific"
            ? `${selectorType === "css" ? "CSS" : "XPath"}: ${
                selectorValue || "Not Set"
              }`
            : "Body"}
        </p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#87EFAC" }} // Matches icon color
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#87EFAC" }}
      />
    </div>
  );
};

export { CreateElementNode };
