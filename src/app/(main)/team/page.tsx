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
  Search,
  ChevronDown,
  AlertCircle,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "fullName" | "email" | "role" | "status"
  >("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

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

  const resendInvite = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/team/invite/resend/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to resend invite");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Invite resent successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to resend invite",
        variant: "destructive",
      });
    },
  });

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
      setMemberToRemove(null);
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

  const filteredTeamMembers = teamMembers
    ?.filter(
      (member) =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "fullName" || sortBy === "email") {
        return sortOrder === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      } else {
        return sortOrder === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      }
    });

  const handleEdit = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditedRole(member.role);
  };

  const handleSave = (id: string) => {
    updateTeamMemberRole.mutate({ id, role: editedRole });
  };

  const toggleSortOrder = (field: "fullName" | "email" | "role" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
          <Users className="h-9 w-9 text-primary animate-pulse" />
          Team
        </h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
      </header>

      {teamLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading team members...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Invite Team Member */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Email Address"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary rounded-lg flex-1"
                />
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as "admin" | "member" | "viewer",
                    })
                  }
                  className="bg-input border-border text-foreground p-2 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button
                  onClick={() => inviteTeamMember.mutate()}
                  disabled={inviteTeamMember.isPending || !inviteForm.email}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {inviteTeamMember.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-5 w-5 mr-2" />
                  )}
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-card border border-border rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("fullName")}
                    >
                      Name
                      {sortBy === "fullName" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("email")}
                    >
                      Email
                      {sortBy === "email" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("role")}
                    >
                      Role
                      {sortBy === "role" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSortOrder("status")}
                    >
                      Status
                      {sortBy === "status" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers && filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-border hover:bg-muted transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium">
                          {member.fullName}
                        </TableCell>
                        <TableCell className="text-foreground">
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
                              className="bg-input border-border text-foreground p-1 rounded-lg focus:ring-2 focus:ring-primary"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className="text-foreground capitalize">
                              {member.role}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium px-3 py-1 rounded-full",
                              member.status === "active"
                                ? "bg-success/20 text-success"
                                : member.status === "pending"
                                ? "bg-accent/20 text-accent"
                                : "bg-primary/20 text-primary"
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
                              className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                            >
                              <Save className="h-5 w-5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                          )}
                          {(member.status === "invited" ||
                            member.status === "pending") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resendInvite.mutate(member.id)}
                              disabled={resendInvite.isPending}
                              className="text-primary hover:text-primary-foreground hover:bg-muted rounded-full p-2"
                            >
                              <Mail className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member.id)}
                            disabled={
                              removeTeamMember.isPending ||
                              member.id === user?.id
                            }
                            className="text-destructive hover:text-destructive-foreground hover:bg-muted rounded-full p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground text-center py-6"
                      >
                        No team members found.
                        <Users className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Removal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <Card className="bg-card border border-border rounded-xl shadow-2xl w-96">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl font-semibold text-card-foreground">
                Confirm Removal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Are you sure you want to remove this team member?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMemberToRemove(null)}
                  className="text-foreground border-border hover:bg-muted rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => removeTeamMember.mutate(memberToRemove)}
                  disabled={removeTeamMember.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                >
                  {removeTeamMember.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
