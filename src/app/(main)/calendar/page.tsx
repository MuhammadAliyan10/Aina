// src/app/(mainPages)/calendar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle,
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

// Types for events and tasks
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  type: "event" | "task";
  status?: "pending" | "completed"; // For tasks
}

const CalendarPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [view, setView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
  });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Fetch events and tasks
  const { data: events, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendarEvents", user?.id],
    queryFn: async () => {
      const [eventsResponse, tasksResponse] = await Promise.all([
        fetch(`/api/calendar/events?userId=${user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`/api/tasks?userId=${user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!eventsResponse.ok || !tasksResponse.ok) {
        throw new Error("Failed to fetch calendar data");
      }

      const eventsData = await eventsResponse.json();
      const tasksData = await tasksResponse.json();

      // Transform tasks into calendar events
      const taskEvents = tasksData.map((task: any) => ({
        id: task.id,
        title: task.title,
        start: task.dueDate || task.createdAt,
        description: task.description,
        type: "task",
        status: task.status,
      }));

      return [...eventsData, ...taskEvents];
    },
    enabled: !!user?.id,
  });

  // Mutation to create an event
  const createEvent = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/calendar/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newEvent.title || "Untitled Event",
          description: newEvent.description,
          start: newEvent.start,
          end: newEvent.end || undefined,
          type: "event",
        }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setNewEvent({ title: "", description: "", start: "", end: "" });
      toast({ title: "Success", description: "Event created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Mutation to update an event
  const updateEvent = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      const endpoint =
        event.type === "event"
          ? `/api/calendar/events/${event.id}`
          : `/api/tasks/${event.id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
          ...(event.type === "task" && { status: event.status }),
        }),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setEditingEvent(null);
      toast({ title: "Success", description: "Event updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete an event
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
      toast({ title: "Success", description: "Event deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  // Handle date click to create event
  const handleDateClick = (info: any) => {
    setNewEvent({
      title: "",
      description: "",
      start: info.dateStr,
      end: "",
    });
  };

  // Handle event click to edit
  const handleEventClick = (info: any) => {
    const event = events?.find((e) => e.id === info.event.id);
    if (event) setEditingEvent(event);
  };

  // Handle event drop (drag-and-drop)
  const handleEventDrop = (info: any) => {
    const updatedEvent = events?.find((e) => e.id === info.event.id);
    if (updatedEvent) {
      updateEvent.mutate({
        ...updatedEvent,
        start: info.event.startStr,
        end: info.event.endStr || undefined,
      });
    }
  };

  function handleSave(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8 text-blue-400" />
          Calendar
        </h1>
        <div className="flex gap-2">
          <Button
            variant={view === "dayGridMonth" ? "default" : "outline"}
            onClick={() => setView("dayGridMonth")}
            className={cn(
              "text-neutral-200",
              view === "dayGridMonth"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-blue-400 hover:bg-neutral-800"
            )}
          >
            Month
          </Button>
          <Button
            variant={view === "timeGridWeek" ? "default" : "outline"}
            onClick={() => setView("timeGridWeek")}
            className={cn(
              "text-neutral-200",
              view === "timeGridWeek"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-blue-400 hover:bg-neutral-800"
            )}
          >
            Week
          </Button>
          <Button
            variant={view === "timeGridDay" ? "default" : "outline"}
            onClick={() => setView("timeGridDay")}
            className={cn(
              "text-neutral-200",
              view === "timeGridDay"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-blue-400 hover:bg-neutral-800"
            )}
          >
            Day
          </Button>
        </div>
      </header>

      {eventsLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                events={events?.map((event) => ({
                  id: event.id,
                  title: event.title,
                  start: event.start,
                  end: event.end || undefined,
                  classNames: [
                    event.type === "task" && event.status === "completed"
                      ? "bg-green-700 border-green-500"
                      : event.type === "task"
                      ? "bg-yellow-700 border-yellow-500"
                      : "bg-blue-600 border-blue-400",
                  ],
                }))}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
                height="auto"
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                editable={true}
                droppable={true}
                dayMaxEventRows={true}
                views={{
                  dayGridMonth: { dayMaxEventRows: 3 },
                }}
                customButtons={{
                  today: {
                    text: "Today",
                    click: () => {
                      const calendarApi =
                        document.querySelector(".fc")?.["calendar"];
                      if (calendarApi) calendarApi.today();
                    },
                  },
                }}
                eventClassNames="text-white font-medium p-1 rounded-md"
                dayHeaderClassNames="text-neutral-400"
                dayCellClassNames="bg-neutral-800 border-neutral-700"
              />
            </CardContent>
          </Card>

          {/* Event/Task Form */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                {editingEvent ? "Edit Event/Task" : "New Event"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(newEvent.start || editingEvent) && (
                <>
                  <Input
                    placeholder="Event Title"
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            title: e.target.value,
                          })
                        : setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                  <Textarea
                    placeholder="Description"
                    value={
                      editingEvent
                        ? editingEvent.description || ""
                        : newEvent.description
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            description: e.target.value,
                          })
                        : setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                    }
                    className="bg-neutral-700 border-neutral-600 text-white min-h-[100px]"
                  />
                  <Input
                    type="datetime-local"
                    value={
                      editingEvent
                        ? editingEvent.start.slice(0, 16)
                        : newEvent.start
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            start: e.target.value,
                          })
                        : setNewEvent({ ...newEvent, start: e.target.value })
                    }
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                  <Input
                    type="datetime-local"
                    value={
                      editingEvent
                        ? editingEvent.end?.slice(0, 16) || ""
                        : newEvent.end
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            end: e.target.value,
                          })
                        : setNewEvent({ ...newEvent, end: e.target.value })
                    }
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                  {editingEvent?.type === "task" && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setEditingEvent({
                          ...editingEvent,
                          status:
                            editingEvent.status === "completed"
                              ? "pending"
                              : "completed",
                        })
                      }
                      className={cn(
                        "text-neutral-400 hover:text-neutral-200",
                        editingEvent.status === "completed" &&
                          "text-green-400 hover:text-green-300"
                      )}
                    >
                      <CheckCircle
                        className={cn(
                          "h-4 w-4 mr-2",
                          editingEvent.status === "completed" &&
                            "fill-green-400"
                        )}
                      />
                      {editingEvent.status === "completed"
                        ? "Mark Incomplete"
                        : "Mark Complete"}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        editingEvent ? handleSave() : createEvent.mutate()
                      }
                      disabled={createEvent.isPending || updateEvent.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createEvent.isPending || updateEvent.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {editingEvent ? "Save" : "Create"}
                    </Button>
                    {editingEvent && (
                      <Button
                        variant="ghost"
                        onClick={() => deleteEvent.mutate(editingEvent.id)}
                        disabled={deleteEvent.isPending}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {(newEvent.start || editingEvent) && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNewEvent({
                            title: "",
                            description: "",
                            start: "",
                            end: "",
                          });
                          setEditingEvent(null);
                        }}
                        className="text-neutral-400 hover:text-neutral-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
