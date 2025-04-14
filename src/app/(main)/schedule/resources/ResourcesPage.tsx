"use client";

import React, { useState } from "react";
import {
  FileText,
  Link2,
  PlayCircle,
  Clock,
  Search,
  Filter,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import { markContentCompleted, fetchResources } from "../actions";

// Types
interface RecommendedContent {
  id: string;
  type: "video" | "link" | "document" | "routine";
  category?: string | null;
  title: string;
  url?: string | null;
  description: string;
  tags: string[];
  completed: boolean;
  premium: boolean;
  subjectName: string;
}

interface ResourcesData {
  resources: RecommendedContent[];
}

const ResourcesPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] =
    useState<RecommendedContent | null>(null);

  // Fetch resources
  const { data, isLoading } = useQuery<ResourcesData>({
    queryKey: ["resources", user?.id],
    queryFn: () => fetchResources(user?.id ?? ""),
    enabled: !!user?.id,
  });

  // Mark content completed
  const markCompletedMutation = useMutation({
    mutationFn: ({
      subjectId,
      contentId,
    }: {
      subjectId: string;
      contentId: string;
    }) => markContentCompleted(user?.id || "", subjectId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["schedule", user?.id] });
      toast({ title: "Success", description: "Resource marked as completed" });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to mark resource as completed",
        variant: "destructive",
      }),
  });

  // Filter and search logic
  const filteredResources = data?.resources.filter((resource) => {
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || resource.category === categoryFilter;
    const matchesCompletion =
      completionFilter === "all" ||
      (completionFilter === "completed" && resource.completed) ||
      (completionFilter === "pending" && !resource.completed);
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesCompletion && matchesSearch;
  });

  // Unique categories for filter
  const categories = Array.from(
    new Set(data?.resources.map((r) => r.category).filter(Boolean))
  );

  const handleMarkCompleted = (subjectId: string, contentId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in",
        variant: "destructive",
      });
      return;
    }
    markCompletedMutation.mutate({ subjectId, contentId });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-gradient-to-r from-teal-500/10 to-muted/10 py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <FileText className="h-10 w-10 text-teal-500" />
            Learning Resources
          </h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Explore videos, articles, and routines tailored to your subjects.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 w-full flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="md:w-64 bg-card border-border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-teal-500" />
            Filters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">
                Resource Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat!}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Select
                value={completionFilter}
                onValueChange={setCompletionFilter}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Resources Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources?.length ? (
                filteredResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {resource.type === "video" && (
                          <PlayCircle className="h-5 w-5 text-teal-500" />
                        )}
                        {resource.type === "link" && (
                          <Link2 className="h-5 w-5 text-teal-500" />
                        )}
                        {resource.type === "document" && (
                          <FileText className="h-5 w-5 text-teal-500" />
                        )}
                        {resource.type === "routine" && (
                          <Clock className="h-5 w-5 text-teal-500" />
                        )}
                        <span className="truncate">{resource.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Subject: {resource.subjectName}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {resource.premium && user?.plan === "Free" && (
                          <Badge
                            variant="outline"
                            className="text-teal-500 border-teal-500"
                          >
                            Premium
                          </Badge>
                        )}
                        {resource.completed && (
                          <Badge
                            variant="outline"
                            className="text-green-500 border-green-500"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResource(resource)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant={resource.completed ? "outline" : "default"}
                          onClick={() =>
                            handleMarkCompleted(resource.subjectId, resource.id)
                          }
                          disabled={
                            resource.completed ||
                            (resource.premium && user?.plan === "Free") ||
                            markCompletedMutation.isPending
                          }
                          className={
                            resource.completed
                              ? "text-green-500 border-green-500"
                              : "bg-teal-500 hover:bg-teal-600"
                          }
                        >
                          {resource.completed ? "Done" : "Mark Done"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground col-span-full">
                  No resources match your filters.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Resource Details Dialog */}
        {selectedResource && (
          <Dialog
            open={!!selectedResource}
            onOpenChange={() => setSelectedResource(null)}
          >
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedResource.type === "video" && (
                    <PlayCircle className="h-5 w-5 text-teal-500" />
                  )}
                  {selectedResource.type === "link" && (
                    <Link2 className="h-5 w-5 text-teal-500" />
                  )}
                  {selectedResource.type === "document" && (
                    <FileText className="h-5 w-5 text-teal-500" />
                  )}
                  {selectedResource.type === "routine" && (
                    <Clock className="h-5 w-5 text-teal-500" />
                  )}
                  {selectedResource.title}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <p className="text-foreground">
                  {selectedResource.description}
                </p>
                {selectedResource.url && (
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:underline mt-2 inline-block"
                  >
                    Access Resource
                  </a>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Subject: {selectedResource.subjectName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Category: {selectedResource.category || "None"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedResource.completed ? "Completed" : "Pending"}
                </p>
                {selectedResource.premium && user?.plan === "Free" && (
                  <p className="text-sm text-teal-500 mt-2">
                    Upgrade to Premium to access this resource.
                  </p>
                )}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default ResourcesPage;
