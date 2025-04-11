"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  History,
  Loader2,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Lock,
  Eye,
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
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  isDefault: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  receiptUrl?: string;
}

const BillingPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "" });
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BillingHistory | null>(
    null
  );

  const { data: subscription, isLoading: subscriptionLoading } =
    useQuery<Subscription>({
      queryKey: ["subscription", user?.id],
      queryFn: async () => {
        const response = await fetch(
          `/api/billing/subscription?userId=${user?.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch subscription");
        return response.json();
      },
      enabled: !!user?.id,
    });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery<
    PaymentMethod[]
  >({
    queryKey: ["paymentMethods", user?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/billing/payment-methods?userId=${user?.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: billingHistory, isLoading: billingHistoryLoading } = useQuery<
    BillingHistory[]
  >({
    queryKey: ["billingHistory", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/billing/history?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch billing history");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const addPaymentMethod = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/billing/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          cardNumber: newCard.number.replace(/\s/g, ""),
          expiry: newCard.expiry,
          cvc: newCard.cvc,
          type: "credit_card",
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods", user?.id] });
      setNewCard({ number: "", expiry: "", cvc: "" });
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

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/billing/payment-methods`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, id }),
      });
      if (!response.ok) throw new Error("Failed to delete payment method");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods", user?.id] });
      setMethodToDelete(null);
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/billing/subscription/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to cancel subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
      setIsCanceling(false);
      toast({
        title: "Success",
        description: "Subscription canceled successfully",
      });
    },
  });

  const isLoading =
    subscriptionLoading || paymentMethodsLoading || billingHistoryLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <CreditCard className="h-9 w-9 text-primary animate-pulse" />
          Billing
        </h1>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading billing details...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Overview */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">
                  {subscription?.plan || "Free"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    subscription?.status === "active" ? "success" : "outline"
                  }
                >
                  {subscription?.status || "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Next Billing</span>
                <span className="text-foreground">
                  {subscription?.nextBillingDate
                    ? new Date(
                        subscription.nextBillingDate
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground font-medium">
                  ${subscription?.amount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  disabled={subscription?.status === "active"}
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCanceling(true)}
                  className="flex-1 bg-gradient-to-r from-destructive/80 to-destructive hover:from-destructive hover:to-destructive/90 text-destructive-foreground rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  disabled={subscription?.status !== "active"}
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods & Billing History */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-card-foreground">
                <CreditCard className="h-6 w-6 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {paymentMethods?.length ? (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex justify-between items-center py-3 border-b border-border hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">
                          {method.type === "credit_card"
                            ? `**** **** **** ${method.lastFour}`
                            : "PayPal"}
                          {method.isDefault && (
                            <Badge variant="default" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground text-sm">
                          {method.expiry}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMethodToDelete(method.id)}
                          disabled={
                            deletePaymentMethod.isPending || method.isDefault
                          }
                          className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm py-4">
                    No payment methods added.
                  </p>
                )}
              </div>
              <div className="space-y-4 p-4 bg-muted/10 rounded-lg border border-border">
                <Input
                  placeholder="Card Number (e.g., 1234 5678 9012 3456)"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      number: e.target.value
                        .replace(/\D/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim()
                        .slice(0, 19),
                    })
                  }
                  maxLength={19}
                  className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-4">
                  <Input
                    placeholder="Expiry (MM/YY)"
                    value={newCard.expiry}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        expiry: e.target.value
                          .replace(/\D/g, "")
                          .replace(/(.{2})/, "$1/")
                          .slice(0, 5),
                      })
                    }
                    maxLength={5}
                    className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
                  />
                  <Input
                    placeholder="CVC"
                    value={newCard.cvc}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    maxLength={4}
                    className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <Button
                  onClick={() => addPaymentMethod.mutate()}
                  disabled={
                    addPaymentMethod.isPending ||
                    !newCard.number ||
                    !newCard.expiry ||
                    !newCard.cvc
                  }
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {addPaymentMethod.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Add Payment Method
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-primary" />
                  Billing History
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory?.length ? (
                      billingHistory.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="hover:bg-muted/50 transition-colors duration-200"
                        >
                          <TableCell>
                            {new Date(entry.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>${entry.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.status === "paid"
                                  ? "default"
                                  : entry.status === "pending"
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {entry.receiptUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReceipt(entry)}
                              >
                                <Eye className="h-5 w-5 text-primary" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No billing history available.
                          <History className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {methodToDelete && (
        <Dialog
          open={!!methodToDelete}
          onOpenChange={() => setMethodToDelete(null)}
        >
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <p className="text-foreground">
                Are you sure you want to delete this payment method?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMethodToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deletePaymentMethod.mutate(methodToDelete)}
                  disabled={deletePaymentMethod.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground"
                >
                  {deletePaymentMethod.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Subscription Dialog */}
      {isCanceling && (
        <Dialog open={isCanceling} onOpenChange={() => setIsCanceling(false)}>
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Confirm Cancellation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <p className="text-foreground">
                Are you sure you want to cancel your subscription? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCanceling(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => cancelSubscription.mutate()}
                  disabled={cancelSubscription.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground"
                >
                  {cancelSubscription.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt Preview Dialog */}
      {selectedReceipt && (
        <Dialog
          open={!!selectedReceipt}
          onOpenChange={() => setSelectedReceipt(null)}
        >
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Receipt: {selectedReceipt.description}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <iframe
                src={selectedReceipt.receiptUrl}
                className="w-full h-[500px]"
              />
              <Button
                variant="outline"
                onClick={() =>
                  window.open(selectedReceipt.receiptUrl, "_blank")
                }
                className="mt-4 w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BillingPage;
