// src/app/(mainPages)/team/page.tsx
"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  Edit,
  Save,
  Loader2,
  Trash2,
  Mail,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "@/hooks/use-toast";

// Types for team data
interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "pending" | "invited";
}

interface InviteForm {
  email: string;
  role: "admin" | "member" | "viewer";
}

const TeamPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    role: "member",
  });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<"admin" | "member" | "viewer">(
    "member"
  );

  // Fetch team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ["teamMembers", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/team/members?userId=${user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch team members");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Mutation to invite a team member
  const inviteTeamMember = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/team/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: inviteForm.email,
          role: inviteForm.role,
        }),
      });
      if (!response.ok) throw new Error("Failed to invite team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.id] });
      setInviteForm({ email: "", role: "member" });
      toast({ title: "Success", description: "Invitation sent successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a team member's role
  const updateTeamMemberRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await fetch(`/api/team/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, role }),
      });
      if (!response.ok) throw new Error("Failed to update team member role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.id] });
      setEditingMemberId(null);
      toast({ title: "Success", description: "Role updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Mutation to remove a team member
  const removeTeamMember = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/team/members/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to remove team member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.id] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditedRole(member.role);
  };

  const handleSave = (id: string) => {
    updateTeamMemberRole.mutate({ id, role: editedRole });
  };

  const isLoading = teamLoading;

  return (
    <div className="flex flex-col min-h-screen text-neutral-200 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Invite Team Member */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Email Address"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  className="bg-neutral-700 border-neutral-600 text-white flex-1"
                />
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as "admin" | "member" | "viewer",
                    })
                  }
                  className="bg-neutral-700 border-neutral-600 text-white p-2 rounded-md"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button
                  onClick={() => inviteTeamMember.mutate()}
                  disabled={inviteTeamMember.isPending || !inviteForm.email}
                >
                  {inviteTeamMember.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-neutral-200">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-neutral-400">Name</TableHead>
                    <TableHead className="text-neutral-400">Email</TableHead>
                    <TableHead className="text-neutral-400">Role</TableHead>
                    <TableHead className="text-neutral-400">Status</TableHead>
                    <TableHead className="text-neutral-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers && teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <TableRow key={member.id} className="border-neutral-700">
                        <TableCell className="text-neutral-200">
                          {member.fullName}
                        </TableCell>
                        <TableCell className="text-neutral-200">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          {editingMemberId === member.id ? (
                            <select
                              value={editedRole}
                              onChange={(e) =>
                                setEditedRole(
                                  e.target.value as
                                    | "admin"
                                    | "member"
                                    | "viewer"
                                )
                              }
                              className="bg-neutral-700 border-neutral-600 text-white p-1 rounded-md"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className="text-neutral-200 capitalize">
                              {member.role}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-2 py-1 rounded-full",
                              member.status === "active"
                                ? "bg-green-700 text-green-100"
                                : member.status === "pending"
                                ? "bg-yellow-700 text-yellow-100"
                                : "bg-blue-700 text-blue-100"
                            )}
                          >
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editingMemberId === member.id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSave(member.id)}
                              disabled={updateTeamMemberRole.isPending}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember.mutate(member.id)}
                            disabled={
                              removeTeamMember.isPending ||
                              member.id === user?.id
                            } // Prevent self-removal
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-neutral-400 text-center"
                      >
                        No team members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
