import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import {
  Play,
  Edit,
  Trash,
  Workflow,
  NotebookPen,
  Settings,
} from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

const NoteNode = ({ id, data }: NodeProps) => {
  const [notes, setNotes] = useState(data.notes || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleSave = (newDescription: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, description: newDescription } }
          : node
      )
    );
    setIsDialogOpen(false);
  };

  return (
    <div className="relative min-w-[12rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg">
      {/* Action buttons, visible on hover */}
      <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <Settings
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
        />
        <span className="border border-r-white h-[15px]"></span>
        <Trash
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
      </div>
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <span className="p-3 bg-black text-white rounded-lg shadow-md">
            <NotebookPen size={20} />
          </span>
          <span className="text-sm font-semibold">Notes</span>
        </div>
        <Textarea
          value={notes}
          rows={5}
          placeholder="Enter whatever you want"
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export { NoteNode };
