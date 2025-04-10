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
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCVC, setNewCardCVC] = useState("");
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

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

  const addPaymentMethod = useMutation({
    mutationFn: async () => {
      if (!/^\d{16}$/.test(newCardNumber.replace(/\s/g, ""))) {
        throw new Error("Invalid card number (must be 16 digits)");
      }
      if (!/^\d{2}\/\d{2}$/.test(newCardExpiry)) {
        throw new Error("Invalid expiry date (MM/YY)");
      }
      if (!/^\d{3,4}$/.test(newCardCVC)) {
        throw new Error("Invalid CVC (3-4 digits)");
      }
      const response = await fetch(`/api/billing/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          cardNumber: newCardNumber.replace(/\s/g, ""),
          expiry: newCardExpiry,
          cvc: newCardCVC,
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
      setNewCardCVC("");
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
      const response = await fetch(`/api/billing/payment-methods/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
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
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleDownloadReceipt = (entry: BillingHistory) => {
    if (entry.receiptUrl) {
      window.open(entry.receiptUrl, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Receipt not available for this transaction",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    subscriptionLoading || paymentMethodsLoading || billingHistoryLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <CreditCard className="h-9 w-9 text-primary animate-pulse" />
          Billing
        </h1>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading billing details...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Subscription Overview */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary animate-pulse" />
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
                <span
                  className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full",
                    subscription?.status === "active"
                      ? "bg-success/20 text-success"
                      : subscription?.status === "inactive"
                      ? "bg-accent/20 text-accent"
                      : "bg-destructive/20 text-destructive"
                  )}
                >
                  {subscription?.status || "Inactive"}
                </span>
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
                  className="flex-1 text-primary border-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-lg transition-all duration-300"
                  disabled={subscription?.status !== "active"}
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCanceling(true)}
                  className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold rounded-lg transition-all duration-300"
                  disabled={subscription?.status !== "active"}
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex justify-between items-center py-3 border-b border-border"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">
                          {method.type === "credit_card"
                            ? `**** **** **** ${method.lastFour}`
                            : "PayPal"}
                          {method.isDefault && (
                            <span className="ml-2 text-primary text-sm">
                              (Default)
                            </span>
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
                  <p className="text-muted-foreground text-sm">
                    No payment methods added.
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Card Number (e.g., 1234 5678 9012 3456)"
                  value={newCardNumber}
                  onChange={(e) =>
                    setNewCardNumber(
                      e.target.value
                        .replace(/\D/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim()
                    )
                  }
                  maxLength={19}
                  className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                />
                <div className="flex gap-4">
                  <Input
                    placeholder="Expiry (MM/YY)"
                    value={newCardExpiry}
                    onChange={(e) =>
                      setNewCardExpiry(
                        e.target.value
                          .replace(/\D/g, "")
                          .replace(/(.{2})/, "$1/")
                          .slice(0, 5)
                      )
                    }
                    maxLength={5}
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                  />
                  <Input
                    placeholder="CVC"
                    value={newCardCVC}
                    onChange={(e) =>
                      setNewCardCVC(
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      )
                    }
                    maxLength={4}
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                  />
                </div>
                <Button
                  onClick={() => addPaymentMethod.mutate()}
                  disabled={
                    addPaymentMethod.isPending ||
                    !newCardNumber ||
                    !newCardExpiry ||
                    !newCardCVC
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {addPaymentMethod.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="bg-card border border-border rounded-xl shadow-lg md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <History className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory && billingHistory.length > 0 ? (
                    billingHistory.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-foreground">
                          ${entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1 rounded-full",
                              entry.status === "paid"
                                ? "bg-success/20 text-success"
                                : entry.status === "pending"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.receiptUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(entry)}
                              className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                            >
                              <Download className="h-5 w-5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground text-center py-6"
                      >
                        No billing history available.
                        <History className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Payment Method */}
      {methodToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-card border border-border rounded-xl shadow-2xl w-96">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground">
                Are you sure you want to delete this payment method?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMethodToDelete(null)}
                  className="text-muted-foreground border-border hover:bg-muted rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deletePaymentMethod.mutate(methodToDelete)}
                  disabled={deletePaymentMethod.isPending}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg"
                >
                  {deletePaymentMethod.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Canceling Subscription */}
      {isCanceling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-card border border-border rounded-xl shadow-2xl w-96">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                Confirm Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground">
                Are you sure you want to cancel your subscription? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCanceling(false)}
                  className="text-muted-foreground border-border hover:bg-muted rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => cancelSubscription.mutate()}
                  disabled={cancelSubscription.isPending}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg"
                >
                  {cancelSubscription.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
