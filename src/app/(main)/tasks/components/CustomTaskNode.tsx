// components/CustomTaskNode.tsx
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Button } from "@/components/ui/button";

interface CustomTaskNodeProps {
  data: {
    title: string;
    description: string;
    automation: string;
    formattedDate: string;
    assignments?: string[];
    status: "Pending" | "Completed";
  };
  id: string;
}

export const CustomTaskNode: React.FC<CustomTaskNodeProps> = ({ data, id }) => {
  const [status, setStatus] = useState(data.status);

  const toggleStatus = () => {
    setStatus((prev) => (prev === "Pending" ? "Completed" : "Pending"));
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white w-64">
      {/* Two Target Handles (for incoming connections) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        id="target-1" // Unique ID for the first target handle
        style={{ left: "20%" }} // Position the first handle 20% from the left
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        id="target-2" // Unique ID for the second target handle
        style={{ left: "80%" }} // Position the second handle 80% from the left
      />
      <h3 className="font-semibold">{data.title}</h3>
      <p className="text-sm text-gray-400">{data.description}</p>
      <p className="text-xs text-gray-500 mt-2">Due: {data.formattedDate}</p>
      <div className="mt-2">
        {data.automation.length > 0 && data.automation.includes("on") && (
          <span className="px-2 py-1 text-xs bg-green-500 rounded-full">
            Automation: On
          </span>
        )}
      </div>
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
      {/* Status Button */}
      <Button
        onClick={toggleStatus}
        className={`mt-2 w-full ${
          status === "Pending" ? "bg-yellow-500" : "bg-green-500"
        }`}
      >
        {status}
      </Button>
      {/* Two Source Handles (for outgoing connections) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500"
        id="source-1" // Unique ID for the first source handle
        style={{ left: "20%" }} // Position the first handle 20% from the left
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500"
        id="source-2" // Unique ID for the second source handle
        style={{ left: "80%" }} // Position the second handle 80% from the left
      />
    </div>
  );
};
