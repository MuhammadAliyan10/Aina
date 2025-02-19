import { Handle, Position, NodeProps } from "reactflow";
import { Play } from "lucide-react";

const TriggerNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
      <div className="flex items-center gap-2">
        <Play size={16} />
        <span>{data.label || "Trigger"}</span>
      </div>

      {/* Input Field (optional) */}
      <input
        type="text"
        className="mt-2 w-full p-2 text-gray-900 rounded-md"
        placeholder="Enter trigger name"
      />

      {/* Connection Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="bg-green-400"
      />
      <Handle type="target" position={Position.Left} className="bg-red-400" />
    </div>
  );
};

export { TriggerNode };
