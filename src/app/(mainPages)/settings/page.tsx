// src/app/(mainPages)/settings/page.tsx
"use client";

import { useState } from "react";
import { Zap, Save, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/app/(main)/SessionProvider";

const SettingsPage = () => {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("account");

  // Account Settings
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email] = useState(user?.email || ""); // Email not editable directly
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState(user?.profilePic || ""); // New: Profile picture URL
  const [bio, setBio] = useState(user?.bio || ""); // New: User bio

  // AI Assistant Settings
  const [assistantName, setAssistantName] = useState("Grok"); // New: Custom assistant name
  const [assistantVoice, setAssistantVoice] = useState("neutral");
  const [assistantTone, setAssistantTone] = useState("friendly");
  const [responseSpeed, setResponseSpeed] = useState("5");
  const [aiLearningEnabled, setAiLearningEnabled] = useState(true); // New: AI learning toggle
  const [aiLanguage, setAiLanguage] = useState("en"); // New: Language preference

  // Workflow Settings
  const [autoRunWorkflows, setAutoRunWorkflows] = useState(true);
  const [defaultTimeout, setDefaultTimeout] = useState("5000");
  const [workflowLogging, setWorkflowLogging] = useState(true); // New: Enable workflow logs
  const [maxRetries, setMaxRetries] = useState("3"); // New: Max retry attempts for failed workflows

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [notificationSound, setNotificationSound] = useState(false);
  const [muteDuringFocus, setMuteDuringFocus] = useState(false); // New: Mute during focus mode
  const [notificationDelay, setNotificationDelay] = useState("0"); // New: Delay notifications (seconds)

  // Appearance Settings
  const [theme, setTheme] = useState("dark"); // Default to dark
  const [fontSize, setFontSize] = useState("16");
  const [sidebarPosition, setSidebarPosition] = useState("left"); // New: Sidebar position
  const [animationEnabled, setAnimationEnabled] = useState(true); // New: Enable UI animations

  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("30"); // New: Session timeout in minutes
  const [autoLock, setAutoLock] = useState(false); // New: Auto-lock after inactivity

  // Additional Settings (New Category)
  const [dataExportEnabled, setDataExportEnabled] = useState(true); // New: Allow data export
  const [apiKey, setApiKey] = useState(""); // New: Generate/display API key for integrations
  const [defaultTimezone, setDefaultTimezone] = useState("UTC"); // New: Timezone preference

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const settings = {
        fullName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
        profilePic,
        bio,
        assistantName,
        assistantVoice,
        assistantTone,
        responseSpeed,
        aiLearningEnabled,
        aiLanguage,
        autoRunWorkflows,
        defaultTimeout,
        workflowLogging,
        maxRetries,
        emailNotifications,
        inAppNotifications,
        notificationSound,
        muteDuringFocus,
        notificationDelay,
        theme,
        fontSize,
        sidebarPosition,
        animationEnabled,
        twoFactorEnabled,
        phoneNumber: twoFactorEnabled ? phoneNumber : undefined,
        sessionTimeout,
        autoLock,
        dataExportEnabled,
        apiKey,
        defaultTimezone,
      };

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save settings: ${errorText}`);
      }

      console.log("Settings saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex-shrink-0 border-r border-gray-800">
        <div className="flex items-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <nav className="space-y-2">
          {[
            "account",
            "ai-assistant",
            "workflows",
            "notifications",
            "appearance",
            "security",
            "integrations", // New category
          ].map((tab) => (
            <button
              key={tab}
              className={`w-full text-left py-2 px-4 rounded-lg hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors ${
                activeTab === tab ? "bg-gray-800" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab
                .replace("-", " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative bg-gray-900">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {activeTab
              .replace("-", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h2>
          <Button
            variant="outline"
            className="text-blue-400 border-blue-400 hover:bg-blue-900"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </header>

        {/* Settings Sections */}
        {activeTab === "account" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    value={email}
                    disabled
                    className="mt-1 bg-gray-700 border-gray-600 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Profile Picture URL
                  </label>
                  <Input
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 text-white rounded-lg h-24 resize-y"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  placeholder="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  placeholder="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "ai-assistant" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Assistant Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Assistant Name
                  </label>
                  <Input
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., Grok"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Voice
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={assistantVoice}
                    onChange={(e) => setAssistantVoice(e.target.value)}
                  >
                    <option value="neutral">Neutral</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Tone
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={assistantTone}
                    onChange={(e) => setAssistantTone(e.target.value)}
                  >
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Response Speed
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={responseSpeed}
                    onChange={(e) => setResponseSpeed(e.target.value)}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-400">
                    {responseSpeed}/10
                  </span>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={aiLearningEnabled}
                    onChange={(e) => setAiLearningEnabled(e.target.checked)}
                  />
                  Enable AI Learning (Improves responses over time)
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Language
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "workflows" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Automation Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoRunWorkflows}
                    onChange={(e) => setAutoRunWorkflows(e.target.checked)}
                  />
                  Auto-run workflows on trigger
                </label>
                <Input
                  placeholder="Default Timeout (ms)"
                  type="number"
                  value={defaultTimeout}
                  onChange={(e) => setDefaultTimeout(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={workflowLogging}
                    onChange={(e) => setWorkflowLogging(e.target.checked)}
                  />
                  Enable Workflow Logging
                </label>
                <Input
                  placeholder="Max Retries on Failure"
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  Email Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                  />
                  In-App Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSound}
                    onChange={(e) => setNotificationSound(e.target.checked)}
                  />
                  Notification Sound
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={muteDuringFocus}
                    onChange={(e) => setMuteDuringFocus(e.target.checked)}
                  />
                  Mute During Focus Mode
                </label>
                <Input
                  placeholder="Notification Delay (seconds)"
                  type="number"
                  value={notificationDelay}
                  onChange={(e) => setNotificationDelay(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "appearance" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Theme
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-400">{fontSize}px</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Sidebar Position
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={sidebarPosition}
                    onChange={(e) => setSidebarPosition(e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={animationEnabled}
                    onChange={(e) => setAnimationEnabled(e.target.checked)}
                  />
                  Enable UI Animations
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === "security" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                  Enable 2FA
                </label>
                {twoFactorEnabled && (
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                )}
                <Input
                  placeholder="Session Timeout (minutes)"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoLock}
                    onChange={(e) => setAutoLock(e.target.checked)}
                  />
                  Auto-lock After Inactivity
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === "integrations" && (
          <section className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Integrations</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dataExportEnabled}
                    onChange={(e) => setDataExportEnabled(e.target.checked)}
                  />
                  Enable Data Export
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={apiKey}
                      readOnly
                      className="mt-1 bg-gray-700 border-gray-600 text-white flex-1"
                    />
                    <Button
                      variant="outline"
                      className="mt-1 text-blue-400 border-blue-400 hover:bg-blue-900"
                      onClick={() => setApiKey(uuidv4())} // Simple UUID for demo
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Default Timezone
                  </label>
                  <select
                    className="w-full p-2 border rounded mt-1 bg-gray-700 border-gray-600 text-white"
                    value={defaultTimezone}
                    onChange={(e) => setDefaultTimezone(e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-900 p-4 rounded-lg shadow-lg z-20 flex items-center gap-2 text-white">
            <CircleAlert size={20} />
            <span>{error}</span>
            <Button
              variant="ghost"
              onClick={() => setError(null)}
              className="text-white"
            >
              Close
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

// Simple UUID generator for API key demo
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default SettingsPage;
