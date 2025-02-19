// components/CustomAssignmentNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";

interface CustomAssignmentNodeProps {
  data: {
    fileName: string;
  };
}

export const CustomFileNode: React.FC<CustomAssignmentNodeProps> = ({
  data,
}) => {
  return (
    <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white w-48">
      <Handle
        type="source" // This handle is a source (can create connections)
        position={Position.Bottom}
        className="!bg-green-500"
        id="target-4"
      />

      <p className="text-sm text-blue-400">Assignment:</p>
      <p className="text-xs text-blue-300">{data.fileName}</p>
    </div>
  );
};
