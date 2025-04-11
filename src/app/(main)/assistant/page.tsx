"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Loader2,
  Mic,
  Paperclip,
  User,
  X,
  MessageSquare,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  attachment?: string;
}

const AIAssistantPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Declare SpeechRecognition type globally

  const recognitionRef = useRef<null>(null);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["aiMessages", user?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/ai-assistant/messages?userId=${user?.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      attachment,
    }: {
      content: string;
      attachment?: string;
    }) => {
      // Save user message to DB
      const userResponse = await fetch(`/api/ai-assistant/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, content, attachment }),
      });
      if (!userResponse.ok) throw new Error("Failed to send user message");
      const userMessage = await userResponse.json();

      // Call local DeepSeek model
      const aiResponse = await axios.post("http://localhost:8000/generate", {
        prompt: content,
        max_length: 150,
        temperature: 0.7,
      });
      const aiContent =
        aiResponse.data.text || "Sorry, I couldn't generate a response.";

      // Save AI response to DB
      const aiDbResponse = await fetch(`/api/ai-assistant/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          content: aiContent,
          sender: "ai",
        }),
      });
      if (!aiDbResponse.ok) throw new Error("Failed to save AI response");
      return { userMessage, aiMessage: await aiDbResponse.json() };
    },
    onMutate: async ({ content, attachment }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
        attachment,
      };
      queryClient.setQueryData<Message[]>(["aiMessages", user?.id], (old) => [
        ...(old || []),
        newMessage,
      ]);
      setIsTyping(true);
    },
    onSuccess: ({ aiMessage }) => {
      queryClient.setQueryData<Message[]>(["aiMessages", user?.id], (old) => [
        ...(old || []),
        aiMessage,
      ]);
      setIsTyping(false);
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (message.trim()) sendMessage.mutate({ content: message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Error",
        description: "Speech recognition not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to record voice input.",
        variant: "destructive",
      });
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user?.id || "");

    try {
      const response = await fetch("/api/ai-assistant/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload attachment");
      const { url } = await response.json();
      sendMessage.mutate({
        content: message || "Attached a file",
        attachment: url,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Bot className="h-9 w-9 text-primary animate-pulse" />
          AI Assistant
        </h1>
      </header>

      {/* Main Chat Area */}
      <Card className="flex-1 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Chat with Grok
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xl font-medium text-muted-foreground animate-pulse">
                  Loading messages...
                </p>
              </div>
            ) : messages?.length ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-2 max-w-xs md:max-w-md p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm mt-1 block"
                        >
                          View Attachment
                        </a>
                      )}
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 text-primary animate-bounce" />
                <p className="text-xl font-medium">
                  Ask me anything to get started!
                </p>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start gap-3">
                <div className="bg-muted p-4 rounded-lg shadow-md flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="text-foreground animate-pulse">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border bg-card">
            <div className="flex items-center gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-input border-border text-foreground focus:ring-2 focus:ring-primary/50 rounded-lg resize-none min-h-[50px] max-h-[150px] shadow-inner"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex gap-3 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                disabled={isRecording}
                className={cn(
                  "text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2",
                  isRecording && "text-primary animate-pulse"
                )}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <label className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
                >
                  <span>
                    <Paperclip className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAttachment}
                    />
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Chatbot */}
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-2xl z-50 flex flex-col max-h-[70vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Grok Chat
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages?.length ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-2 max-w-[80%] p-3 rounded-lg shadow-sm",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs mt-1 block"
                        >
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bot className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm">Start chatting!</p>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <div className="bg-muted p-3 rounded-lg shadow-sm flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-foreground animate-pulse text-sm">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-input border-border text-foreground focus:ring-2 focus:ring-primary/50 rounded-lg resize-none min-h-[40px] max-h-[100px] text-sm shadow-inner"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg p-2"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
