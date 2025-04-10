"use client";
import { useState, useEffect } from "react";
import { useSession } from "../SessionProvider";
import Image from "next/image";
import userAvatar from "@/assets/UserAvatar.png";
import coverPlaceholder from "@/assets/Network-Block.jpeg"; // Add a placeholder cover image
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
import { Highlight } from "@/components/Highlight";
import {
  CameraIcon,
  LoaderCircle,
  Instagram,
  Twitter,
  Link2,
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FacebookDataFetcher: React.FC = () => {
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

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    // Simulate fetching additional user data if needed
  }, [user]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData = await res.json();
        toast({
          title: "Profile Updated",
          description: resData.message,
          variant: "default",
        });
        toast({
          title: "Note",
          description: "Refresh the page to see changes due to caching.",
          variant: "default",
        });
        setIsProfileDialogOpen(false);
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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
      setImageLoading(type === "profile");
      setCoverLoading(type === "cover");
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");

      const validTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Please select a PNG, JPG, or JPEG file.");
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 5MB limit.");
      }

      if (type === "profile") setSelectedImage(file);
      else setSelectedCover(file);
    } catch (error) {
      toast({
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
      setCoverLoading(false);
    }
  };

  const handleImageUpload = async (type: "profile" | "cover") => {
    const image = type === "profile" ? selectedImage : selectedCover;
    if (!image) {
      toast({ description: "No image selected.", variant: "destructive" });
      return;
    }

    try {
      type === "profile" ? setImageLoading(true) : setCoverLoading(true);
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
          : "/api/auth/profile/updateCoverImage"; // Assume this endpoint exists
      const response = await axios.put(endpoint, {
        [type === "profile" ? "profilePic" : "coverPic"]: base64Image,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        toast({
          title: "Note",
          description: "Refresh the page to see changes due to caching.",
          variant: "default",
        });
        type === "profile"
          ? setIsImageDialogOpen(false)
          : setIsCoverDialogOpen(false);
      } else {
        throw new Error(`Failed to upload ${type} picture.`);
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

  const isSaveDisabled = !isDirty;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src={user?.profilePic || coverPlaceholder}
          alt="Cover Photo"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-secondary/80 text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsCoverDialogOpen(true)}
        >
          <CameraIcon className="w-4 h-4 mr-2" />
          Edit Cover
        </Button>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-32">
        <div className="relative flex flex-col items-center md:items-start md:flex-row gap-6">
          {/* Profile Picture */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative group z-10"
          >
            <Image
              alt="User Avatar"
              src={user?.profilePic || userAvatar}
              width={160}
              height={160}
              className="w-40 h-40 rounded-full border-4 border-background object-cover cursor-pointer transition-transform group-hover:scale-105 shadow-lg"
              onClick={() => setIsImageDialogOpen(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon className="text-primary w-10 h-10" />
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 bg-card rounded-lg shadow-lg border border-border p-6 w-full max-w-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isLoading ? "Loading..." : user?.fullName || "Anonymous"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  @{user?.username || "N/A"}
                </p>
                <p className="mt-2 text-foreground">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin text-muted-foreground" />
                      Loading...
                    </span>
                  ) : (
                    user?.bio || "No bio yet."
                  )}
                </p>
              </div>
              <Button
                onClick={() => setIsProfileDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit Profile
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-border pt-4">
              <div>
                <p className="text-lg font-semibold text-foreground">123</p>
                <p className="text-sm text-muted-foreground">Posts</p>
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

            {/* Additional Info */}
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Email: <Highlight>{user?.email || "N/A"}</Highlight>
              </p>
              <p>
                Joined:{" "}
                <Highlight>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </Highlight>
              </p>
            </div>

            {/* Social Links */}
          </div>
        </div>
      </div>

      {/* Profile Update Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-card text-card-foreground border border-border rounded-lg max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <label className="block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <Input
                    {...field}
                    placeholder="Enter your bio"
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
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
                disabled={isSaveDisabled}
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="bg-card text-card-foreground border border-border rounded-lg max-w-md mx-auto">
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
                    : user?.profilePic || userAvatar
                }
                width={200}
                height={200}
                className="w-48 h-48 rounded-full border border-border object-cover shadow-md"
              />
              <label
                htmlFor="profileImage"
                className="absolute bottom-4 right-4 bg-secondary text-secondary-foreground p-3 rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition shadow"
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
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Upload
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Photo Upload Dialog */}
      <Dialog open={isCoverDialogOpen} onOpenChange={setIsCoverDialogOpen}>
        <DialogContent className="bg-card text-card-foreground border border-border rounded-lg max-w-lg mx-auto">
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
                    : user?.profilePic || coverPlaceholder
                }
                width={400}
                height={150}
                className="w-full h-40 object-cover rounded-md border border-border shadow-md"
              />
              <label
                htmlFor="coverImage"
                className="absolute bottom-4 right-4 bg-secondary text-secondary-foreground p-3 rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition shadow"
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
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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

export default FacebookDataFetcher;
