"use client";

import React, { useState, useEffect } from "react";
import ShinyText from "@/components/Animated/ShinyText";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import "react-datepicker/dist/react-datepicker.css";
import AutomationCard from "./components/AutomationCard";
import { addAutomation, deleteAutomation, fetchUserAutomation } from "./action";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { EvervaultCardDemo } from "@/components/Global/EvervaultCard";
import { GlareCard } from "@/components/ui/glare-card";
import { GlareCardDemo } from "@/components/Global/GlareCardDemo";

interface UserAutomation {
  id?: string;
  title: string;
  description: string;
  type: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface Automation {
  id?: string;
  title: string;
  description: string;
  type: string;
}

const Page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const {
    data: automations,
    refetch,
    isLoading: loadingAutomation,
  } = useQuery({
    queryKey: ["automations"],
    queryFn: async (): Promise<UserAutomation[]> => {
      const result = await fetchUserAutomation();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  const [automation, setAutomation] = useState<Automation>({
    title: "",
    description: "",
    type: "",
  });

  const handleSubmit = async () => {
    if (!automation.title || !automation.description || !automation.type) {
      toast({
        title: "Input Error",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await addAutomation(automation);
      if (res) {
        toast({
          variant: "default",
          title: "Response",
          description: "Automation created successfully.",
        });
      }
      setAutomation({
        title: "",
        description: "",
        type: "",
      });
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving automation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoadingDelete(true);
      const res = await deleteAutomation(id);
      if (res.success) {
        toast({
          variant: "default",
          title: "Response",
          description: res.success,
        });
        refetch();
      } else {
        toast({
          variant: "destructive",
          title: "Response",
          description: res.error,
        });
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
    } finally {
      setLoadingDelete(false);
    }
  };
  return (
    <div className="m-10 w-full pt-5 md:pt-0">
      <div className="flex flex-col justify-center items-center">
        <ShinyText
          text="Automation Hub"
          className="text-4xl md:text-7xl font-bold mb-4 text-center"
          disabled={false}
          speed={3}
        />
        <div className="flex justify-center items-center my-4">
          <Button
            onClick={() => {
              setIsDialogOpen(true);
            }}
          >
            Add New Automations
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="p-6 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add Automation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Automation title"
                value={automation.title}
                onChange={(e) =>
                  setAutomation({ ...automation, title: e.target.value })
                }
              />
              <Input
                placeholder="Automation type"
                value={automation.type}
                onChange={(e) =>
                  setAutomation({ ...automation, type: e.target.value })
                }
              />
              <Textarea
                placeholder="Automation description"
                value={automation.description}
                onChange={(e) =>
                  setAutomation({ ...automation, description: e.target.value })
                }
              />
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <div className="flex justify-center items-center gap-x-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <p>Create Automation</p>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Separator className="w-full my-6" />
        <div className="w-full text-center">
          {loadingAutomation ? (
            <div className="flex justify-center items-center gap-x-2">
              <Loader2 className="size-10 animate-spin" />
              <span>Loading automations...</span>
            </div>
          ) : (
            <>
              {automations && automations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {automations.map((automation: UserAutomation) => (
                    <GlareCardDemo
                      key={automation.id}
                      title={automation?.title}
                      type={automation.type}
                      description={automation.description}
                      status={automation.status}
                      id={automation.id || ""}
                      href="/automation"
                      createdAt={automation.updatedAt}
                      onDelete={() =>
                        automation?.id && handleDelete(automation.id)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No automations found. Kindly create one.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
