"use client";

import { useState, useEffect } from "react";
import { Zap, Save, CircleAlert, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import LoadingButton from "@/components/LoadingButton";
import { motion } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

interface SettingsForm {
  fullName: string;
  bio: string;
  instagram: string;
  twitter: string;
  website: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFAEnabled: boolean;
  phoneNumber: string;
  sessionTimeout: string;
  theme: "light" | "dark" | "system";
  fontSize: string;
}

const SettingsPage = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "account" | "security" | "appearance"
  >("account");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPic, setCoverPic] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsForm>({
    defaultValues: {
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      instagram: user?.socialLinks?.instagram || "",
      twitter: user?.socialLinks?.twitter || "",
      website: user?.socialLinks?.website || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFAEnabled: user?.twoFAEnabled || false,
      phoneNumber: user?.phoneNumber || "",
      sessionTimeout: user?.sessionTimeout || "30",
      theme: (user?.theme as "light" | "dark" | "system") || "dark",
      fontSize: user?.fontSize || "16",
    },
  });

  useEffect(() => {
    reset({
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      instagram: user?.socialLinks?.instagram || "",
      twitter: user?.socialLinks?.twitter || "",
      website: user?.socialLinks?.website || "",
      twoFAEnabled: user?.twoFAEnabled || false,
      phoneNumber: user?.phoneNumber || "",
      sessionTimeout: user?.sessionTimeout || "30",
      theme: (user?.theme as "light" | "dark" | "system") || "dark",
      fontSize: user?.fontSize || "16",
    });
  }, [user, reset]);

  const tabs = ["account", "security", "appearance"];

  const onSubmit = async (data: SettingsForm) => {
    try {
      const formData = new FormData();
      formData.append("userId", user?.id || "");
      formData.append("fullName", data.fullName);
      formData.append("bio", data.bio || "");
      formData.append("instagram", data.instagram || "");
      formData.append("twitter", data.twitter || "");
      formData.append("website", data.website || "");
      formData.append("twoFAEnabled", String(data.twoFAEnabled));
      formData.append("phoneNumber", data.twoFAEnabled ? data.phoneNumber : "");
      formData.append("sessionTimeout", data.sessionTimeout);
      formData.append("theme", data.theme);
      formData.append("fontSize", data.fontSize);

      if (data.currentPassword && data.newPassword) {
        if (data.newPassword !== data.confirmPassword)
          throw new Error("Passwords do not match.");
        if (data.newPassword.length < 8)
          throw new Error("New password must be at least 8 characters.");
        formData.append("currentPassword", data.currentPassword);
        formData.append("newPassword", data.newPassword);
      }

      if (profilePic) formData.append("profilePic", profilePic);
      if (coverPic) formData.append("coverPic", coverPic);

      const response = await axios.post("/api/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated.",
        });
        reset(data);
        if (data.theme !== user?.theme || data.fontSize !== user?.fontSize) {
          window.location.reload();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpg", "image/jpeg"].includes(file.type)) {
      toast({
        description: "Please select a PNG, JPG, or JPEG file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        description: "File size exceeds 5MB limit.",
        variant: "destructive",
      });
      return;
    }

    if (type === "profile") setProfilePic(file);
    else setCoverPic(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      {/* Navbar */}
      <nav className="bg-card border-b border-border shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
              Settings
            </h1>
          </div>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                className={cn(
                  "capitalize",
                  activeTab === tab
                    ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() =>
                  setActiveTab(tab as "account" | "security" | "appearance")
                }
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-card to-muted/20 rounded-2xl shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text mb-6">
                Account Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "Full Name is required" }}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Full Name</Label>
                      <Input
                        {...field}
                        placeholder="Your full name"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                      {errors.fullName && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Bio</Label>
                      <Input
                        {...field}
                        placeholder="About you"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
                <div>
                  <Label className="text-foreground">Profile Picture</Label>
                  <label className="flex items-center gap-2 bg-input border border-border rounded-lg p-2 cursor-pointer hover:bg-muted transition">
                    <Camera className="w-5 h-5 text-indigo-400" />
                    <span className="text-foreground">
                      {profilePic ? profilePic.name : "Choose file"}
                    </span>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleImageChange(e, "profile")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <Label className="text-foreground">Cover Photo</Label>
                  <label className="flex items-center gap-2 bg-input border border-border rounded-lg p-2 cursor-pointer hover:bg-muted transition">
                    <Camera className="w-5 h-5 text-indigo-400" />
                    <span className="text-foreground">
                      {coverPic ? coverPic.name : "Choose file"}
                    </span>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleImageChange(e, "cover")}
                      className="hidden"
                    />
                  </label>
                </div>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Instagram</Label>
                      <Input
                        {...field}
                        placeholder="Instagram handle"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="twitter"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Twitter</Label>
                      <Input
                        {...field}
                        placeholder="Twitter handle"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <Label className="text-foreground">Website</Label>
                      <Input
                        {...field}
                        placeholder="Your website"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-card to-muted/20 rounded-2xl shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text mb-6">
                Security Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="currentPassword"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">
                        Current Password
                      </Label>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Current password"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">New Password</Label>
                      <Input
                        {...field}
                        type="password"
                        placeholder="New password"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                      {errors.newPassword && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <Label className="text-foreground">
                        Confirm New Password
                      </Label>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Confirm password"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="twoFAEnabled"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-indigo-400"
                      />
                      <Label className="text-foreground">
                        Two-Factor Authentication
                      </Label>
                    </div>
                  )}
                />
                {control._formValues.twoFAEnabled && (
                  <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{ required: "Phone number is required for 2FA" }}
                    render={({ field }) => (
                      <div>
                        <Label className="text-foreground">Phone Number</Label>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+1234567890"
                          className="bg-input border-border text-foreground shadow-inner"
                        />
                        {errors.phoneNumber && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
                <Controller
                  name="sessionTimeout"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        {...field}
                        type="number"
                        min="5"
                        max="120"
                        className="bg-input border-border text-foreground shadow-inner"
                      />
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-card to-muted/20 rounded-2xl shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text mb-6">
                Appearance Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="theme"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Theme</Label>
                      <select
                        {...field}
                        className="w-full p-2 mt-1 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-indigo-400 shadow-inner"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  )}
                />
                <Controller
                  name="fontSize"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Font Size (px)</Label>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        {...field}
                        className="w-full mt-1 accent-indigo-400"
                      />
                      <span className="text-sm text-muted-foreground">
                        {field.value}px
                      </span>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            <LoadingButton
              loading={false}
              disabled={!isDirty && !profilePic && !coverPic}
              type="submit"
              className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;
