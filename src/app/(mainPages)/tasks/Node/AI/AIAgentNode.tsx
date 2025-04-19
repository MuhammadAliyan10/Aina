import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Bot, Edit, Trash, Power, PowerOff, AlertCircle } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

// Task types supported by the AI Agent
const taskTypes = [
  {
    value: "textGeneration",
    label: "Text Generation",
    keywords: ["generate text", "summarize", "write"],
  },
  {
    value: "codeGeneration",
    label: "Code Generation",
    keywords: ["generate code", "write code", "program"],
  },
  {
    value: "entityExtraction",
    label: "Entity Extraction",
    keywords: ["extract entities", "identify entities", "NER"],
  },
  {
    value: "contentModeration",
    label: "Content Moderation",
    keywords: ["moderate content", "filter content", "review"],
  },
  {
    value: "contextualSearch",
    label: "Contextual Search",
    keywords: ["search", "find information", "query"],
  },
  {
    value: "decisionEngine",
    label: "Decision Engine",
    keywords: ["make decision", "evaluate", "decide"],
  },
  {
    value: "speechToText",
    label: "Speech to Text",
    keywords: ["transcribe", "speech to text", "audio to text"],
  },
  {
    value: "textToSpeech",
    label: "Text to Speech",
    keywords: ["convert to audio", "text to speech", "narrate"],
  },
  {
    value: "anomalyDetection",
    label: "Anomaly Detection",
    keywords: ["detect anomalies", "find outliers", "anomaly"],
  },
  {
    value: "dataClassification",
    label: "Data Classification",
    keywords: ["classify", "categorize", "label"],
  },
  {
    value: "imageGeneration",
    label: "Image Generation",
    keywords: ["generate image", "create image", "draw"],
  },
  {
    value: "videoGeneration",
    label: "Video Generation",
    keywords: ["generate video", "create video", "animate"],
  },
  {
    value: "audioGeneration",
    label: "Audio Generation",
    keywords: ["generate audio", "create sound", "compose"],
  },
  {
    value: "dataAnalysis",
    label: "Data Analysis",
    keywords: ["analyze data", "data insights", "statistics"],
  },
  {
    value: "predictiveModeling",
    label: "Predictive Modeling",
    keywords: ["predict", "forecast", "model"],
  },
  {
    value: "nlp",
    label: "Natural Language Processing",
    keywords: ["process text", "NLP", "language"],
  },
  {
    value: "computerVision",
    label: "Computer Vision",
    keywords: ["image analysis", "vision", "object detection"],
  },
  {
    value: "modelTraining",
    label: "Model Training",
    keywords: ["train model", "machine learning", "fit model"],
  },
  {
    value: "anomalyDetection",
    label: "Anomaly Detection",
    keywords: ["detect anomalies", "outliers", "anomaly"],
  },
];

// Default task configurations
const defaultTaskConfigs: { [key: string]: any } = {
  codeGeneration: { language: "python" },
  entityExtraction: { entityType: "all" },
  contentModeration: { moderationLevel: "standard" },
  contextualSearch: { dataset: "default" },
  decisionEngine: { decisionModel: "default" },
  speechToText: { voice: "default" },
  textToSpeech: { voice: "default" },
  anomalyDetection: { threshold: 0.95 },
  dataClassification: { classificationType: "binary" },
  imageGeneration: { style: "default" },
  videoGeneration: { format: "mp4" },
  audioGeneration: { format: "mp3" },
  dataAnalysis: { analysisType: "summary" },
  predictiveModeling: { modelType: "regression" },
  nlp: { task: "sentiment" },
  computerVision: { task: "object-detection" },
  modelTraining: { algorithm: "default" },
};

const AIAgentNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [prompt, setPrompt] = useState(data.config?.prompt || "");
  const [inferredTask, setInferredTask] = useState(
    data.config?.inferredTask || "textGeneration"
  );
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const { setNodes } = useReactFlow();

  // Infer task type from prompt
  const inferTaskType = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    for (const task of taskTypes) {
      if (task.keywords.some((keyword) => lowerPrompt.includes(keyword))) {
        return task.value;
      }
    }
    return "textGeneration"; // Default to text generation if no match
  };

  useEffect(() => {
    if (data.error) {
      setStatus("error");
      setError(data.error);
      log.error(`AIAgentNode ${id}: ${data.error}`);
    } else if (data.output) {
      setStatus("running");
      log.info(
        `AIAgentNode ${id}: Task ${inferredTask} completed - ${JSON.stringify(
          data.output
        )}`
      );
    } else {
      setStatus("idle");
      setError(null);
    }
  }, [data.error, data.output, id, inferredTask]);

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`AIAgentNode ${id}: Deleted`);
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
    log.info(`AIAgentNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  };

  const validateInputs = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!prompt.trim()) {
      setError("Prompt is required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    const newInferredTask = inferTaskType(prompt);
    setInferredTask(newInferredTask);

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
                  prompt,
                  inferredTask: newInferredTask,
                  model: "default", // Hidden default
                  timeout: 30000, // Hidden default
                  retries: 3, // Hidden default
                  priority: "normal", // Hidden default
                  isEnabled,
                  taskConfig: defaultTaskConfigs[newInferredTask] || {}, // Apply default config for task
                },
              },
            }
          : node
      )
    );
    setIsDialogOpen(false);
    log.info(
      `AIAgentNode ${id}: Configuration saved - Prompt: ${prompt}, Inferred Task: ${newInferredTask}`
    );
  };

  return (
    <div
      className={`relative min-w-[14rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg ${
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
                <DialogContent className="bg-gray-800 text-white rounded-lg shadow-xl p-6 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                      Configure AI Agent
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
                        placeholder="e.g., Automate task with AI"
                        className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prompt" className="text-gray-300">
                        Prompt
                      </Label>
                      <Input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Generate a Python script or classify this text"
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
              <p>Edit AI Agent</p>
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
              <p>Delete AI Agent</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          {(isEnabled && (
            <span className="p-3 bg-[#FF6B6B] text-black rounded-lg shadow-md">
              <Bot size={20} />
            </span>
          )) || (
            <span className="p-3 bg-[#FF6B6B] text-black rounded-lg shadow-md opacity-50">
              <Bot size={20} />
            </span>
          )}
          <span className="text-sm font-semibold">AI Agent</span>
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
                <p>{isEnabled ? "Disable AI Agent" : "Enable AI Agent"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic max-w-[12rem] truncate">
            {description}
          </p>
        )}
        {inferredTask && (
          <p className="text-xs text-gray-300 max-w-[12rem] truncate">
            Task:{" "}
            {taskTypes.find((t) => t.value === inferredTask)?.label ||
              inferredTask}
          </p>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "0.6rem", height: "0.6rem", background: "#FF6B6B" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem", background: "#FF6B6B" }}
      />
    </div>
  );
};

export { AIAgentNode };
