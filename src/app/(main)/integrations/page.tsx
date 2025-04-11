"use client";

import React, { useState } from "react";
import {
  Cable,
  Plus,
  X,
  Loader2,
  Check,
  AlertCircle,
  Zap,
  Search,
  ChevronDown,
  Settings,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "CRM" | "Messaging" | "Storage" | "Analytics" | "Payment" | "Other";
  isConnected: boolean;
  permissions?: string[];
  connectedAt?: string;
}

const IntegrationsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | Integration["category"]
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const { data: integrations, isLoading: integrationsLoading } = useQuery<
    Integration[]
  >({
    queryKey: ["integrations", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/integrations?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const connectIntegration = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/integrations/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, action: "connect" }),
      });
      if (!response.ok) throw new Error("Failed to initiate connection");
      const { authUrl } = await response.json();
      window.location.href = authUrl; // Redirect to OAuth flow
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to connect",
        variant: "destructive",
      });
    },
  });

  const disconnectIntegration = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/integrations/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, action: "disconnect" }),
      });
      if (!response.ok) throw new Error("Failed to disconnect integration");
    },
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({ queryKey: ["integrations", user?.id] });
      toast({
        title: "Success",
        description: "Integration disconnected successfully",
      });
    },
  });

  const filteredIntegrations = integrations
    ?.filter((integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (integration) =>
        filterCategory === "all" || integration.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "name")
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      return sortOrder === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    });

  const toggleSortOrder = (field: "name" | "category") => {
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
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Cable className="h-9 w-9 text-primary animate-pulse" />
          Integrations
        </h1>
        <div className="flex gap-4 items-center w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-input border border-border text-foreground p-2 rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Categories</option>
            <option value="CRM">CRM</option>
            <option value="Messaging">Messaging</option>
            <option value="Storage">Storage</option>
            <option value="Analytics">Analytics</option>
            <option value="Payment">Payment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </header>

      {integrationsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading integrations...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntegrations && filteredIntegrations.length > 0 ? (
            filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <Image
                    src={integration.icon}
                    alt={`${integration.name} icon`}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-icon.png")
                    }
                  />
                  <div>
                    <CardTitle className="text-foreground text-xl font-semibold group-hover:text-primary transition-colors">
                      {integration.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {integration.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={integration.isConnected ? "default" : "outline"}
                    >
                      {integration.isConnected ? "Connected" : "Not Connected"}
                      {integration.connectedAt &&
                        ` (${new Date(
                          integration.connectedAt
                        ).toLocaleDateString()})`}
                    </Badge>
                    <div className="flex gap-2">
                      {integration.isConnected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIntegration(integration)}
                          className="text-muted-foreground hover:text-primary hover:bg-muted rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          integration.isConnected
                            ? disconnectIntegration.mutate(integration.name)
                            : connectIntegration.mutate(integration.name)
                        }
                        disabled={
                          connectIntegration.isPending ||
                          disconnectIntegration.isPending
                        }
                        className={cn(
                          "bg-gradient-to-r",
                          integration.isConnected
                            ? "from-destructive/80 to-destructive hover:from-destructive hover:to-destructive/90 text-destructive-foreground"
                            : "from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground",
                          "rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                        )}
                      >
                        {connectIntegration.isPending &&
                        connectIntegration.variables === integration.name ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : disconnectIntegration.isPending &&
                          disconnectIntegration.variables ===
                            integration.name ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : integration.isConnected ? (
                          <X className="h-5 w-5 mr-2" />
                        ) : (
                          <Plus className="h-5 w-5 mr-2" />
                        )}
                        {integration.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12 bg-muted/10 rounded-2xl border border-border">
              <AlertCircle className="h-12 w-12 mb-4 text-primary animate-bounce" />
              <p className="text-xl font-medium">
                No integrations found matching your search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Permissions Dialog */}
      {selectedIntegration && (
        <Dialog
          open={!!selectedIntegration}
          onOpenChange={() => setSelectedIntegration(null)}
        >
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {selectedIntegration.name} Permissions
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <p className="text-muted-foreground">
                Manage permissions for {selectedIntegration.name}:
              </p>
              <ul className="space-y-2">
                {selectedIntegration.permissions?.map((perm, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-foreground">{perm}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() => {
                  /* Future: Update permissions */
                }}
                className="w-full"
              >
                Update Permissions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntegrationsPage;
