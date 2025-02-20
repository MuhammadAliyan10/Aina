import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Variable,
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
import { Textarea } from "@/components/ui/textarea";
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

const SetVariableNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [variableName, setVariableName] = useState(
    data.config?.variableName || ""
  ); // Variable name to set
  const [valueType, setValueType] = useState(
    data.config?.valueType || "static"
  ); // Value type: static, input, json
  const [staticValue, setStaticValue] = useState(
    data.config?.staticValue || ""
  ); // Static value if type is static
  const [jsonValue, setJsonValue] = useState(data.config?.jsonValue || ""); // JSON value if type is json
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`SetVariableNode ${id}: ${data.error}`);
      setErrorMessage(data.error);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `SetVariableNode ${id}: Variable set - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`SetVariableNode ${id}: Deleted`);
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
      `SetVariableNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setErrorMessage("Description is required");
      return false;
    }
    if (!variableName.trim()) {
      setErrorMessage("Variable name is required");
      return false;
    }
    if (valueType === "static" && !staticValue.trim()) {
      setErrorMessage("Static value is required for static type");
      return false;
    }
    if (valueType === "json") {
      if (!jsonValue.trim()) {
        setErrorMessage("JSON value is required for JSON type");
        return false;
      }
      try {
        JSON.parse(jsonValue);
      } catch (e) {
        setErrorMessage("JSON value must be valid JSON");
        return false;
      }
    }
    setErrorMessage(null);
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
                  variableName,
                  valueType,
                  staticValue: valueType === "static" ? staticValue : undefined,
                  jsonValue: valueType === "json" ? jsonValue : undefined,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `SetVariableNode ${id}: Configuration saved - ${description}, Variable: ${variableName}, Type: ${valueType}`
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
                      Configure Set Variable
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
                        placeholder="e.g., Set user ID variable"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="variableName" className="text-gray-300">
                        Variable Name
                      </Label>
                      <Input
                        id="variableName"
                        type="text"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                        placeholder="e.g., userId"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valueType" className="text-gray-300">
                        Value Type
                      </Label>
                      <Select value={valueType} onValueChange={setValueType}>
                        <SelectTrigger
                          id="valueType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select value type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="static">Static Value</SelectItem>
                          <SelectItem value="input">
                            Input from Previous Node
                          </SelectItem>
                          <SelectItem value="json">JSON Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {valueType === "static" && (
                      <div>
                        <Label htmlFor="staticValue" className="text-gray-300">
                          Static Value
                        </Label>
                        <Input
                          id="staticValue"
                          type="text"
                          value={staticValue}
                          onChange={(e) => setStaticValue(e.target.value)}
                          placeholder="e.g., 12345"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    {valueType === "json" && (
                      <div>
                        <Label htmlFor="jsonValue" className="text-gray-300">
                          JSON Value
                        </Label>
                        <Textarea
                          id="jsonValue"
                          value={jsonValue}
                          onChange={(e) => setJsonValue(e.target.value)}
                          placeholder='e.g., {"id": 123, "name": "User"}'
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 h-20 font-mono"
                        />
                      </div>
                    )}
                    {errorMessage && (
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={16} />
                        <span className="text-sm">{errorMessage}</span>
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
              <p>Edit Set Variable</p>
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
              <p>Delete Set Variable</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#000000] text-white rounded-lg shadow-md">
              <Variable size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#000000] text-white rounded-lg shadow-md opacity-50">
              <Variable size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Set Variable</span>
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
                <p>{isEnabled ? "Disable Variable" : "Enable Variable"}</p>
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
          {variableName || "Unnamed"} = {valueType}
        </p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#000000" }} // Matches icon color
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#000000" }}
      />
    </div>
  );
};

export { SetVariableNode };
