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
  MessageSquare,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  attachment?: string; // URL or file name for attachments
}

const AIAssistantPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // For floating chatbot
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Voice input is not yet implemented.",
    });
  };

  const handleAttachment = () => {
    toast({
      title: "Attachment",
      description: "Attachment upload is not yet implemented.",
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Bot className="h-9 w-9 text-primary animate-pulse" />
          AI Assistant
        </h1>
      </header>

      {/* Main Chat Area */}
      <Card className="flex-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Chat with Your Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            ) : messages && messages.length > 0 ? (
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
                      "flex items-start gap-2 max-w-xs md:max-w-md p-4 rounded-lg shadow-md",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p>{msg.content}</p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm mt-1 block"
                        >
                          Attachment
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
                <Bot className="h-12 w-12 mb-4 text-primary animate-bounce" />
                <p className="text-lg">
                  No messages yet. Start chatting with your AI assistant!
                </p>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start gap-3">
                <div className="bg-muted p-4 rounded-lg shadow-md flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="text-foreground animate-pulse">
                    Typing...
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
                className="flex-1 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg resize-none min-h-[50px] max-h-[150px]"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
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
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttachment}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Chatbot Toggle */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Floating Chatbot Window */}
      {isChatOpen && (
        <div
          ref={chatContainerRef}
          className="fixed bottom-20 right-6 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[70vh] overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages && messages.length > 0 ? (
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm">{msg.content}</p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs mt-1 block"
                        >
                          Attachment
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
                    Typing...
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
                className="flex-1 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg resize-none min-h-[40px] max-h-[100px] text-sm"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-2"
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
