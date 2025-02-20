import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Link, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

const GetURLNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [tabSelection, setTabSelection] = useState(
    data.config?.tabSelection || "activeTab"
  ); // activeTab, allTabs, specificTab
  const [specificTabIndex, setSpecificTabIndex] = useState(
    data.config?.specificTabIndex || 0
  ); // Index for specific tab
  const [urlPattern, setUrlPattern] = useState(data.config?.urlPattern || ""); // Optional URL filter for allTabs
  const [assignToVariable, setAssignToVariable] = useState(
    data.config?.assignToVariable || false
  ); // Renamed isVariableReq
  const [variableName, setVariableName] = useState(
    data.config?.variableName || "tabUrl"
  ); // Default variable name
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`GetURLNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `GetURLNode ${id}: URL retrieved - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`GetURLNode ${id}: Deleted`);
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
    log.info(`GetURLNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (tabSelection === "specificTab") {
      const indexNum = Number(specificTabIndex);
      if (isNaN(indexNum) || indexNum < 0) {
        setError("Tab index must be a non-negative number");
        return false;
      }
    }
    if (
      tabSelection === "allTabs" &&
      urlPattern &&
      !isValidUrlPattern(urlPattern)
    ) {
      setError("Invalid URL pattern format");
      return false;
    }
    if (assignToVariable && !variableName.trim()) {
      setError("Variable name is required when assigning to a variable");
      return false;
    }
    setError(null);
    return true;
  };

  const isValidUrlPattern = (pattern: string) => {
    // Basic URL pattern validation (allows wildcards or full URLs)
    try {
      if (pattern.includes("*")) return true; // Wildcard support
      new URL(pattern);
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
                  tabSelection,
                  specificTabIndex:
                    tabSelection === "specificTab"
                      ? Number(specificTabIndex)
                      : undefined,
                  urlPattern:
                    tabSelection === "allTabs"
                      ? urlPattern || undefined
                      : undefined,
                  assignToVariable,
                  variableName: assignToVariable ? variableName : undefined,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `GetURLNode ${id}: Configuration saved - ${description}, Tab: ${tabSelection}, Variable: ${
        assignToVariable ? variableName : "None"
      }`
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
                      Configure Get Tab URL
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
                        placeholder="e.g., Get current tab URL"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tabSelection" className="text-gray-300">
                        Tab Selection
                      </Label>
                      <Select
                        value={tabSelection}
                        onValueChange={setTabSelection}
                      >
                        <SelectTrigger
                          id="tabSelection"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select tab" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="activeTab">Active Tab</SelectItem>
                          <SelectItem value="allTabs">All Tabs</SelectItem>
                          <SelectItem value="specificTab">
                            Specific Tab
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {tabSelection === "specificTab" && (
                      <div>
                        <Label
                          htmlFor="specificTabIndex"
                          className="text-gray-300"
                        >
                          Tab Index
                        </Label>
                        <Input
                          id="specificTabIndex"
                          type="number"
                          value={specificTabIndex}
                          onChange={(e) => setSpecificTabIndex(e.target.value)}
                          placeholder="e.g., 0"
                          min="0"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    {tabSelection === "allTabs" && (
                      <div>
                        <Label htmlFor="urlPattern" className="text-gray-300">
                          URL Pattern (Optional)
                        </Label>
                        <Input
                          id="urlPattern"
                          type="text"
                          value={urlPattern}
                          onChange={(e) => setUrlPattern(e.target.value)}
                          placeholder="e.g., https://example.com/*"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assignToVariable"
                        checked={assignToVariable}
                        onCheckedChange={(checked) =>
                          setAssignToVariable(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="assignToVariable"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Assign to Variable
                      </Label>
                    </div>
                    {assignToVariable && (
                      <div>
                        <Label htmlFor="variableName" className="text-gray-300">
                          Variable Name
                        </Label>
                        <Input
                          id="variableName"
                          type="text"
                          value={variableName}
                          onChange={(e) => setVariableName(e.target.value)}
                          placeholder="e.g., tabUrl"
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
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white">
              <p>Edit Get Tab URL</p>
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
              <p>Delete Get Tab URL</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md">
              <Link size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md opacity-50">
              <Link size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Get Tab URL</span>
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
                <p>{isEnabled ? "Disable Get URL" : "Enable Get URL"}</p>
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
          {tabSelection === "activeTab"
            ? "Active Tab"
            : tabSelection === "allTabs"
            ? "All Tabs"
            : "Specific Tab"}
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

export { GetURLNode };
