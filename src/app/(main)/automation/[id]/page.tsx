"use client";

import React, { useState, useEffect, use } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchSingleAutomation, updateUserAutomation } from "../actions";
import { Loader2, X, Plus, Play, Upload } from "lucide-react";
import ShinyText from "@/components/Animated/ShinyText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface UserAutomation {
  id?: string;
  title: string;
  description: string;
  automationUrl?: string;
  credentials: any;
  process: string;
  file: File | string | null;
  executeAt: Date | null;
  type: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  keywords: string[];
  userId: string;
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  const {
    data: automation,
    refetch,
    isLoading: loadingAutomation,
  } = useQuery<UserAutomation>({
    queryKey: ["automations", id],
    queryFn: async (): Promise<UserAutomation> => {
      const result = await fetchSingleAutomation(id);
      if ("error" in result) throw new Error(result.error);
      return {
        ...result,
        file: result.fileUrl,
      };
    },
  });

  const [updatingLoading, setUpdatingLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [automationUrl, setAutomationUrl] = useState("");
  const [type, setType] = useState("");
  const [executeAt, setExecuteAt] = useState<Date | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [newCredentialKey, setNewCredentialKey] = useState("");
  const [newCredentialValue, setNewCredentialValue] = useState("");
  const [automationFlow, setAutomationFlow] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (automation) {
      setTitle(automation.title || "");
      setDescription(automation.description || "");
      setAutomationUrl(automation.automationUrl || "");
      setType(automation.type || "");
      setStatus(automation.status || "");
      setExecuteAt(automation.executeAt || null);
      setKeywords(automation.keywords || []);
      setCredentials(automation.credentials || {});
      setAutomationFlow(automation.process || "");
    }
  }, [automation]);

  const addKeyword = () => {
    if (inputValue.trim() && !keywords.includes(inputValue.trim())) {
      setKeywords([...keywords, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const addCredential = () => {
    if (newCredentialKey.trim() && newCredentialValue.trim()) {
      setCredentials({
        ...credentials,
        [newCredentialKey.trim()]: newCredentialValue.trim(),
      });
      setNewCredentialKey("");
      setNewCredentialValue("");
    }
  };

  const removeCredential = (key: string) => {
    const updatedCredentials = { ...credentials };
    delete updatedCredentials[key];
    setCredentials(updatedCredentials);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSaveAutomation = async () => {
    try {
      const updatedAutomation: Record<string, any> = {
        id,
        status: automation?.status || status,
      };

      if (title?.trim()) updatedAutomation.title = title;
      if (description?.trim()) updatedAutomation.description = description;
      if (automationUrl?.trim())
        updatedAutomation.automationUrl = automationUrl;
      if (type?.trim()) updatedAutomation.type = type;
      if (executeAt) updatedAutomation.executeAt = executeAt;
      if (keywords?.length) updatedAutomation.keywords = keywords;
      if (credentials) updatedAutomation.credentials = credentials;
      if (automationFlow?.length) updatedAutomation.process = automationFlow;
      if (file?.name) updatedAutomation.file = file.name;
      setUpdatingLoading(true);

      const res = await updateUserAutomation(id, updatedAutomation);
      if (res.success) {
        refetch();
        toast({
          title: "Success",
          description: "Automation updated successfully!",
        });
      }
      if (res.error) {
        toast({
          title: "Failed",
          description: res.error,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUpdatingLoading(false);
    }
  };

  const handleStartAutomation = () => {
    console.log("Starting Automation:", automation);
    toast({
      title: "Success",
      description: "Automation started successfully!",
    });

    // Call API to start the automation
  };

  if (loadingAutomation)
    return (
      <div className="w-full h-[100vh] flex justify-center items-center text-muted-foreground">
        <div className="flex justify-between items-center gap-x-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Fetching your data</p>
        </div>
      </div>
    );

  return (
    <div className="m-10 pt-5 md:pt-0 w-full">
      <ShinyText
        text={`${automation?.title} (${automation?.type})`}
        className="text-4xl md:text-4xl font-bold mb-4"
        disabled={false}
        speed={3}
      />
      <Separator className="my-6" />
      <h3 className="text-3xl font-bold mb-6">Automation Data</h3>

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Automation Title</Label>
          <Input
            className="mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label>Automation Type</Label>
          <Input
            className="mt-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div>
          <Label>Automation URL</Label>
          <Input
            className="mt-2"
            value={automationUrl}
            onChange={(e) => setAutomationUrl(e.target.value)}
          />
        </div>
        <div>
          <Label>Automation Description</Label>
          <Input
            className="mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>Upload File Automation</Label>
          <Input className="mt-2" type="file" onChange={handleFileUpload} />
        </div>
        <div>
          <div>
            <Label>Execute Time</Label>
          </div>
          <DatePicker
            selected={executeAt}
            onChange={(date) => setExecuteAt(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Pick a date & time"
            className="w-full py-2 bg-transparent border-b border-gray-500 text-white cursor-pointer"
          />
        </div>
      </div>

      <div className="my-6">
        <Label>Keywords</Label>
        {keywords && (
          <div className="flex flex-wrap gap-2 my-4">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2"
              >
                {keyword}
                <X
                  size={16}
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                />
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Add a keyword"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={addKeyword}>Add</Button>
        </div>
      </div>
      <div className="my-6">
        <div>
          <Label className="pb-2">Credentials</Label>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="my-2">Add Credential</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Key e.g(email)"
              value={newCredentialKey}
              onChange={(e) => setNewCredentialKey(e.target.value)}
            />
            <Input
              placeholder="Value e.g(abc@gmail.com)"
              value={newCredentialValue}
              onChange={(e) => setNewCredentialValue(e.target.value)}
            />
            <Button onClick={addCredential}>Add</Button>
          </DialogContent>
        </Dialog>
        <div className="mt-4 space-y-2">
          {Object.entries(credentials).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                {key}: {value}
              </span>
              <X
                size={16}
                className="cursor-pointer text-red-500"
                onClick={() => removeCredential(key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="my-6">
        <Label>Automation Guide</Label>
        <Textarea
          value={automationFlow}
          onChange={(e) => setAutomationFlow(e.target.value)}
        />
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button
          className={
            status === "PENDING"
              ? "bg-red-600 text-white hover:text-black"
              : "bg-green-500 text-white hover:text-black"
          }
          onClick={() =>
            status === "PENDING" ? setStatus("COMPLETED") : setStatus("PENDING")
          }
        >
          {status}
        </Button>
        <Button
          className="bg-blue-500 text-white hover:text-black"
          onClick={handleSaveAutomation}
        >
          {updatingLoading ? "Saving..." : "Save Automation"}
        </Button>
        <Button
          className="bg-green-500 text-white hover:text-black"
          onClick={handleStartAutomation}
        >
          <Play className="mr-2 h-4 w-4" /> Start Automation
        </Button>
      </div>
    </div>
  );
};

export default Page;
