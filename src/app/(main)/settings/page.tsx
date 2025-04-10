"use client";
import { useState } from "react";
import { Zap, Save, CircleAlert, Loader2, CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Ensure you have this component
import { Label } from "@/components/ui/label";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import LoadingButton from "@/components/LoadingButton";
import { motion } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account Settings
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPic, setCoverPic] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      instagram: "",
      twitter: "",
      website: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFAEnabled: false,
      phoneNumber: "",
      sessionTimeout: "30",
      autoLock: false,
      theme: "dark",
      fontSize: "16",
    },
  });

  const tabs = [
    "account",
    "security",
    "appearance",
    "notifications",
    "integrations",
  ];

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("bio", data.bio);
      formData.append("instagram", data.instagram);
      formData.append("twitter", data.twitter);
      formData.append("website", data.website);
      formData.append("theme", data.theme);
      formData.append("fontSize", data.fontSize);
      formData.append("twoFAEnabled", String(data.twoFAEnabled));
      formData.append("phoneNumber", data.twoFAEnabled ? data.phoneNumber : "");
      formData.append("sessionTimeout", data.sessionTimeout);
      formData.append("autoLock", String(data.autoLock));

      if (data.currentPassword && data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          throw new Error("New password and confirmation do not match.");
        }
        formData.append("currentPassword", data.currentPassword);
        formData.append("newPassword", data.newPassword);
      }

      if (profilePic) {
        const toBase64 = (file: File): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        formData.append("profilePic", await toBase64(profilePic));
      }

      if (coverPic) {
        const toBase64 = (file: File): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        formData.append("coverPic", await toBase64(coverPic));
      }

      const response = await axios.post("/api/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully.",
          variant: "default",
        });
        reset(data); // Reset form state to new values
      } else {
        throw new Error(response.data.message || "Failed to save settings.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast({
        description: "Please select a PNG, JPG, or JPEG file.",
        variant: "destructive",
      });
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          </div>
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                className={cn(
                  "capitalize",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace("-", " ")}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Account
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
                        placeholder="Enter your full name"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        placeholder="Tell us about yourself"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  )}
                />
                <div>
                  <Label className="text-foreground">Profile Picture</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleImageChange(e, "profile")}
                      className="bg-input border-border text-foreground"
                    />
                    {profilePic && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {profilePic.name}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Cover Photo</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleImageChange(e, "cover")}
                      className="bg-input border-border text-foreground"
                    />
                    {coverPic && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {coverPic.name}
                      </p>
                    )}
                  </div>
                </div>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">Instagram</Label>
                      <Input
                        {...field}
                        placeholder="https://instagram.com/username"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        placeholder="https://twitter.com/username"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        placeholder="https://yourwebsite.com"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Security
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
                        placeholder="Enter current password"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <Label className="text-foreground">New Password</Label>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter new password"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        placeholder="Confirm new password"
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label className="text-foreground">
                        Enable Two-Factor Authentication
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
                          className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="autoLock"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label className="text-foreground">
                        Auto-Lock After Inactivity
                      </Label>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Appearance
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
                        className="w-full p-2 mt-1 bg-input border border-border rounded text-foreground"
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
                        className="w-full mt-1"
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

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={true} // Placeholder; add state if needed
                    onCheckedChange={() => {}}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-foreground">Email Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={true} // Placeholder
                    onCheckedChange={() => {}}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-foreground">
                    In-App Notifications
                  </Label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg shadow-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Integrations
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={true} // Placeholder
                    onCheckedChange={() => {}}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-foreground">Enable Data Export</Label>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            <LoadingButton
              loading={isSaving}
              disabled={!isDirty && !profilePic && !coverPic}
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </LoadingButton>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CircleAlert className="w-5 h-5" />
            <span>{error}</span>
            <Button
              variant="ghost"
              onClick={() => setError(null)}
              className="text-destructive-foreground"
            >
              Close
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
