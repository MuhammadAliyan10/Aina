"use client";

import React, { useState, useEffect, useRef } from "react";
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

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  type: "event" | "task";
  status?: "pending" | "completed";
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
    type: "event" as "event" | "task",
  });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

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

  const createEvent = useMutation({
    mutationFn: async () => {
      const endpoint =
        newEvent.type === "event" ? `/api/calendar/events` : `/api/tasks`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title:
            newEvent.title ||
            `Untitled ${newEvent.type === "event" ? "Event" : "Task"}`,
          description: newEvent.description,
          start: newEvent.start,
          end: newEvent.end || undefined,
          type: newEvent.type,
          ...(newEvent.type === "task" && { status: "pending" }),
        }),
      });
      if (!response.ok) throw new Error(`Failed to create ${newEvent.type}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setNewEvent({
        title: "",
        description: "",
        start: "",
        end: "",
        type: "event",
      });
      toast({
        title: "Success",
        description: `${
          newEvent.type === "event" ? "Event" : "Task"
        } created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to create ${newEvent.type}`,
        variant: "destructive",
      });
    },
  });

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
      if (!response.ok) throw new Error(`Failed to update ${event.type}`);
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

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const event = events?.find((e) => e.id === id);
      const endpoint =
        event?.type === "event"
          ? `/api/calendar/events/${id}`
          : `/api/tasks/${id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error(`Failed to delete ${event?.type}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents", user?.id] });
      setEditingEvent(null);
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

  const handleDateClick = (info: any) => {
    setNewEvent({
      title: "",
      description: "",
      start: info.dateStr.slice(0, 16),
      end: "",
      type: "event",
    });
  };

  const handleEventClick = (info: any) => {
    const event = events?.find((e) => e.id === info.event.id);
    if (event) setEditingEvent(event);
  };

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

  const handleSave = () => {
    if (editingEvent) {
      updateEvent.mutate(editingEvent);
    } else {
      createEvent.mutate();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <CalendarIcon className="h-9 w-9 text-primary animate-pulse" />
          Calendar
        </h1>
        <div className="flex gap-3">
          <Button
            variant={view === "dayGridMonth" ? "default" : "outline"}
            onClick={() => setView("dayGridMonth")}
            className={cn(
              "text-foreground font-semibold rounded-lg shadow-md transition-all duration-300",
              view === "dayGridMonth"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border hover:bg-muted"
            )}
          >
            Month
          </Button>
          <Button
            variant={view === "timeGridWeek" ? "default" : "outline"}
            onClick={() => setView("timeGridWeek")}
            className={cn(
              "text-foreground font-semibold rounded-lg shadow-md transition-all duration-300",
              view === "timeGridWeek"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border hover:bg-muted"
            )}
          >
            Week
          </Button>
          <Button
            variant={view === "timeGridDay" ? "default" : "outline"}
            onClick={() => setView("timeGridDay")}
            className={cn(
              "text-foreground font-semibold rounded-lg shadow-md transition-all duration-300",
              view === "timeGridDay"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border hover:bg-muted"
            )}
          >
            Day
          </Button>
        </div>
      </header>

      {eventsLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-2 bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                events={events?.map((event) => ({
                  id: event.id,
                  title: event.title,
                  start: event.start,
                  end: event.end || undefined,
                  classNames: [
                    event.type === "task" && event.status === "completed"
                      ? "bg-success/20 border-success"
                      : event.type === "task"
                      ? "bg-accent/20 border-accent"
                      : "bg-primary/20 border-primary",
                    "rounded-md p-1 shadow-sm",
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
                      const calendarApi = calendarRef.current?.getApi();
                      if (calendarApi) calendarApi.today();
                    },
                  },
                }}
                eventClassNames="text-foreground font-medium"
                dayHeaderClassNames="text-foreground bg-background"
                dayCellClassNames="bg-card border-border"
                slotLabelClassNames="text-muted-foreground"
              />
            </CardContent>
          </Card>

          {/* Event/Task Form */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Plus className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {editingEvent ? "Edit Event/Task" : "New Event/Task"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button
                  variant={
                    newEvent.type === "event" && !editingEvent
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    !editingEvent && setNewEvent({ ...newEvent, type: "event" })
                  }
                  className={cn(
                    "flex-1 text-foreground font-semibold rounded-lg transition-all duration-300",
                    newEvent.type === "event" && !editingEvent
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border hover:bg-muted",
                    editingEvent && "opacity-50 pointer-events-none"
                  )}
                >
                  Event
                </Button>
                <Button
                  variant={
                    newEvent.type === "task" && !editingEvent
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    !editingEvent && setNewEvent({ ...newEvent, type: "task" })
                  }
                  className={cn(
                    "flex-1 text-foreground font-semibold rounded-lg transition-all duration-300",
                    newEvent.type === "task" && !editingEvent
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border hover:bg-muted",
                    editingEvent && "opacity-50 pointer-events-none"
                  )}
                >
                  Task
                </Button>
              </div>
              {(newEvent.start || editingEvent) && (
                <>
                  <Input
                    placeholder={`${
                      editingEvent?.type || newEvent.type === "event"
                        ? "Event"
                        : "Task"
                    } Title`}
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            title: e.target.value,
                          })
                        : setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
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
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg min-h-[100px]"
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
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
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
                    className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
                  />
                  {(editingEvent?.type === "task" ||
                    (!editingEvent && newEvent.type === "task")) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              status:
                                editingEvent.status === "completed"
                                  ? "pending"
                                  : "completed",
                            })
                          : setNewEvent({ ...newEvent, type: "task" })
                      }
                      className={cn(
                        "w-full border-border text-primary hover:bg-muted font-semibold rounded-lg transition-all duration-300",
                        editingEvent?.status === "completed" &&
                          "border-success text-success hover:bg-success/10"
                      )}
                    >
                      <CheckCircle
                        className={cn(
                          "h-5 w-5 mr-2",
                          editingEvent?.status === "completed" && "fill-success"
                        )}
                      />
                      {editingEvent?.status === "completed"
                        ? "Mark Incomplete"
                        : "Mark Complete"}
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={createEvent.isPending || updateEvent.isPending}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      {createEvent.isPending || updateEvent.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-5 w-5 mr-2" />
                      )}
                      {editingEvent ? "Save" : "Create"}
                    </Button>
                    {editingEvent && (
                      <Button
                        variant="ghost"
                        onClick={() => deleteEvent.mutate(editingEvent.id)}
                        disabled={deleteEvent.isPending}
                        className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2 transition-all duration-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setNewEvent({
                          title: "",
                          description: "",
                          start: "",
                          end: "",
                          type: "event",
                        });
                        setEditingEvent(null);
                      }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-all duration-300"
                    >
                      <X className="h-5 w-5" />
                    </Button>
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
