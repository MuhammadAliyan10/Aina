// components/CustomTaskNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";

interface CustomTaskNodeProps {
  data: {
    title: string;
    description: string;
    formattedDate: string;
    assignments?: string[];
  };
}

export const CustomTaskNode: React.FC<CustomTaskNodeProps> = ({ data }) => {
  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white w-64">
      <Handle
        type="target" // This handle is a target (can receive connections)
        position={Position.Top}
        className="!bg-blue-500"
      />
      <h3 className="font-semibold">{data.title}</h3>
      <p className="text-sm text-gray-400">{data.description}</p>
      <p className="text-xs text-gray-500 mt-2">Due: {data.formattedDate}</p>
      {data.assignments && data.assignments.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-blue-400">Attachments:</p>
          <ul className="text-xs text-blue-300">
            {data.assignments.map((assignment, index) => (
              <li key={index}>{assignment}</li>
            ))}
          </ul>
        </div>
      )}
      <Handle
        type="source" // This handle is a source (can create connections)
        position={Position.Bottom}
        className="!bg-green-500"
      />
    </div>
  );
};
