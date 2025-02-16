"use client";

import React, { useState, useEffect } from "react";
import ShinyText from "@/components/Animated/ShinyText";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutomationCard from "./components/AutomationCard";
import { addAutomation, deleteAutomation, fetchUserAutomation } from "./action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Credentials {
  email: string;
  password: string;
}

interface UserAutomation {
  id?: string;
  title: string;
  automationUrl: string;
  description: string;
  type: string;
  executeAt?: Date;
  fileUrl?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface Automation {
  id?: string;
  title: string;
  automationUrl: string;
  description: string;
  type: "UNIVERSITY" | "WORK" | "BLANK";
  credentials: Credentials;
  file?: string | null;
  executeAt?: string;
  fileUrl?: string | null | undefined;
  userId?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const Page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [automationType, setAutomationType] = useState<
    "UNIVERSITY" | "WORK" | "BLANK"
  >("UNIVERSITY");
  const [automation, setAutomation] = useState<Automation>({
    title: "",
    description: "",
    automationUrl: "",
    type: "UNIVERSITY",
    credentials: { email: "", password: "" },
    file: null,
    status: "",
  });
  const [automations, setAutomations] = useState<UserAutomation[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        setLoadingAutomation(true);
        const res = await fetchUserAutomation();
        if (Array.isArray(res)) {
          setAutomations(res);
        } else {
          console.error("Error fetching automations:", res.error);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAutomation(false);
      }
    };
    fetchAutomations();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!automation.title || !automation.description) {
      toast({
        description: "Please fill in all required fields before submitting.",
      });
      return;
    }
    if (!automation.automationUrl) {
      toast({
        description: "Automation URL is required.",
      });
      return;
    }

    setLoading(true);
    try {
      const fileUrl = automation.file;
      const payload = {
        ...automation,
        fileUrl: fileUrl || undefined,
        executeAt: automation.executeAt
          ? new Date(automation.executeAt)
          : new Date(),
      };

      const res = await addAutomation(payload);
      if (res) {
        toast({
          variant: "default",
          description: "Automation created successfully.",
        });
      }

      // setAutomation({
      //   title: "",
      //   description: "",
      //   type: "UNIVERSITY",
      //   credentials: { email: "", password: "" },
      //   file: null,
      // });
      setIsDialogOpen(false);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving automation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload (simulated)
  const uploadFile = async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `https://example.com/files/${file.name}`;
  };

  // Handle delete automation
  const handleDelete = async (id: string) => {
    try {
      setLoadingDelete(true);
      const res = await deleteAutomation(id);
      if (res.success) {
        toast({ variant: "default", description: res.success });
      } else {
        toast({ variant: "destructive", description: res.error });
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  // Handle edit automation
  const handleEdit = (id: string) => {};

  return (
    <div className="flex items-center m-10 pt-5 md:pt-0">
      <div>
        <ShinyText
          text="Automation Hub"
          className="text-4xl md:text-8xl font-bold mb-4"
          disabled={false}
          speed={3}
        />
        <h4 className="text-muted-foreground text-lg">Create an automation</h4>

        <div className="p-6 flex gap-4">
          <Button
            onClick={() => {
              setAutomationType("UNIVERSITY");
              setIsDialogOpen(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            University
          </Button>
          <Button
            onClick={() => {
              setAutomationType("WORK");
              setIsDialogOpen(true);
            }}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Work
          </Button>
          <Button
            onClick={() => {
              setAutomationType("BLANK");
              setIsDialogOpen(true);
            }}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Blank
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="p-6 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editMode ? "Edit Automation" : "Add New Automation"} (
                {automationType})
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Automation Title"
                value={automation.title}
                onChange={(e) =>
                  setAutomation({ ...automation, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Automation Description"
                value={automation.description}
                onChange={(e) =>
                  setAutomation({ ...automation, description: e.target.value })
                }
              />

              <h4 className="text-sm font-medium">Automation URL</h4>
              <Input
                placeholder="Automation URL"
                type="text"
                value={automation.automationUrl}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    automationUrl: e.target.value,
                  })
                }
              />
              <h4 className="text-sm font-medium">Login Credentials</h4>
              <Input
                placeholder="Email"
                type="email"
                value={automation.credentials.email}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    credentials: {
                      ...automation.credentials,
                      email: e.target.value,
                    },
                  })
                }
              />
              <Input
                placeholder="Password"
                type="password"
                value={automation.credentials.password}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    credentials: {
                      ...automation.credentials,
                      password: e.target.value,
                    },
                  })
                }
              />

              <h4 className="text-sm font-medium">Due Date and Time</h4>
              <DatePicker
                selected={
                  automation.executeAt ? new Date(automation.executeAt) : null
                }
                onChange={(date: Date | null) => {
                  if (date) {
                    setAutomation({
                      ...automation,
                      executeAt: date.toISOString(),
                    });
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Due date and time"
                className="w-full p-2 border rounded"
              />

              <h4 className="text-sm font-medium">Upload Assignment</h4>
              <Input
                type="file"
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    file: e.target.files
                      ? URL.createObjectURL(e.target.files[0])
                      : null,
                  })
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
                ) : editMode ? (
                  "Update Automation"
                ) : (
                  "Create Automation"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Separator className="w-full my-6" />
        <div className="w-full h-[30vh] overflow-auto">
          {automations.length === 0 ? (
            <p className="text-muted-foreground">
              {" "}
              No automation found. Kindly create one.{" "}
            </p>
          ) : (
            <>
              {loadingAutomation ? (
                <div className="flex justify-center items-center gap-x-2">
                  <Loader2 className="size-10 animate-spin" />
                  <span>Loading automations...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {automations.map((automation) => (
                    <AutomationCard
                      key={automation.id}
                      status={automation.status}
                      id={automation.id!}
                      title={automation.title}
                      description={automation.description}
                      automationUrl={automation.automationUrl}
                      type={automation.type}
                      executeAt={automation.executeAt!}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      loading={loadingDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
