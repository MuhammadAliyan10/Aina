"use client";

import React, { useState, useRef } from "react";
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
  Upload,
  Eye,
  File,
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
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  title: string;
  content?: string; // Optional for files
  fileUrl?: string; // For uploaded files
  fileType?: string; // MIME type
  category?: string; // For folder-like organization
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
  const [newDoc, setNewDoc] = useState({
    title: "",
    content: "",
    file: null as File | null,
  });
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>(
    {
      queryKey: ["documents", user?.id],
      queryFn: async () => {
        const response = await fetch(`/api/documents?userId=${user?.id}`);
        if (!response.ok) throw new Error("Failed to fetch documents");
        return response.json();
      },
      enabled: !!user?.id,
    }
  );

  const createDocument = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("userId", user?.id || "");
      formData.append("title", newDoc.title || "Untitled Document");
      if (newDoc.content) formData.append("content", newDoc.content);
      if (newDoc.file) formData.append("file", newDoc.file);

      const response = await fetch(`/api/documents`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      setNewDoc({ title: "", content: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
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
  });

  const bulkDeleteDocuments = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/documents/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to delete ${id}`);
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      setSelectedDocs([]);
      toast({ title: "Success", description: "Selected documents deleted" });
    },
  });

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    } else {
      const blob = new Blob([doc.content || ""], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const exportDocuments = () => {
    const csv = filteredDocuments?.map((doc) => ({
      Title: doc.title,
      Category: doc.category || "Uncategorized",
      CreatedAt: doc.createdAt,
      UpdatedAt: doc.updatedAt,
      Type: doc.fileType || "text",
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Title", "Category", "CreatedAt", "UpdatedAt", "Type"].join(","),
        ...csv!.map((row) => Object.values(row).join(",")),
      ].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "documents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocuments = documents
    ?.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title")
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      return sortOrder === "asc"
        ? new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
        : new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

  const toggleSortOrder = (field: "title" | "createdAt" | "updatedAt") => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="md:text-4xl text-2xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <FileText className="h-6 w-6 md:h-9 md:w-9 text-primary animate-pulse" />
          Documents
        </h1>
        <div className="flex gap-4 items-center w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {selectedDocs.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => bulkDeleteDocuments.mutate(selectedDocs)}
              disabled={bulkDeleteDocuments.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedDocs.length})
            </Button>
          )}
          <Button variant="outline" onClick={exportDocuments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {documentsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading documents...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Document */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
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
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
              />
              <Textarea
                placeholder="Document Content (optional if uploading a file)"
                value={newDoc.content}
                onChange={(e) =>
                  setNewDoc({ ...newDoc, content: e.target.value })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 min-h-[150px]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })
                  }
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {newDoc.file ? newDoc.file.name : "Upload File"}
                </Button>
                {newDoc.file && (
                  <Button
                    variant="ghost"
                    onClick={() => setNewDoc({ ...newDoc, file: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={() => createDocument.mutate()}
                disabled={
                  createDocument.isPending || (!newDoc.content && !newDoc.file)
                }
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
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
          <Card className="lg:col-span-2 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-card-foreground">
                <Folder className="h-6 w-6 text-primary" />
                Documents ({filteredDocuments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedDocs.length === filteredDocuments?.length &&
                          filteredDocuments?.length > 0
                        }
                        onChange={(e) =>
                          setSelectedDocs(
                            e.target.checked
                              ? filteredDocuments!.map((d) => d.id)
                              : []
                          )
                        }
                      />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("title")}
                      className="cursor-pointer"
                    >
                      Title{" "}
                      {sortBy === "title" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("createdAt")}
                      className="cursor-pointer"
                    >
                      Created{" "}
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
                      onClick={() => toggleSortOrder("updatedAt")}
                      className="cursor-pointer"
                    >
                      Updated{" "}
                      {sortBy === "updatedAt" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments && filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-muted/50 transition-colors duration-200"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={(e) =>
                              setSelectedDocs(
                                e.target.checked
                                  ? [...selectedDocs, doc.id]
                                  : selectedDocs.filter((id) => id !== doc.id)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {editingDoc?.id === doc.id ? (
                            <Input
                              value={editingDoc.title}
                              onChange={(e) =>
                                setEditingDoc({
                                  ...editingDoc,
                                  title: e.target.value,
                                })
                              }
                              className="bg-input border-border rounded-lg shadow-inner"
                            />
                          ) : (
                            doc.title
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.fileType || "text"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editingDoc?.id === doc.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateDocument.mutate(editingDoc)
                                }
                              >
                                <Download className="h-5 w-5 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDoc(null)}
                              >
                                <X className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  !doc.fileUrl && setEditingDoc(doc)
                                }
                              >
                                <Edit className="h-5 w-5 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewDoc(doc)}
                              >
                                <Eye className="h-5 w-5 text-accent" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-5 w-5 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  bulkDeleteDocuments.mutate([doc.id])
                                }
                              >
                                <Trash2 className="h-5 w-5 text-destructive" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No documents found.
                        <FileText className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {editingDoc && !editingDoc.fileUrl && (
                <Textarea
                  value={editingDoc.content || ""}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, content: e.target.value })
                  }
                  className="mt-6 bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 min-h-[200px]"
                  placeholder="Edit document content..."
                />
              )}
            </CardContent>
          </Card>

          {/* Preview Dialog */}
          {previewDoc && (
            <Dialog
              open={!!previewDoc}
              onOpenChange={() => setPreviewDoc(null)}
            >
              <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Preview: {previewDoc.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {previewDoc.fileUrl ? (
                    previewDoc.fileType?.startsWith("image") ? (
                      <img
                        src={previewDoc.fileUrl}
                        alt={previewDoc.title}
                        className="max-w-full h-auto"
                      />
                    ) : previewDoc.fileType === "application/pdf" ? (
                      <iframe
                        src={previewDoc.fileUrl}
                        className="w-full h-[500px]"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        Preview not available for this file type.
                      </p>
                    )
                  ) : (
                    <pre className="text-foreground whitespace-pre-wrap">
                      {previewDoc.content}
                    </pre>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
