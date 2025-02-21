// src/app/(mainPages)/integrations/page.tsx
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

// Types for integrations
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string; // URL to an icon or a placeholder
  category: "CRM" | "Messaging" | "Storage" | "Analytics" | "Payment";
  isConnected: boolean;
}

const IntegrationsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch available integrations and their connection status
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

  // Mutation to connect an integration
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

  // Mutation to disconnect an integration
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

  const filteredIntegrations = integrations?.filter((integration) =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen  text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cable className="h-8 w-8 text-blue-400" />
          Integrations
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-neutral-700 border-neutral-600 text-white"
          />
        </div>
      </header>

      {integrationsLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations && filteredIntegrations.length > 0 ? (
            filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-neutral-800 border-neutral-700 hover:border-blue-600 transition-colors"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <img
                    src={integration.icon}
                    alt={`${integration.name} icon`}
                    className="h-10 w-10 rounded-md"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-icon.png")
                    } // Fallback icon
                  />
                  <div>
                    <CardTitle className="text-neutral-200 text-lg">
                      {integration.name}
                    </CardTitle>
                    <p className="text-neutral-400 text-sm">
                      {integration.category}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-neutral-300 text-sm">
                    {integration.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={cn(
                        "text-sm font-medium px-2 py-1 rounded-full",
                        integration.isConnected
                          ? "bg-green-700 text-green-100"
                          : "bg-neutral-600 text-neutral-200"
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
                        "text-blue-400 border-blue-400 hover:bg-blue-900",
                        integration.isConnected &&
                          "text-red-400 border-red-400 hover:bg-red-900"
                      )}
                    >
                      {connectIntegration.isPending &&
                      connectIntegration.variables === integration.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : disconnectIntegration.isPending &&
                        disconnectIntegration.variables === integration.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : integration.isConnected ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="ml-1">
                        {integration.isConnected ? "Disconnect" : "Connect"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-neutral-400">
              <AlertCircle className="h-12 w-12 mb-2" />
              <p>No integrations found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
