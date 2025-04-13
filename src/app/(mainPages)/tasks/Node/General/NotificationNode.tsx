import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Bell, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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

interface NotificationConfig {
  notificationType: string;
  recipient: string;
  message: string;
  isEnabled: boolean;
}

interface NotificationNodeData {
  description?: string;
  config?: NotificationConfig;
  error?: string;
  output?: { timestamp: string };
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`NotificationNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const NotificationNode = ({ id, data }: NodeProps<NotificationNodeData>) => {
  const [description, setDescription] = useState(data.description || "");
  const [notificationType, setNotificationType] = useState(
    data.config?.notificationType || "in-app"
  );
  const [recipient, setRecipient] = useState(data.config?.recipient || "");
  const [message, setMessage] = useState(data.config?.message || "");
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
    if (!["in-app", "email", "sms"].includes(notificationType)) {
      setError("Invalid notification type");
      return false;
    }
    if (!recipient.trim()) {
      setError("Recipient is required");
      return false;
    }
    if (notificationType === "email" && !/\S+@\S+\.\S+/.test(recipient)) {
      setError("Invalid email address");
      return false;
    }
    if (notificationType === "sms" && !/^\+?\d{10,15}$/.test(recipient)) {
      setError("Invalid phone number format");
      return false;
    }
    if (!message.trim()) {
      setError("Message content is required");
      return false;
    }
    setError(null);
    return true;
  }, [description, notificationType, recipient, message]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) return;

    const sanitizedDescription = DOMPurify.sanitize(description);
    const sanitizedRecipient = DOMPurify.sanitize(recipient);
    const sanitizedMessage = DOMPurify.sanitize(message);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: sanitizedDescription,
                config: {
                  notificationType,
                  recipient: sanitizedRecipient,
                  message: sanitizedMessage,
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
      `NotificationNode ${id}: Configuration saved - ${sanitizedDescription}, Type: ${notificationType}, Recipient: ${sanitizedRecipient}`
    );
  }, [
    id,
    description,
    notificationType,
    recipient,
    message,
    isEnabled,
    validateInputs,
    setNodes,
  ]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`NotificationNode ${id}: Deleted`);
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
      `NotificationNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`
    );
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative min-w-[12rem] text-foreground p-3 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Notification Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Notification">
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
                        Configure Notification
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Set up the notification details for the workflow.
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
                          placeholder="e.g., Send alert to admin"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="notificationType"
                          className="text-gray-300"
                        >
                          Notification Type
                        </Label>
                        <Select
                          value={notificationType}
                          onValueChange={setNotificationType}
                        >
                          <SelectTrigger
                            id="notificationType"
                            className="bg-gray-700 border-none text-white"
                            aria-label="Select notification type"
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-white">
                            <SelectItem value="in-app">In-App</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="recipient" className="text-gray-300">
                          Recipient
                        </Label>
                        <Input
                          id="recipient"
                          type="text"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder={
                            notificationType === "email"
                              ? "e.g., user@example.com"
                              : notificationType === "sms"
                              ? "e.g., +1234567890"
                              : "e.g., user123"
                          }
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-gray-300">
                          Message
                        </Label>
                        <Input
                          id="message"
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="e.g., Task completed"
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
                <p>Edit Notification</p>
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
                <button aria-label="Delete Notification" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Notification</p>
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
              <Bell size={20} />
            </span>
            <span className="text-sm font-semibold">Notification</span>
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
                      isEnabled ? "Disable Notification" : "Enable Notification"
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
                  <p>
                    {isEnabled ? "Disable Notification" : "Enable Notification"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && (
            <p className="text-xs text-gray-400 italic max-w-[10rem] truncate">
              {description}
            </p>
          )}
          {notificationType && (
            <p className="text-xs text-gray-400 capitalize">
              {notificationType}
            </p>
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

export { NotificationNode };
