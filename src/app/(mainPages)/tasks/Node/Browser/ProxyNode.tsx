import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  ShieldPlus,
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

const ProxyNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [protocol, setProtocol] = useState(data.config?.protocol || "http"); // http, https, socks5
  const [host, setHost] = useState(data.config?.host || ""); // Proxy server host
  const [port, setPort] = useState(data.config?.port || 433); // Proxy server port
  const [username, setUsername] = useState(data.config?.username || ""); // Optional proxy auth
  const [password, setPassword] = useState(data.config?.password || ""); // Optional proxy auth
  const [bypassList, setBypassList] = useState(data.config?.bypassList || ""); // Comma-separated list
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`ProxyNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `ProxyNode ${id}: Proxy applied - ${JSON.stringify(data.output)}`
      );
    } else {
      setStatus("idle");
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`ProxyNode ${id}: Deleted`);
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
    log.info(`ProxyNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!host.trim()) {
      setError("Host is required");
      return false;
    }
    const portNum = Number(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError("Port must be a number between 1 and 65535");
      return false;
    }
    if ((username && !password) || (!username && password)) {
      setError("Both username and password are required if one is provided");
      return false;
    }
    if (bypassList) {
      const domains = bypassList.split(",").map((d) => d.trim());
      const invalidDomain = domains.find((d) => !isValidDomain(d));
      if (invalidDomain) {
        setError(`Invalid bypass domain: ${invalidDomain}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const isValidDomain = (domain: string) => {
    // Basic domain validation (simplified)
    return (
      /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(domain) ||
      domain === "localhost"
    );
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
                  protocol,
                  host,
                  port: Number(port),
                  username: username || undefined,
                  password: password || undefined,
                  bypassList: bypassList
                    ? bypassList.split(",").map((d) => d.trim())
                    : undefined,
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `ProxyNode ${id}: Configuration saved - ${description}, Host: ${host}:${port}, Protocol: ${protocol}`
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
                      Configure Proxy
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
                        placeholder="e.g., Configure proxy for secure browsing"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protocol" className="text-gray-300">
                        Protocol
                      </Label>
                      <Select value={protocol} onValueChange={setProtocol}>
                        <SelectTrigger
                          id="protocol"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="https">HTTPS</SelectItem>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="host" className="text-gray-300">
                        Host
                      </Label>
                      <Input
                        id="host"
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="e.g., proxy.example.com"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port" className="text-gray-300">
                        Port
                      </Label>
                      <Input
                        id="port"
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="e.g., 433"
                        min="1"
                        max="65535"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username" className="text-gray-300">
                          Username (Optional)
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g., user123"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-gray-300">
                          Password (Optional)
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="e.g., pass123"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bypassList" className="text-gray-300">
                        Bypass List (Optional)
                      </Label>
                      <Textarea
                        id="bypassList"
                        value={bypassList}
                        onChange={(e) => setBypassList(e.target.value)}
                        placeholder="e.g., example1.com, example2.com"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
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
              <p>Edit Proxy</p>
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
              <p>Delete Proxy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md">
              <ShieldPlus size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#fde047] text-black rounded-lg shadow-md opacity-50">
              <ShieldPlus size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Proxy</span>
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
                <p>{isEnabled ? "Disable Proxy" : "Enable Proxy"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        {host && (
          <p className="text-xs text-gray-300">{`${protocol}://${host}:${port}`}</p>
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

export { ProxyNode };
