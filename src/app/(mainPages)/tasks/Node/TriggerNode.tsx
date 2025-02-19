import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Play, Edit, Trash } from "lucide-react";
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

const TriggerNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
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
        <Play
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
        <span className="border border-r-white h-[15px]"></span>
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
                Edit Description
              </DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <DialogFooter className="mt-4">
              <Button
                onClick={() => handleSave(description)}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Play size={20} />
          </span>
          <span className="text-sm font-semibold">Trigger</span>
        </div>
        {description && (
          <p className="text-xs text-gray-400 italic">{description}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem" }}
      />
    </div>
  );
};

export { TriggerNode };
