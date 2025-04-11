"use client";

import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  type: "event" | "task";
}

const CalendarPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [view, setView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");
  const [filter, setFilter] = useState<"all" | "event" | "task">("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const calendarRef = useRef<FullCalendar>(null);

  const { data: events, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendarEvents", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/calendar/events?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch calendar data");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => {
      const response = await fetch(`/api/calendar/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, ...event }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setSelectedEvent(null);
      toast({ title: "Success", description: "Event created successfully" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      const response = await fetch(`/api/calendar/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, ...event }),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setSelectedEvent(null);
      toast({ title: "Success", description: "Event updated successfully" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setSelectedEvent(null);
      toast({ title: "Success", description: "Event deleted successfully" });
    },
  });

  const exportToICal = () => {
    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//xAI//Grok Calendar//EN",
      ...(events || []).map((event) =>
        [
          "BEGIN:VEVENT",
          `UID:${event.id}`,
          `DTSTART:${
            new Date(event.start)
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0]
          }Z`,
          event.end
            ? `DTEND:${
                new Date(event.end)
                  .toISOString()
                  .replace(/[-:]/g, "")
                  .split(".")[0]
              }Z`
            : "",
          `SUMMARY:${event.title}`,
          event.description ? `DESCRIPTION:${event.description}` : "",
          "END:VEVENT",
        ].join("\n")
      ),
      "END:VCALENDAR",
    ].join("\n");
    const blob = new Blob([icalContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar.ics";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDateClick = (info: any) => {
    setSelectedEvent({
      id: "",
      title: "",
      start: info.dateStr.slice(0, 16),
      type: "event",
    });
  };

  const handleEventClick = (info: any) => {
    const event = events?.find((e) => e.id === info.event.id);
    if (event) setSelectedEvent(event);
  };

  const handleEventDrop = (info: any) => {
    const updatedEvent = events?.find((e) => e.id === info.event.id);
    if (updatedEvent)
      updateEvent.mutate({
        ...updatedEvent,
        start: info.event.startStr,
        end: info.event.endStr || undefined,
      });
  };

  const filteredEvents = events?.filter(
    (event) => filter === "all" || event.type === filter
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <CalendarIcon className="h-9 w-9 text-primary animate-pulse" />
          Calendar
        </h1>
        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "event" | "task")
            }
            className="bg-input border border-border text-foreground p-2 rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All</option>
            <option value="event">Events</option>
            <option value="task">Tasks</option>
          </select>
          <Button variant="outline" onClick={exportToICal}>
            <Download className="h-4 w-4 mr-2" />
            Export iCal
          </Button>
          <Button
            variant={view === "dayGridMonth" ? "default" : "outline"}
            onClick={() => setView("dayGridMonth")}
            className={cn(
              view === "dayGridMonth" &&
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
            )}
          >
            Month
          </Button>
          <Button
            variant={view === "timeGridWeek" ? "default" : "outline"}
            onClick={() => setView("timeGridWeek")}
            className={cn(
              view === "timeGridWeek" &&
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
            )}
          >
            Week
          </Button>
          <Button
            variant={view === "timeGridDay" ? "default" : "outline"}
            onClick={() => setView("timeGridDay")}
            className={cn(
              view === "timeGridDay" &&
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
            )}
          >
            Day
          </Button>
        </div>
      </header>

      {eventsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium text-muted-foreground animate-pulse">
            Loading calendar...
          </p>
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-card to-muted/20 border-border rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              events={filteredEvents?.map((event) => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end || undefined,
                classNames: [
                  event.type === "task"
                    ? "bg-accent/20 border-accent"
                    : "bg-primary/20 border-primary",
                  "rounded-md p-1 shadow-sm hover:bg-opacity-50 transition-colors",
                ],
              }))}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              height="80vh"
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              editable={true}
              droppable={true}
              dayMaxEventRows={true}
              views={{ dayGridMonth: { dayMaxEventRows: 4 } }}
              customButtons={{
                today: {
                  text: "Today",
                  click: () => calendarRef.current?.getApi().today(),
                },
              }}
              eventClassNames="text-foreground font-medium cursor-pointer"
              dayHeaderClassNames="text-foreground bg-muted/10"
              dayCellClassNames="bg-card border-border"
              slotLabelClassNames="text-muted-foreground"
            />
          </CardContent>
        </Card>
      )}

      {/* Event/Task Dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent className="bg-card border-border rounded-2xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {selectedEvent.id ? "Edit" : "New"}{" "}
                {selectedEvent.type === "event" ? "Event" : "Task"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={
                    selectedEvent.type === "event" ? "default" : "outline"
                  }
                  onClick={() =>
                    setSelectedEvent({ ...selectedEvent, type: "event" })
                  }
                  className={cn(
                    selectedEvent.type === "event" &&
                      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                  )}
                >
                  Event
                </Button>
                <Button
                  variant={
                    selectedEvent.type === "task" ? "default" : "outline"
                  }
                  onClick={() =>
                    setSelectedEvent({ ...selectedEvent, type: "task" })
                  }
                  className={cn(
                    selectedEvent.type === "task" &&
                      "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground"
                  )}
                >
                  Task
                </Button>
              </div>
              <Input
                placeholder={`${
                  selectedEvent.type === "event" ? "Event" : "Task"
                } Title`}
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
              />
              <Textarea
                placeholder="Description"
                value={selectedEvent.description || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    description: e.target.value,
                  })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              />
              <Input
                type="datetime-local"
                value={selectedEvent.start.slice(0, 16)}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, start: e.target.value })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
              />
              <Input
                type="datetime-local"
                value={selectedEvent.end?.slice(0, 16) || ""}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, end: e.target.value })
                }
                className="bg-input border-border rounded-lg shadow-inner focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    selectedEvent.id
                      ? updateEvent.mutate(selectedEvent)
                      : createEvent.mutate(selectedEvent)
                  }
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {createEvent.isPending || updateEvent.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {selectedEvent.id ? "Save" : "Create"}
                </Button>
                {selectedEvent.id && (
                  <Button
                    variant="ghost"
                    onClick={() => deleteEvent.mutate(selectedEvent.id)}
                    disabled={deleteEvent.isPending}
                    className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarPage;
