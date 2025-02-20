import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Lock, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

const BrowserAuthenticationNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [authType, setAuthType] = useState(data.config?.authType || "form"); // Auth type: form, oauth
  const [usernameSelector, setUsernameSelector] = useState(
    data.config?.usernameSelector || ""
  ); // Selector for username field
  const [passwordSelector, setPasswordSelector] = useState(
    data.config?.passwordSelector || ""
  ); // Selector for password field
  const [username, setUsername] = useState(data.config?.username || ""); // Username value
  const [password, setPassword] = useState(data.config?.password || ""); // Password value
  const [submitSelector, setSubmitSelector] = useState(
    data.config?.submitSelector || ""
  ); // Selector for submit button
  const [oauthUrl, setOauthUrl] = useState(data.config?.oauthUrl || ""); // OAuth URL if applicable
  const [timeout, setTimeout] = useState(data.config?.timeout || 5000); // Timeout in milliseconds
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false); // Default to enabled
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle"); // Execution status
  const { setNodes } = useReactFlow();

  // Sync status with data from AutomationExecutor (log output/error instead of displaying)
  useEffect(() => {
    if (data.error) {
      setStatus("error");
      log.error(`BrowserAuthenticationNode ${id}: ${data.error}`);
      setErrorMessage(data.error);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `BrowserAuthenticationNode ${id}: Authentication completed - ${JSON.stringify(
          data.output
        )}`
      );
    } else {
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [data.error, data.output, id]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`BrowserAuthenticationNode ${id}: Deleted`);
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
      `BrowserAuthenticationNode ${id}: ${
        newEnabledState ? "Enabled" : "Disabled"
      }`
    );
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setErrorMessage("Description is required");
      return false;
    }
    if (authType === "form") {
      if (!usernameSelector.trim()) {
        setErrorMessage(
          "Username selector is required for form authentication"
        );
        return false;
      }
      if (!passwordSelector.trim()) {
        setErrorMessage(
          "Password selector is required for form authentication"
        );
        return false;
      }
      if (!username.trim()) {
        setErrorMessage("Username is required for form authentication");
        return false;
      }
      if (!password.trim()) {
        setErrorMessage("Password is required for form authentication");
        return false;
      }
      if (!submitSelector.trim()) {
        setErrorMessage("Submit selector is required for form authentication");
        return false;
      }
    } else if (authType === "oauth") {
      if (!oauthUrl.trim()) {
        setErrorMessage("OAuth URL is required for OAuth authentication");
        return false;
      }
    }
    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 0) {
      setErrorMessage("Timeout must be a non-negative number");
      return false;
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
                  authType,
                  usernameSelector:
                    authType === "form" ? usernameSelector : undefined,
                  passwordSelector:
                    authType === "form" ? passwordSelector : undefined,
                  username: authType === "form" ? username : undefined,
                  password: authType === "form" ? password : undefined,
                  submitSelector:
                    authType === "form" ? submitSelector : undefined,
                  oauthUrl: authType === "oauth" ? oauthUrl : undefined,
                  timeout: Number(timeout),
                  isEnabled,
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `BrowserAuthenticationNode ${id}: Configuration saved - ${description}, Type: ${authType}`
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
                      Configure Browser Authentication
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
                        placeholder="e.g., Login to website"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="authType" className="text-gray-300">
                        Authentication Type
                      </Label>
                      <Select value={authType} onValueChange={setAuthType}>
                        <SelectTrigger
                          id="authType"
                          className="bg-gray-700 border-none text-white"
                        >
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                          <SelectItem value="form">Form Login</SelectItem>
                          <SelectItem value="oauth">OAuth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {authType === "form" && (
                      <>
                        <div>
                          <Label
                            htmlFor="usernameSelector"
                            className="text-gray-300"
                          >
                            Username Selector
                          </Label>
                          <Input
                            id="usernameSelector"
                            type="text"
                            value={usernameSelector}
                            onChange={(e) =>
                              setUsernameSelector(e.target.value)
                            }
                            placeholder="e.g., #username"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="passwordSelector"
                            className="text-gray-300"
                          >
                            Password Selector
                          </Label>
                          <Input
                            id="passwordSelector"
                            type="text"
                            value={passwordSelector}
                            onChange={(e) =>
                              setPasswordSelector(e.target.value)
                            }
                            placeholder="e.g., #password"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-gray-300">
                            Username
                          </Label>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g., user@example.com"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password" className="text-gray-300">
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="e.g., ********"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="submitSelector"
                            className="text-gray-300"
                          >
                            Submit Button Selector
                          </Label>
                          <Input
                            id="submitSelector"
                            type="text"
                            value={submitSelector}
                            onChange={(e) => setSubmitSelector(e.target.value)}
                            placeholder="e.g., #login-button"
                            className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                    {authType === "oauth" && (
                      <div>
                        <Label htmlFor="oauthUrl" className="text-gray-300">
                          OAuth URL
                        </Label>
                        <Input
                          id="oauthUrl"
                          type="text"
                          value={oauthUrl}
                          onChange={(e) => setOauthUrl(e.target.value)}
                          placeholder="e.g., https://auth.example.com/oauth"
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
                        onChange={(e) => setTimeout(e.target.value)}
                        placeholder="e.g., 5000"
                        min="0"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
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
              <p>Edit Browser Authentication</p>
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
              <p>Delete Browser Authentication</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Display */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#FDE047] text-black rounded-lg shadow-md">
              <Lock size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#FDE047] text-black rounded-lg shadow-md opacity-50">
              <Lock size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">Browser Authentication</span>
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
                <p>{isEnabled ? "Disable Auth" : "Enable Auth"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
            {description}
          </p>
        )}
        <p className="text-xs text-gray-300 capitalize">Type: {authType}</p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#FDE047" }} // Matches Browser category color
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#FDE047" }}
      />
    </div>
  );
};

export { BrowserAuthenticationNode };
