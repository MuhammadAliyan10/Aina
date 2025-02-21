// app/uploads/page.tsx
"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UploadedItem {
  id: string;
  name: string;
  type: "file" | "note";
  size?: number;
  content?: string;
  createdAt: Date;
}

export default function UploadsPage() {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [note, setNote] = useState("");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newItems = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: "file" as const,
        size: file.size,
        createdAt: new Date(),
      }));

      setItems((prev) => [...prev, ...newItems]);
      toast({
        title: "Success",
        description: `${files.length} file${
          files.length > 1 ? "s" : ""
        } uploaded`,
      });
    },
    []
  );

  const handleNoteSubmit = useCallback(() => {
    if (!note.trim()) {
      toast({
        title: "Error",
        description: "Note cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newNote: UploadedItem = {
      id: crypto.randomUUID(),
      name: `Note-${new Date().toLocaleDateString()}`,
      type: "note",
      content: note,
      createdAt: new Date(),
    };

    setItems((prev) => [...prev, newNote]);
    setNote("");
    toast({
      title: "Success",
      description: "Note added",
    });
  }, [note]);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Deleted",
      description: "Item removed",
    });
  }, []);

  return (
    <div className="container mx-auto py-12 px-6">
      {/* Enhanced Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        Uploads & Notes Management
      </h1>

      <Card className="shadow-md">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Upload Section
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <Label
                htmlFor="file-upload"
                className="text-gray-700 font-medium"
              >
                Upload Files
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="border-gray-400 focus:border-gray-600"
                />
                <Upload className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="note-input" className="text-gray-700 font-medium">
                Add Note
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="note-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note..."
                  className="border-gray-400 focus:border-gray-600"
                />
                <Button
                  onClick={handleNoteSubmit}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-800 py-4">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 py-4">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 py-4">
                    Details
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 py-4">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-gray-900 font-medium py-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                          item.type === "file"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-gray-300 text-gray-900"
                        }`}
                      >
                        <File className="h-4 w-4 mr-1" />
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {item.type === "file"
                        ? `${(item.size! / 1024).toFixed(2)} KB`
                        : item.content?.substring(0, 30) + "..."}
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {item.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-600 font-medium">
              No items uploaded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
