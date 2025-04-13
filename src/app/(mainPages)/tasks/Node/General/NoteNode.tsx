import { NodeProps, useReactFlow } from "reactflow";
import { NotebookPen, Edit, Trash, Power, PowerOff } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DOMPurify from "dompurify";
import { ErrorBoundary } from "react-error-boundary";

interface NoteConfig {
  isEnabled: boolean;
}

interface NoteNodeData {
  title?: string;
  notes?: string;
  config?: NoteConfig;
}

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};

const ErrorFallback = ({ error }: { error: Error }) => {
  log.error(`NoteNode Error: ${error.message}`);
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
      <p>Error: {error.message}</p>
    </div>
  );
};

const NoteNode = ({ id, data }: NodeProps<NoteNodeData>) => {
  const [title, setTitle] = useState(data.title || "Note");
  const [notes, setNotes] = useState(data.notes || "");
  const [isEnabled, setIsEnabled] = useState(data.config?.isEnabled !== false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const validateInputs = useCallback(() => {
    if (!title.trim()) {
      return "Untitled Note";
    }
    return title.trim();
  }, [title]);

  const handleSave = useCallback(() => {
    const validatedTitle = validateInputs();
    const sanitizedTitle = DOMPurify.sanitize(validatedTitle);
    const sanitizedNotes = DOMPurify.sanitize(notes);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                title: sanitizedTitle,
                notes: sanitizedNotes,
                config: {
                  isEnabled,
                },
              },
            }
          : node
      )
    );

    setIsDialogOpen(false);
    log.info(`NoteNode ${id}: Saved - Title: ${sanitizedTitle}`);
  }, [id, title, notes, isEnabled, validateInputs, setNodes]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    log.info(`NoteNode ${id}: Deleted`);
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
                config: { isEnabled: newEnabledState },
              },
            }
          : node
      )
    );
    log.info(`NoteNode ${id}: ${newEnabledState ? "Enabled" : "Disabled"}`);
  }, [id, isEnabled, setNodes]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`relative w-full min-w-[12rem] max-w-[20rem] text-foreground p-4 rounded-xl shadow-md border border-border group bg-card transition-all hover:shadow-lg ${
          !isEnabled ? "opacity-50" : ""
        }`}
        role="region"
        aria-label={`Note Node ${id}`}
      >
        <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-card rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button aria-label="Edit Note">
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
                        Edit Note
                      </DialogTitle>
                      <DialogDescription id="dialog-description">
                        Modify the note details for the workflow.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-gray-300">
                          Title
                        </Label>
                        <Input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Workflow Step Info"
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-gray-300">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter your notes here"
                          rows={5}
                          className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full resize-y"
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2 flex-wrap">
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
                <p>Edit Note</p>
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
                <button aria-label="Delete Note" onClick={handleDelete}>
                  <Trash
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700 text-white">
                <p>Delete Note</p>
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
              <NotebookPen size={20} />
            </span>
            <span className="text-sm font-semibold truncate flex-1">
              {title}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-1 text-gray-400 hover:text-white flex-shrink-0"
                    onClick={handleToggleEnable}
                    aria-label={isEnabled ? "Disable Note" : "Enable Note"}
                  >
                    {isEnabled ? (
                      <Power size={16} className="text-green-500" />
                    ) : (
                      <PowerOff size={16} className="text-red-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-700 text-white">
                  <p>{isEnabled ? "Disable Note" : "Enable Note"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {notes && (
            <p className="text-xs text-gray-400 italic max-w-full line-clamp-2">
              {notes}
            </p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export { NoteNode };
