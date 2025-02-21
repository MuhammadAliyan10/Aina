// src/app/(mainPages)/billing/page.tsx
"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  History,
  Loader2,
  Plus,
  Trash2,
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
import { useSession } from "@/app/(main)/SessionProvider";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Types for billing data
interface Subscription {
  plan: string;
  status: "active" | "inactive" | "canceled";
  nextBillingDate: string;
  amount: number;
}

interface PaymentMethod {
  id: string;
  type: "credit_card" | "paypal";
  lastFour: string;
  expiry: string;
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

const BillingPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");

  // Fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading } =
    useQuery<Subscription>({
      queryKey: ["subscription", user?.id],
      queryFn: async () => {
        const response = await fetch(
          `/api/billing/subscription?userId=${user?.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch subscription");
        return response.json();
      },
      enabled: !!user?.id,
    });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery<
    PaymentMethod[]
  >({
    queryKey: ["paymentMethods", user?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/billing/payment-methods?userId=${user?.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch billing history
  const { data: billingHistory, isLoading: billingHistoryLoading } = useQuery<
    BillingHistory[]
  >({
    queryKey: ["billingHistory", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/billing/history?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch billing history");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Mutation to add a payment method
  const addPaymentMethod = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/billing/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          cardNumber: newCardNumber,
          expiry: newCardExpiry,
          type: "credit_card",
        }),
      });
      if (!response.ok) throw new Error("Failed to add payment method");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods", user?.id] });
      setNewCardNumber("");
      setNewCardExpiry("");
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a payment method
  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/billing/payment-methods/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to delete payment method");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods", user?.id] });
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  const isLoading =
    subscriptionLoading || paymentMethodsLoading || billingHistoryLoading;

  return (
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Overview */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Plan</span>
                <span className="text-neutral-200 font-medium">
                  {subscription?.plan || "Free"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status</span>
                <span
                  className={cn(
                    "text-sm font-medium px-2 py-1 rounded-full",
                    subscription?.status === "active"
                      ? "bg-green-700 text-green-100"
                      : subscription?.status === "inactive"
                      ? "bg-yellow-700 text-yellow-100"
                      : "bg-red-700 text-red-100"
                  )}
                >
                  {subscription?.status || "Inactive"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Next Billing</span>
                <span className="text-neutral-200">
                  {subscription?.nextBillingDate
                    ? new Date(
                        subscription.nextBillingDate
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Amount</span>
                <span className="text-neutral-200 font-medium">
                  ${subscription?.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 text-blue-400 border-blue-400 hover:bg-blue-900"
              >
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex justify-between items-center py-2 border-b border-neutral-700"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-200">
                          {method.type === "credit_card"
                            ? `Card ending in ${method.lastFour}`
                            : "PayPal"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-sm">
                          {method.expiry}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePaymentMethod.mutate(method.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 text-sm">
                    No payment methods added.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Card Number (e.g., 1234 5678 9012 3456)"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
                <Input
                  placeholder="Expiry (MM/YY)"
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
                <Button
                  onClick={() => addPaymentMethod.mutate()}
                  disabled={
                    addPaymentMethod.isPending ||
                    !newCardNumber ||
                    !newCardExpiry
                  }
                  className="w-full"
                >
                  {addPaymentMethod.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="bg-neutral-800 border-neutral-700 md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-neutral-400">Date</TableHead>
                    <TableHead className="text-neutral-400">
                      Description
                    </TableHead>
                    <TableHead className="text-neutral-400">Amount</TableHead>
                    <TableHead className="text-neutral-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory && billingHistory.length > 0 ? (
                    billingHistory.map((entry) => (
                      <TableRow key={entry.id} className="border-neutral-700">
                        <TableCell className="text-neutral-200">
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          ${entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-2 py-1 rounded-full",
                              entry.status === "paid"
                                ? "bg-green-700 text-green-100"
                                : entry.status === "pending"
                                ? "bg-yellow-700 text-yellow-100"
                                : "bg-red-700 text-red-100"
                            )}
                          >
                            {entry.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-neutral-400 text-center"
                      >
                        No billing history available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
