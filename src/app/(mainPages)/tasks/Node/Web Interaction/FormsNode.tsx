// src/Node/Web Interaction/FormsNode.ts
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Pi, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const FillFormNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [selectorType, setSelectorType] = useState(
    data.config?.selectorType || "css"
  );
  const [selectorValue, setSelectorValue] = useState(
    data.config?.selectorValue || ""
  );
  const [formFields, setFormFields] = useState<
    { name: string; value: string; selector: string }[]
  >(data.config?.formFields || [{ name: "", value: "", selector: "" }]);
  const [formTimeout, setFormTimeout] = useState(data.config?.timeout || 5000);
  const [retryOnFail, setRetryOnFail] = useState(
    data.config?.retryOnFail || false
  );
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`FillFormNode ${id}: ${data.error}`);
    } else if (data.output?.filled) {
      setStatus("running");
      log.info(
        `FillFormNode ${id}: Form filled - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`FillFormNode ${id}: Deleted`);
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
    log.info(`FillFormNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  };

  const handleAddField = () => {
    setFormFields([...formFields, { name: "", value: "", selector: "" }]);
  };

  const handleRemoveField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    key: "name" | "value" | "selector",
    value: string
  ) => {
    const updatedFields = [...formFields];
    updatedFields[index][key] = value;
    setFormFields(updatedFields);
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!selectorValue.trim()) {
      setError("Form selector value is required");
      return false;
    }
    const timeoutNum = Number(formTimeout);
    if (isNaN(timeoutNum) || timeoutNum < 0) {
      setError("Timeout must be a non-negative number");
      return false;
    }
    if (
      formFields.length === 0 ||
      formFields.every(
        (field) =>
          !field.name.trim() || !field.value.trim() || !field.selector.trim()
      )
    ) {
      setError(
        "At least one valid form field (name, value, selector) is required"
      );
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    const formData = formFields
      .filter(
        (field) =>
          field.name.trim() && field.value.trim() && field.selector.trim()
      )
      .reduce((acc, field) => {
        acc[field.selector] = field.value;
        return acc;
      }, {} as Record<string, string>);

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
                  selectorType,
                  selectorValue,
                  formFields,
                  formData,
                  timeout: Number(formTimeout),
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
      `FillFormNode ${id}: Configuration saved - ${description}, Selector: ${selectorValue}, Fields: ${
        Object.keys(formData).length
      }`
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
                      Configure Fill Form
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
                        placeholder="e.g., Fill login form"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="selectorType" className="text-gray-300">
                        Form Selector Type
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
                        Form Selector Value
                      </Label>
                      <Input
                        id="selectorValue"
                        type="text"
                        value={selectorValue}
                        onChange={(e) => setSelectorValue(e.target.value)}
                        placeholder={
                          selectorType === "css"
                            ? "e.g., #login-form"
                            : "e.g., //form[@id='login-form']"
                        }
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Form Fields</Label>
                      {formFields.map((field, index) => (
                        <div
                          key={index}
                          className="mb-2 grid grid-cols-[30%_30%_30%_10%] gap-2"
                        >
                          <Input
                            type="text"
                            value={field.name}
                            onChange={(e) =>
                              handleFieldChange(index, "name", e.target.value)
                            }
                            placeholder="Field name (e.g., username)"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                          <Input
                            type="text"
                            value={field.selector}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "selector",
                                e.target.value
                              )
                            }
                            placeholder={
                              selectorType === "css"
                                ? "e.g., #username"
                                : "e.g., //input[@id='username']"
                            }
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              handleFieldChange(index, "value", e.target.value)
                            }
                            placeholder="Value"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            variant="destructive"
                            onClick={() => handleRemoveField(index)}
                            className="bg-red-600 hover:bg-red-500"
                          >
                            <Trash
                              size={14}
                              className="cursor-pointer text-white hover:text-red-500 transition-colors"
                            />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={handleAddField}
                        className="mt-2 text-white border-gray-600 hover:bg-gray-700"
                      >
                        Add Field
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="formTimeout" className="text-gray-300">
                        Timeout (ms)
                      </Label>
                      <Input
                        id="formTimeout"
                        type="number"
                        value={formTimeout}
                        onChange={(e) => setFormTimeout(e.target.value)}
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
              <p>Edit Fill Form</p>
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
              <p>Delete Fill Form</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#87EFAC] text-black rounded-lg shadow-md">
              <Pi size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#87EFAC] text-black rounded-lg shadow-md opacity-50">
              <Pi size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Fill Form</span>
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
                <p>{isEnabled ? "Disable Fill Form" : "Enable Fill Form"}</p>
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
          {selectorType === "css" ? "CSS" : "XPath"}:{" "}
          {selectorValue || "Not Set"} ({formFields.length} fields)
        </p>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#87EFAC" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#87EFAC" }}
      />
    </div>
  );
};

export { FillFormNode };
