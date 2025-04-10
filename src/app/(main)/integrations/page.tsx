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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "CRM" | "Messaging" | "Storage" | "Analytics" | "Payment";
  isConnected: boolean;
}

const IntegrationsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "CRM" | "Messaging" | "Storage" | "Analytics" | "Payment"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: integrations, isLoading: integrationsLoading } = useQuery<
    Integration[]
  >({
    queryKey: ["integrations", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/integrations?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const connectIntegration = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/integrations/${id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to connect integration");
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Integration[]>(
        ["integrations", user?.id],
        (old) =>
          old?.map((integration) =>
            integration.id === id
              ? { ...integration, isConnected: true }
              : integration
          )
      );
      toast({
        title: "Success",
        description: "Integration connected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect integration",
        variant: "destructive",
      });
    },
  });

  const disconnectIntegration = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/integrations/${id}/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to disconnect integration");
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Integration[]>(
        ["integrations", user?.id],
        (old) =>
          old?.map((integration) =>
            integration.id === id
              ? { ...integration, isConnected: false }
              : integration
          )
      );
      toast({
        title: "Success",
        description: "Integration disconnected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect integration",
        variant: "destructive",
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
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
    });

  const toggleSortOrder = (field: "name" | "category") => {
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
          <Cable className="h-9 w-9 text-primary animate-pulse" />
          Integrations
        </h1>
        <div className="flex gap-4 items-center w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(
                e.target.value as
                  | "all"
                  | "CRM"
                  | "Messaging"
                  | "Storage"
                  | "Analytics"
                  | "Payment"
              )
            }
            className="bg-input border border-border text-foreground p-2 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="CRM">CRM</option>
            <option value="Messaging">Messaging</option>
            <option value="Storage">Storage</option>
            <option value="Analytics">Analytics</option>
            <option value="Payment">Payment</option>
          </select>
        </div>
      </header>

      {integrationsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading integrations...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIntegrations && filteredIntegrations.length > 0 ? (
            filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-card border border-border rounded-xl shadow-lg hover:border-primary transition-all duration-300"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <img
                    src={integration.icon}
                    alt={`${integration.name} icon`}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-icon.png")
                    }
                  />
                  <div>
                    <CardTitle className="text-foreground text-xl font-semibold">
                      {integration.name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {integration.category}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground text-sm line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={cn(
                        "text-sm font-medium px-3 py-1 rounded-full",
                        integration.isConnected
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {integration.isConnected ? "Connected" : "Not Connected"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        integration.isConnected
                          ? disconnectIntegration.mutate(integration.id)
                          : connectIntegration.mutate(integration.id)
                      }
                      disabled={
                        connectIntegration.isPending ||
                        disconnectIntegration.isPending
                      }
                      className={cn(
                        "text-primary border-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-lg transition-all duration-300",
                        integration.isConnected &&
                          "text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      )}
                    >
                      {connectIntegration.isPending &&
                      connectIntegration.variables === integration.id ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : disconnectIntegration.isPending &&
                        disconnectIntegration.variables === integration.id ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : integration.isConnected ? (
                        <X className="h-5 w-5 mr-2" />
                      ) : (
                        <Plus className="h-5 w-5 mr-2" />
                      )}
                      {integration.isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12">
              <AlertCircle className="h-12 w-12 mb-4 text-primary animate-bounce" />
              <p className="text-lg">
                No integrations found matching your search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
