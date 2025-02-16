// components/CustomAutomationNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";

interface CustomAutomationNodeProps {
  data: {
    automationLink: string;
    email: string;
    password: string;
    websiteName: string;
    automation: "on" | "off";
  };
}

export const CustomAutomationNode: React.FC<CustomAutomationNodeProps> = ({
  data,
}) => {
  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white w-64">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        id="target-3" // Unique ID for the first target handle
      />
      <h3 className="font-semibold">{data.websiteName}</h3>
      <p className="text-sm text-gray-400">{data.automationLink}</p>
      <p className="text-xs text-gray-500 mt-2">Email: {data.email}</p>
      <p className="text-xs text-gray-500">Password: {data.password}</p>
      {/* <div className="mt-2">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            data.automation === "on" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          Automation: {data.automation}
        </span>
      </div> */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500"
        id="source-3" // Unique ID for the first source handle
      />
    </div>
  );
};
