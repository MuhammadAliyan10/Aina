"use client";

import React, { useState, useMemo } from "react";
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
  User,
  Activity,
  Download,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const membersPerPage = 10;

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["teamMembers", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/team/members?userId=${user?.id}`);
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite team member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.id] });
      setInviteForm({ email: "", role: "member" });
      toast({ title: "Success", description: "Invitation sent successfully" });
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
    onSuccess: () =>
      toast({ title: "Success", description: "Invite resent successfully" }),
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
  });

  const bulkRemoveTeamMembers = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/team/members/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to remove member ${id}`);
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.id] });
      setSelectedMembers([]);
      setMemberToRemove(null);
      toast({ title: "Success", description: "Selected team members removed" });
    },
  });

  const filteredMembers = useMemo(() => {
    return teamMembers
      ?.filter(
        (member) =>
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (
          sortBy === "fullName" ||
          sortBy === "email" ||
          sortBy === "role" ||
          sortBy === "status"
        ) {
          return sortOrder === "asc"
            ? a[sortBy].localeCompare(b[sortBy])
            : b[sortBy].localeCompare(a[sortBy]);
        }
        return 0;
      })
      .slice((page - 1) * membersPerPage, page * membersPerPage);
  }, [teamMembers, searchTerm, sortBy, sortOrder, page]);

  const toggleSortOrder = (field: "fullName" | "email" | "role" | "status") => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const csv = filteredMembers?.map((member) => ({
      Name: member.fullName,
      Email: member.email,
      Role: member.role,
      Status: member.status,
    }));
    // Implement CSV generation with papaparse or similar
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Name", "Email", "Role", "Status"].join(","),
        ...csv!.map((row) => Object.values(row).join(",")),
      ].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "team_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Users className="h-9 w-9 text-primary animate-pulse" />
          Team Management
        </h1>
        <div className="flex gap-4 items-center w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border rounded-lg"
            />
          </div>
          {selectedMembers.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => bulkRemoveTeamMembers.mutate(selectedMembers)}
              disabled={bulkRemoveTeamMembers.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Selected ({selectedMembers.length})
            </Button>
          )}
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading team members...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invite Team Member */}
          <Card className="lg:col-span-1 bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Email Address"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                className="bg-input border-border"
              />
              <Select
                value={inviteForm.role}
                onValueChange={(val) =>
                  setInviteForm({ ...inviteForm, role: val as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => inviteTeamMember.mutate()}
                disabled={inviteTeamMember.isPending || !inviteForm.email}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {inviteTeamMember.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                Send Invite
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="lg:col-span-2 bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Team Members ({filteredMembers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedMembers.length === filteredMembers?.length &&
                          filteredMembers?.length > 0
                        }
                        onChange={(e) =>
                          setSelectedMembers(
                            e.target.checked
                              ? filteredMembers!.map((m) => m.id)
                              : []
                          )
                        }
                      />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSortOrder("fullName")}
                      className="cursor-pointer"
                    >
                      Name{" "}
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
                      onClick={() => toggleSortOrder("email")}
                      className="cursor-pointer"
                    >
                      Email{" "}
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
                      onClick={() => toggleSortOrder("role")}
                      className="cursor-pointer"
                    >
                      Role{" "}
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
                      onClick={() => toggleSortOrder("status")}
                      className="cursor-pointer"
                    >
                      Status{" "}
                      {sortBy === "status" && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 inline ml-1",
                            sortOrder === "desc" && "rotate-180"
                          )}
                        />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers && filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className={cn(
                          "border-border hover:bg-muted",
                          member.id === user?.id && "bg-muted/50"
                        )}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) =>
                              setSelectedMembers(
                                e.target.checked
                                  ? [...selectedMembers, member.id]
                                  : selectedMembers.filter(
                                      (id) => id !== member.id
                                    )
                              )
                            }
                            disabled={member.id === user?.id}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.fullName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {editingMemberId === member.id ? (
                            <Select
                              value={editedRole}
                              onValueChange={(val) => setEditedRole(val as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                member.role === "admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : member.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editingMemberId === member.id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateTeamMemberRole.mutate({
                                  id: member.id,
                                  role: editedRole,
                                })
                              }
                            >
                              <Save className="h-5 w-5 text-primary" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setEditedRole(member.role);
                              }}
                            >
                              <Edit className="h-5 w-5 text-primary" />
                            </Button>
                          )}
                          {(member.status === "invited" ||
                            member.status === "pending") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resendInvite.mutate(member.id)}
                            >
                              <Mail className="h-5 w-5 text-primary" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member.id)}
                            disabled={member.id === user?.id}
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              /* Open activity log modal */
                            }}
                          >
                            <Activity className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No team members found.
                        <Users className="h-10 w-10 mx-auto mt-4 text-primary animate-bounce" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of{" "}
                  {Math.ceil((teamMembers?.length || 0) / membersPerPage)}
                </span>
                <Button
                  variant="outline"
                  disabled={
                    page >=
                    Math.ceil((teamMembers?.length || 0) / membersPerPage)
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Removal Confirmation Dialog */}
          {memberToRemove && (
            <Dialog
              open={!!memberToRemove}
              onOpenChange={() => setMemberToRemove(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    Confirm Removal
                  </DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to remove this team member?</p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setMemberToRemove(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      bulkRemoveTeamMembers.mutate([memberToRemove])
                    }
                    disabled={bulkRemoveTeamMembers.isPending}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
