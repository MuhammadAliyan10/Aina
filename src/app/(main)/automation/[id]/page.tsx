"use client";

import React, { use, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchSingleAutomation } from "../actions";
import { Loader2, X, Plus } from "lucide-react";
import ShinyText from "@/components/Animated/ShinyText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface UserAutomation {
  id?: string;
  title: string;
  description: string;
  automationUrl?: string;
  credentials: any;
  process: string;
  fileUrl: string | null;
  executeAt: Date | null;
  type: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  keywords: string[];
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
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  const [title, setTitle] = useState(automation?.title || "");
  const [description, setDescription] = useState(automation?.description || "");
  const [automationUrl, setAutomationUrl] = useState(
    automation?.automationUrl || ""
  );
  const [type, setType] = useState(automation?.type || "");
  const [executeAt, setExecuteAt] = useState<Date | null>(
    automation?.executeAt || null
  );
  const [keywords, setKeywords] = useState<string[]>(
    automation?.keywords || []
  );
  const [inputValue, setInputValue] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>(
    automation?.credentials || {}
  );
  const [newCredentialKey, setNewCredentialKey] = useState("");
  const [newCredentialValue, setNewCredentialValue] = useState("");
  const [automationFlow, setAutomationFlow] = useState(
    automation?.process || ""
  );

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

  const handleSaveAutomation = () => {
    const updatedAutomation = {
      id,
      title,
      description,
      automationUrl,
      type,
      executeAt,
      keywords,
      credentials,
      process: automationFlow,
    };

    console.log("Saving Automation:", updatedAutomation);
    toast({
      title: "Success",
      description: "Automation updated successfully!",
    });

    // Here, you should call an API to save/update the automation.
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
      <h3 className="text-2xl font-semibold mb-6">Automation Data</h3>

      {/* Automation Details */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="pb-2">Automation Title</Label>
          <Input
            value={automation?.title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label className="pb-2">Automation Type</Label>
          <Input
            value={automation?.type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div>
          <Label className="pb-2">Automation URL</Label>
          <Input
            value={automation?.automationUrl}
            onChange={(e) => setAutomationUrl(e.target.value)}
          />
        </div>
        <div>
          <Label className="pb-2">Automation Description</Label>
          <Input
            value={automation?.description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label className="pb-2">Execute Time</Label>
          <DatePicker
            selected={automation?.executeAt}
            onChange={(date) => setExecuteAt(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Pick a date & time"
            className="w-full px-3 py-2 text-[12px] border-b border-muted-foreground cursor-pointer bg-transparent text-white"
          />
        </div>
      </div>

      {/* Keywords Section */}
      <div className="my-6">
        <Label className="pb-2">Keywords</Label>
        <div className="flex flex-wrap gap-2 my-4">
          {automation?.keywords.length ? (
            <>
              {" "}
              {automation?.keywords.map((keyword, index) => (
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a keyword"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={addKeyword}>Add</Button>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="my-6">
        <Label className="pb-2">Credentials</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Credential</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Key"
              value={newCredentialKey}
              onChange={(e) => setNewCredentialKey(e.target.value)}
            />
            <Input
              placeholder="Value"
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

      {/* Save Button */}
      <div className="mt-8">
        <Button
          className="bg-blue-500 text-white"
          onClick={handleSaveAutomation}
        >
          Save Automation
        </Button>
      </div>
    </div>
  );
};

export default Page;
