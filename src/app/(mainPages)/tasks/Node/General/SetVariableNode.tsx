import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Variable,
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
import DOMPurify from "dompurify";
import { ErrorBoundary } from "react-error-boundary";

interface SetVariableConfig {
  variableName: string;
  valueType: string;
  staticValue?: string;
  jsonValue?: string;
  isEnabled: boolean;
}

interface SetVariableNodeData {
  description?: string;
  config?: SetVariableConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`SetVariableNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const SetVariableNode = ({ id, data }: NodeProps<SetVariableNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [variableName, setVariableName] = useState(
    data.config?.variableName || ""
  );
  const [valueType, setValueType] = useState(
    data.config?.valueType || "static"
  );
  const [staticValue, setStaticValue] = useState(
    data.config?.staticValue || ""
  );
  const [jsonValue, setJsonValue] = useState(data.config?.jsonValue || "");
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
    if (!variableName.trim()) {
      setErrorMessage("Variable name is required");
      return false;
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
      setErrorMessage(
        "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores"
      );
      return false;
    }
    if (!["static", "input", "json"].includes(valueType)) {
      setErrorMessage("Invalid value type");
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
  }, [description, variableName, valueType, staticValue, jsonValue]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedVariableName = DOMPurify.sanitize(variableName);
    const sanitizedStaticValue =
      valueType === "static" ? DOMPurify.sanitize(staticValue) : undefined;
    const sanitizedJsonValue =
      valueType === "json" ? DOMPurify.sanitize(jsonValue) : undefined;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  variableName: sanitizedVariableName,
                  valueType,
                  staticValue: sanitizedStaticValue,
                  jsonValue: sanitizedJsonValue,
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
      `SetVariableNode ${id}: Configuration saved - ${sanitizedDescription}, Variable: ${sanitizedVariableName}, Type: ${valueType}`
    );
  }, [
    id,
    description,
    variableName,
    valueType,
    staticValue,
    jsonValue,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`SetVariableNode ${id}: Deleted`);
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
      `SetVariableNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative w-full min-w-[12rem] max-w-[20rem] text-foreground p-4 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Set Variable Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Set Variable">
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
                        Configure Set Variable
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Define the variable and its value for the workflow.
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
                          placeholder="e.g., Set user ID variable"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
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
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valueType" className="text-gray-300">
                          Value Type
                        </Label>
                        <Select value={valueType} onValueChange={setValueType}>
                          <SelectTrigger
                            id="valueType"
                            className="bg-gray-700 border-none text-white w-full"
                            aria-label="Select value type"
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
                          <Label
                            htmlFor="staticValue"
                            className="text-gray-300"
                          >
                            Static Value
                          </Label>
                          <Input
                            id="staticValue"
                            type="text"
                            value={staticValue}
                            onChange={(e) => setStaticValue(e.target.value)}
                            placeholder="e.g., 12345"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                            aria-required="true"
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
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full h-20 font-mono resize-y"
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
                <p>Edit Set Variable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span
            className="border border-r border-border h-[15px]"
            aria-hidden="true"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Delete Set Variable" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Set Variable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 w-full">
            <span
              className={`p-3 bg-black text-white rounded-lg shadow-md flex-shrink-0 ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <Variable size={20} />
            </span>
            <span className="text-sm font-semibold truncate flex-1">
              Set Variable
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
                      isEnabled ? "Disable Set Variable" : "Enable Set Variable"
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
                  <p>{isEnabled ? "Disable Variable" : "Enable Variable"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-full line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-xs text-gray-400 capitalize">
            {variableName || "Unnamed"} = {valueType}
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

export { SetVariableNode };
