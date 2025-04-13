import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Link2, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

interface HTTPRequestConfig {
  url: string;
  method: string;
  headers?: object;
  body?: object;
  timeout: number;
  isEnabled: boolean;
}

interface HTTPRequestNodeData {
  description?: string;
  config?: HTTPRequestConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`HTTPRequestNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const HTTPRequestNode = ({ id, data }: NodeProps<HTTPRequestNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [url, setUrl] = useState(data.config?.url || "");
  const [method, setMethod] = useState(data.config?.method || "GET");
  const [headers, setHeaders] = useState(
    data.config?.headers ? JSON.stringify(data.config.headers) : ""
  );
  const [body, setBody] = useState(
    data.config?.body ? JSON.stringify(data.config.body) : ""
  );
  const [timeout, setTimeout] = useState(data.config?.timeout || 5000);
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">(
    data.error ? "error" : data.output ? "running" : "idle"
  );
  const { setNodes } = useReactFlow();

  const validateInputs = useCallback(() => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!url.trim()) {
      setError("URL is required");
      return false;
    }
    try {
      new URL(url);
    } catch {
      setError("Invalid URL format");
      return false;
    }
    if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      setError("Invalid HTTP method");
      return false;
    }
    if (headers) {
      try {
        JSON.parse(headers);
      } catch {
        setError("Headers must be valid JSON");
        return false;
      }
    }
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      try {
        JSON.parse(body);
      } catch {
        setError("Body must be valid JSON");
        return false;
      }
    }
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum <= 0) {
      setError("Timeout must be a positive number");
      return false;
    }
    setError(null);
    return true;
  }, [description, url, method, headers, body, timeout]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedUrl = DOMPurify.sanitize(url);
    let sanitizedHeaders: object | undefined;
    let sanitizedBody: object | undefined;

    if (headers) {
      try {
        sanitizedHeaders = JSON.parse(DOMPurify.sanitize(headers));
      } catch {
        setError("Failed to parse sanitized headers");
        return;
      }
    }
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      try {
        sanitizedBody = JSON.parse(DOMPurify.sanitize(body));
      } catch {
        setError("Failed to parse sanitized body");
        return;
      }
    }

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  url: sanitizedUrl,
                  method,
                  headers: sanitizedHeaders,
                  body: sanitizedBody,
                  timeout: Number(timeout),
                  isEnabled,
                },
              },
            }
          : node
      )
    );

    setIsDialogOpen(false);
    setError(null);
    log.info(
      `HTTPRequestNode ${id}: Configuration saved - ${sanitizedDescription}, URL: ${sanitizedUrl}, Method: ${method}`
    );
  }, [
    id,
    description,
    url,
    method,
    headers,
    body,
    timeout,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`HTTPRequestNode ${id}: Deleted`);
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
      `HTTPRequestNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative min-w-[12rem] text-foreground p-3 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`HTTP Request Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit HTTP Request">
                      <Edit
                        size={18}
                        className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="bg-gray-800 text-white rounded-lg shadow-xl p-6"
                    aria-describedby="dialog-description"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">
                        Configure HTTP Request
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the HTTP request details for the workflow.
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
                          placeholder="e.g., Fetch user data from API"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url" className="text-gray-300">
                          URL
                        </Label>
                        <Input
                          id="url"
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="e.g., https://api.example.com/data"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="method" className="text-gray-300">
                          Method
                        </Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger
                            id="method"
                            className="bg-gray-700 border-none text-white"
                            aria-label="Select method"
                          >
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="headers" className="text-gray-300">
                          Headers (JSON)
                        </Label>
                        <Input
                          id="headers"
                          type="text"
                          value={headers}
                          onChange={(e) => setHeaders(e.target.value)}
                          placeholder='e.g., {"Content-Type": "application/json"}'
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {["POST", "PUT", "PATCH"].includes(method) && (
                        <div>
                          <Label htmlFor="body" className="text-gray-300">
                            Body (JSON)
                          </Label>
                          <Input
                            id="body"
                            type="text"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder='e.g., {"key": "value"}'
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="timeout" className="text-gray-300">
                          Timeout (ms)
                        </Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={timeout}
                          onChange={(e) => setTimeout(Number(e.target.value))}
                          placeholder="e.g., 5000"
                          min="1"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      {error && (
                        <div
                          className="flex items-center gap-2 text-red-400"
                          role="alert"
                        >
                          <AlertCircle size={16} />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="text-white border-gray-600 hover:bg-gray-700"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setError(null);
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
                <p>Edit HTTP Request</p>
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
                <button aria-label="Delete HTTP Request" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete HTTP Request</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-3 bg-black text-white rounded-lg shadow-md ${
                !isEnabled ? "opacity-50" : ""
              }`}
              aria-hidden="true"
            >
              <Link2 size={20} />
            </span>
            <span className="text-sm font-semibold">HTTP Request</span>
            <span
              className={`ml-2 w-2 h-2 rounded-full ${
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
                    className="ml-2 p-1 text-gray-400 hover:text-white"
                    onClick={handleToggleEnable}
                    aria-label={
                      isEnabled ? "Disable HTTP Request" : "Enable HTTP Request"
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
                  <p>{isEnabled ? "Disable Request" : "Enable Request"}</p>
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
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Link2 size={12} />
              <span className="truncate max-w-[9rem]">{url}</span>
            </div>
          )}
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

export { HTTPRequestNode };
