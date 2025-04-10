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
  ChevronDown,
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
  const [sortBy, setSortBy] = useState<"title" | "createdAt" | "updatedAt">(
    "updatedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [newDoc, setNewDoc] = useState({ title: "", content: "" });
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

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

  const createDocument = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newDoc.title || "Untitled Document",
          content: newDoc.content,
        }),
      });
      if (!response.ok) throw new Error("Failed to create document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      setNewDoc({ title: "", content: "" });
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

  const handleDownload = (doc: Document) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents
    ?.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return sortOrder === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
  };

  const handleSave = () => {
    if (editingDoc) {
      updateDocument.mutate(editingDoc);
    }
  };

  const toggleSortOrder = (field: "title" | "createdAt" | "updatedAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <FileText className="h-9 w-9 text-primary animate-pulse" />
          Documents
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
      </header>

      {documentsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Create New Document */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Plus className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                New Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                placeholder="Document Title"
                value={newDoc.title}
                onChange={(e) =>
                  setNewDoc({ ...newDoc, title: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
              />
              <Textarea
                placeholder="Document Content"
                value={newDoc.content}
                onChange={(e) =>
                  setNewDoc({ ...newDoc, content: e.target.value })
                }
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[150px]"
              />
              <Button
                onClick={() => createDocument.mutate()}
                disabled={createDocument.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {createDocument.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                Create Document
              </Button>
            </CardContent>
          </Card>

          {/* Document List */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Folder className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("title")}
                    >
                      Title
                      {sortBy === "title" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("createdAt")}
                    >
                      Created
                      {sortBy === "createdAt" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("updatedAt")}
                    >
                      Updated
                      {sortBy === "updatedAt" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments && filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium">
                          {editingDoc?.id === doc.id ? (
                            <Input
                              value={editingDoc.title}
                              onChange={(e) =>
                                setEditingDoc({
                                  ...editingDoc,
                                  title: e.target.value,
                                })
                              }
                              className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                            />
                          ) : (
                            doc.title
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground">
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
                                className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                              >
                                <Download className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDoc(null)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(doc)}
                                className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="text-success hover:text-success/80 hover:bg-muted rounded-full p-2"
                              >
                                <Download className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument.mutate(doc.id)}
                                disabled={deleteDocument.isPending}
                                className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                              >
                                <Trash2 className="h-5 w-5" />
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
                        className="text-muted-foreground text-center py-6"
                      >
                        No documents found.
                        <FileText className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
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
                  className="mt-6 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[200px]"
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
