// src/app/(mainPages)/documents/page.tsx
"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Edit,
  Search,
  Loader2,
  Folder,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

// Types for documents
interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const DocumentsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  // Fetch document list
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>(
    {
      queryKey: ["documents", user?.id],
      queryFn: async () => {
        const response = await fetch(`/api/documents?userId=${user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch documents");
        return response.json();
      },
      enabled: !!user?.id,
    }
  );

  // Mutation to create a document
  const createDocument = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newDocTitle || "Untitled Document",
          content: newDocContent,
        }),
      });
      if (!response.ok) throw new Error("Failed to create document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      setNewDocTitle("");
      setNewDocContent("");
      toast({ title: "Success", description: "Document created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create document",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a document
  const updateDocument = useMutation({
    mutationFn: async (doc: Document) => {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: doc.title,
          content: doc.content,
        }),
      });
      if (!response.ok) throw new Error("Failed to update document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      setEditingDoc(null);
      toast({ title: "Success", description: "Document updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update document",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      toast({ title: "Success", description: "Document deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const filteredDocuments = documents?.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
  };

  const handleSave = () => {
    if (editingDoc) {
      updateDocument.mutate(editingDoc);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-400" />
          Documents
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-neutral-700 border-neutral-600 text-white"
          />
        </div>
      </header>

      {documentsLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Create New Document */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">New Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Document Title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
              <Textarea
                placeholder="Document Content"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
              />
              <Button
                onClick={() => createDocument.mutate()}
                disabled={createDocument.isPending}
              >
                {createDocument.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Document
              </Button>
            </CardContent>
          </Card>

          {/* Document List */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Folder className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-neutral-400">Title</TableHead>
                    <TableHead className="text-neutral-400">Created</TableHead>
                    <TableHead className="text-neutral-400">Updated</TableHead>
                    <TableHead className="text-neutral-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments && filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-neutral-700">
                        <TableCell className="text-neutral-200">
                          {editingDoc?.id === doc.id ? (
                            <Input
                              value={editingDoc.title}
                              onChange={(e) =>
                                setEditingDoc({
                                  ...editingDoc,
                                  title: e.target.value,
                                })
                              }
                              className="bg-neutral-700 border-neutral-600 text-white"
                            />
                          ) : (
                            doc.title
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editingDoc?.id === doc.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                disabled={updateDocument.isPending}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDoc(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(doc)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument.mutate(doc.id)}
                                disabled={deleteDocument.isPending}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-neutral-400 text-center"
                      >
                        No documents found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {editingDoc && (
                <Textarea
                  value={editingDoc.content}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, content: e.target.value })
                  }
                  className="mt-4 bg-neutral-700 border-neutral-600 text-white min-h-[200px]"
                  placeholder="Edit document content..."
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
