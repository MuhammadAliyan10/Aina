// src/app/(mainPages)/ai-assistant/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Loader2,
  Mic,
  Paperclip,
  Type,
  User,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

// Types for messages
interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

const AIAssistantPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch message history
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["aiMessages", user?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/ai-assistant/messages?userId=${user?.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Mutation to send a message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/ai-assistant/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onMutate: async (content) => {
      // Optimistic update
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(["aiMessages", user?.id], (old) => [
        ...(old || []),
        newMessage,
      ]);
      setIsTyping(true);
    },
    onSuccess: (aiResponse) => {
      queryClient.setQueryData<Message[]>(["aiMessages", user?.id], (old) => [
        ...(old || []),
        {
          id: aiResponse.id,
          content: aiResponse.content,
          sender: "ai",
          timestamp: aiResponse.timestamp,
        },
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

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col min-h-screen  text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-400" />
          AI Assistant
        </h1>
      </header>

      <Card className="flex-1 bg-neutral-800 border-neutral-700 overflow-hidden">
        <CardHeader className="border-b border-neutral-700">
          <CardTitle className="text-neutral-200 text-lg">Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : messages && messages.length > 0 ? (
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
                      "max-w-xs md:max-w-md p-3 rounded-lg",
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-700 text-neutral-200"
                    )}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs text-neutral-400 mt-1 block">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <Bot className="h-12 w-12 mb-2" />
                <p>No messages yet. Start chatting with your AI assistant!</p>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <div className="bg-neutral-700 p-3 rounded-lg">
                  <span className="text-neutral-400 animate-pulse">
                    Typing...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-neutral-700 border-neutral-600 text-white resize-none min-h-[40px] max-h-[100px]"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-200"
              >
                <Mic className="h-4 w-4 mr-1" />
                Voice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-200"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantPage;
