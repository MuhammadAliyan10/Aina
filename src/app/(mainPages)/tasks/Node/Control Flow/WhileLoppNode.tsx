import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Infinity,
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

const WhileLoopNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [conditionType, setConditionType] = useState(
    data.config?.conditionType || "exists"
  ); // Type of condition
  const [selectorType, setSelectorType] = useState(
    data.config?.selectorType || "css"
  ); // css or xpath
  const [selectorValue, setSelectorValue] = useState(
    data.config?.selectorValue || ""
  ); // Element selector
  const [comparison, setComparison] = useState(
    data.config?.comparison || "equals"
  ); // Comparison operator
  const [expectedValue, setExpectedValue] = useState(
    data.config?.expectedValue || ""
  ); // Expected value for comparison
  const [maxIterations, setMaxIterations] = useState(
    data.config?.maxIterations || 100
  ); // Max iterations to prevent infinite loop
  const [delay, setDelay] = useState(data.config?.delay || 1000); // Delay between iterations in ms
  const [timeout, setTimeout] = useState(data.config?.timeout || 30000); // Overall timeout in ms
  const [retryOnFail, setRetryOnFail] = useState(
    data.config?.retryOnFail || false
  ); // Retry if condition check fails
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`WhileLoopNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `WhileLoopNode ${id}: Loop executed - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`WhileLoopNode ${id}: Deleted`);
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
      `WhileLoopNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!selectorValue.trim()) {
      setError("Selector value is required");
      return false;
    }
    if (conditionType !== "exists" && !expectedValue.trim()) {
      setError("Expected value is required for this condition type");
      return false;
    }
    const maxIterationsNum = Number(maxIterations);
    if (isNaN(maxIterationsNum) || maxIterationsNum < 1) {
      setError("Max iterations must be a positive number");
      return false;
    }
    const delayNum = Number(delay);
    if (isNaN(delayNum) || delayNum < 0) {
      setError("Delay must be a non-negative number");
      return false;
    }
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 0) {
      setError("Timeout must be a non-negative number");
      return false;
    }
    if (timeoutNum < delayNum) {
      setError("Timeout must be greater than delay");
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
                  conditionType,
                  selectorType,
                  selectorValue,
                  comparison:
                    conditionType !== "exists" ? comparison : undefined,
                  expectedValue:
                    conditionType !== "exists" ? expectedValue : undefined,
                  maxIterations: Number(maxIterations),
                  delay: Number(delay),
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
      `WhileLoopNode ${id}: Configuration saved - ${description}, Condition: ${conditionType}, Selector: ${selectorValue}`
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
                      Configure While Loop
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
                        placeholder="e.g., Loop while button exists"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="conditionType" className="text-gray-300">
                        Condition Type
                      </Label>
                      <Select
                        value={conditionType}
                        onValueChange={setConditionType}
                      >
                        <SelectTrigger
                          id="conditionType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select condition type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="exists">Element Exists</SelectItem>
                          <SelectItem value="text">Text Content</SelectItem>
                          <SelectItem value="attribute">
                            Attribute Value
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="selectorType" className="text-gray-300">
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
                      <Label htmlFor="selectorValue" className="text-gray-300">
                        Selector Value
                      </Label>
                      <Input
                        id="selectorValue"
                        type="text"
                        value={selectorValue}
                        onChange={(e) => setSelectorValue(e.target.value)}
                        placeholder={
                          selectorType === "css"
                            ? "e.g., #my-button"
                            : "e.g., //button[@id='my-button']"
                        }
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {conditionType !== "exists" && (
                      <>
                        <div>
                          <Label htmlFor="comparison" className="text-gray-300">
                            Comparison
                          </Label>
                          <Select
                            value={comparison}
                            onValueChange={setComparison}
                          >
                            <SelectTrigger
                              id="comparison"
                              className="bg-gray-700 border-none text-white"
                            >
                              <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-white">
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="notEquals">
                                Not Equals
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="expectedValue"
                            className="text-gray-300"
                          >
                            Expected Value
                          </Label>
                          <Input
                            id="expectedValue"
                            type="text"
                            value={expectedValue}
                            onChange={(e) => setExpectedValue(e.target.value)}
                            placeholder={
                              conditionType === "text"
                                ? "e.g., Submit"
                                : "e.g., disabled"
                            }
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="maxIterations" className="text-gray-300">
                        Max Iterations
                      </Label>
                      <Input
                        id="maxIterations"
                        type="number"
                        value={maxIterations}
                        onChange={(e) => setMaxIterations(e.target.value)}
                        placeholder="e.g., 100"
                        min="1"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delay" className="text-gray-300">
                        Delay Between Iterations (ms)
                      </Label>
                      <Input
                        id="delay"
                        type="number"
                        value={delay}
                        onChange={(e) => setDelay(e.target.value)}
                        placeholder="e.g., 1000"
                        min="0"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeout" className="text-gray-300">
                        Overall Timeout (ms)
                      </Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(e.target.value)}
                        placeholder="e.g., 30000"
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
              <p>Edit While Loop</p>
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
              <p>Delete While Loop</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#92C5FD] text-black rounded-lg shadow-md">
              <Infinity size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#92C5FD] text-black rounded-lg shadow-md opacity-50">
              <Infinity size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">While Loop</span>
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
                <p>{isEnabled ? "Disable While Loop" : "Enable While Loop"}</p>
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
          {conditionType} - {selectorType === "css" ? "CSS" : "XPath"}:{" "}
          {selectorValue || "Not Set"}
        </p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#92C5FD" }} // Matches icon color
      />
      <Handle
        type="source"
        position={Position.Right}
        id="loop"
        style={{
          top: "30%",
          width: "0.6rem",
          height: "0.6rem",
          background: "#92C5FD",
        }} // Loop continues
      />
      <Handle
        type="source"
        position={Position.Right}
        id="exit"
        style={{
          top: "70%",
          width: "0.6rem",
          height: "0.6rem",
          background: "#92C5FD",
        }} // Loop exits
      />
    </div>
  );
};

export { WhileLoopNode };
