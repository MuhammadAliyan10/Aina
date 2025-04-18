// components/ui/file-input.tsx
import React from "react";

interface FileInputProps {
  onChange: (file: File) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <input
      type="file"
      onChange={handleFileChange}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
  );
};
