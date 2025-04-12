"use client";

import { useState, useEffect } from "react";
import { useSession } from "../SessionProvider";
import Image from "next/image";
import userAvatar from "@/assets/UserAvatar.png";
import coverPlaceholder from "@/assets/Network-Block.jpeg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CameraIcon,
  LoaderCircle,
  Instagram,
  Twitter,
  Link2,
  Award,
  Settings,
} from "lucide-react";
import axios from "axios";

interface UserProfile {
  fullName: string;
  username: string;
  bio?: string;
  email: string;
  profilePic?: string;
  coverPic?: string;
  createdAt: string;
  plan: "Free" | "Premium" | "Enterprise";
  points: { automation: number; tasks: number; workflows: number };
  socialLinks?: { instagram?: string; twitter?: string; website?: string };
}

const ProfilePage = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isCoverDialogOpen, setIsCoverDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const profile: UserProfile = {
    ...user,
    plan: user?.plan || "Free",
    points: { automation: 150, tasks: 300, workflows: 75 }, // Example data, fetch from API if available
    socialLinks: {
      instagram: "user_insta",
      twitter: "user_twitter",
      website: "https://example.com",
    }, // Example data
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      fullName: profile.fullName || "",
      bio: profile.bio || "",
      instagram: profile.socialLinks?.instagram || "",
      twitter: profile.socialLinks?.twitter || "",
      website: profile.socialLinks?.website || "",
    },
  });

  useEffect(() => {
    reset({
      fullName: profile.fullName || "",
      bio: profile.bio || "",
      instagram: profile.socialLinks?.instagram || "",
      twitter: profile.socialLinks?.twitter || "",
      website: profile.socialLinks?.website || "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id }),
      });

      if (res.ok) {
        const resData = await res.json();
        toast({ title: "Profile Updated", description: resData.message });
        setIsProfileDialogOpen(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");
      if (!["image/png", "image/jpg", "image/jpeg"].includes(file.type)) {
        throw new Error("Please select a PNG, JPG, or JPEG file.");
      }
      if (file.size > 5 * 1024 * 1024)
        throw new Error("File size exceeds 5MB limit.");

      if (type === "profile") setSelectedImage(file);
      else setSelectedCover(file);
    } catch (error) {
      toast({ description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleImageUpload = async (type: "profile" | "cover") => {
    const image = type === "profile" ? selectedImage : selectedCover;
    if (!image)
      return toast({
        description: "No image selected.",
        variant: "destructive",
      });

    try {
      setImageLoading(type === "profile");
      setCoverLoading(type === "cover");

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const base64Image = await toBase64(image);
      const endpoint =
        type === "profile"
          ? "/api/auth/profile/updateProfileImage"
          : "/api/auth/profile/updateCoverImage";
      const response = await axios.put(endpoint, {
        [type === "profile" ? "profilePic" : "coverPic"]: base64Image,
        userId: user?.id,
      });

      if (response.status === 200) {
        toast({ title: "Success", description: response.data.message });
        if (type === "profile") setIsImageDialogOpen(false);
        else setIsCoverDialogOpen(false);
      }
    } catch (error) {
      toast({
        description:
          (error as Error).message || `Failed to upload ${type} picture.`,
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
      setCoverLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src={profile.coverPic || coverPlaceholder}
          alt="Cover Photo"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-secondary/80 text-secondary-foreground hover:bg-accent hover:text-accent-foreground shadow-md"
          onClick={() => setIsCoverDialogOpen(true)}
        >
          <CameraIcon className="w-4 h-4 mr-2" />
          Edit Cover
        </Button>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center md:flex-row gap-6"
        >
          {/* Profile Picture */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative group z-10"
          >
            <Image
              alt="User Avatar"
              src={profile.profilePic || userAvatar}
              width={160}
              height={160}
              className="w-40 h-40 rounded-full border-4 border-border object-cover cursor-pointer transition-transform group-hover:scale-105 shadow-xl"
              onClick={() => setIsImageDialogOpen(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
              <CameraIcon className="text-white w-10 h-10" />
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 bg-gradient-to-br from-card to-muted/20 rounded-2xl shadow-lg border border-border p-6 w-full max-w-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
                    {profile.fullName || "Anonymous"}
                  </h1>
                  <Badge
                    className={cn(
                      "text-sm font-semibold",
                      profile.plan === "Free" && "bg-gray-600",
                      profile.plan === "Premium" && "bg-blue-600",
                      profile.plan === "Enterprise" && "bg-purple-600"
                    )}
                  >
                    {profile.plan}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">
                  @{profile.username || "N/A"}
                </p>
                <p className="mt-2 text-foreground leading-relaxed">
                  {profile.bio || "No bio yet."}
                </p>
                {/* Badges */}
                <div className="flex gap-2 mt-3">
                  {profile.points.automation > 100 && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Award className="w-4 h-4 text-yellow-400" />
                      Automation Master
                    </Badge>
                  )}
                  {profile.points.tasks > 200 && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Award className="w-4 h-4 text-green-400" />
                      Task Titan
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsProfileDialogOpen(true)}
                  className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-4 text-center border-t border-border pt-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {profile.points.automation}
                </p>
                <p className="text-sm text-muted-foreground">
                  Automation Points
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {profile.points.tasks}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {profile.points.workflows}
                </p>
                <p className="text-sm text-muted-foreground">
                  Workflows Created
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">456</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">789</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Additional Info & Social Links */}
            <div className="mt-6 flex flex-col md:flex-row gap-6">
              <div className="text-sm text-muted-foreground">
                <p>
                  Email:{" "}
                  <span className="text-foreground">
                    {profile.email || "N/A"}
                  </span>
                </p>
                <p>
                  Joined:{" "}
                  <span className="text-foreground">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                {profile.socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${profile.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6 text-indigo-400 hover:text-indigo-500 transition-colors" />
                  </a>
                )}
                {profile.socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-6 h-6 text-indigo-400 hover:text-indigo-500 transition-colors" />
                  </a>
                )}
                {profile.socialLinks?.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link2 className="w-6 h-6 text-indigo-400 hover:text-indigo-500 transition-colors" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-card to-muted/20 rounded-2xl shadow-lg border border-border p-6"
        >
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4 sm:my-10">
            <p className="text-muted-foreground">
              Completed 5 tasks today -{" "}
              <span className="text-foreground">+25 points</span>
            </p>
            <p className="text-muted-foreground">
              Created a new automation workflow -{" "}
              <span className="text-foreground">+50 points</span>
            </p>
            <p className="text-muted-foreground">
              Invited a team member -{" "}
              <span className="text-foreground">+10 points</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Profile Update Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-card to-muted/20 text-foreground border border-border rounded-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="fullName"
              control={control}
              rules={{ required: "Full Name is required" }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    {...field}
                    placeholder="Enter your full name"
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
                  <label className="block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <Input
                    {...field}
                    placeholder="Enter your bio"
                    className="bg-input border-border text-foreground shadow-inner"
                  />
                </div>
              )}
            />
            <Controller
              name="instagram"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Instagram
                  </label>
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
                  <label className="block text-sm font-medium text-foreground">
                    Twitter
                  </label>
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
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Website
                  </label>
                  <Input
                    {...field}
                    placeholder="Your website"
                    className="bg-input border-border text-foreground shadow-inner"
                  />
                </div>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsProfileDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <LoadingButton
                loading={isLoading}
                disabled={!isDirty}
                type="submit"
                className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                Save Changes
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-card to-muted/20 text-foreground border border-border rounded-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Update Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative flex justify-center">
              <Image
                alt="User Avatar"
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : profile.profilePic || userAvatar
                }
                width={200}
                height={200}
                className="w-48 h-48 rounded-full border border-border object-cover shadow-md"
              />
              <label
                htmlFor="profileImage"
                className="absolute bottom-4 right-4 bg-indigo-500 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-600 transition shadow-md"
              >
                <CameraIcon className="w-5 h-5" />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => handleImageChange(e, "profile")}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsImageDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <LoadingButton
                loading={imageLoading}
                disabled={!selectedImage}
                onClick={() => handleImageUpload("profile")}
                className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                Upload
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Photo Upload Dialog */}
      <Dialog open={isCoverDialogOpen} onOpenChange={setIsCoverDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-card to-muted/20 text-foreground border border-border rounded-2xl max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Update Cover Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative flex justify-center">
              <Image
                alt="Cover Photo"
                src={
                  selectedCover
                    ? URL.createObjectURL(selectedCover)
                    : profile.coverPic || coverPlaceholder
                }
                width={400}
                height={150}
                className="w-full h-40 object-cover rounded-md border border-border shadow-md"
              />
              <label
                htmlFor="coverImage"
                className="absolute bottom-4 right-4 bg-indigo-500 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-600 transition shadow-md"
              >
                <CameraIcon className="w-5 h-5" />
                <input
                  type="file"
                  id="coverImage"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => handleImageChange(e, "cover")}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsCoverDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <LoadingButton
                loading={coverLoading}
                disabled={!selectedCover}
                onClick={() => handleImageUpload("cover")}
                className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                Upload
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
