"use client";
import { useState, useEffect } from "react";
import { LampComponent } from "@/components/Global/lamp";
import { useSession } from "../SessionProvider";
import Image from "next/image";
import userAvatar from "@/assets/UserAvatar.png";
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
import { CardStack } from "@/components/card-stack";
import { CameraIcon, LoaderCircle } from "lucide-react";
import axios from "axios";

const FacebookDataFetcher: React.FC = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
  });

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

  const CARDS = [
    {
      id: 0,
      name: isLoading ? "Anonymous" : user?.fullName || "Anonymous",
      designation: "About You",
      content: (
        <>
          {isLoading ? (
            <div className="flex justify-between items-center gap-x-2">
              <LoaderCircle className="animate-spin repeat-infinite text-muted-foreground" />
              <p className="text-center text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <p>
              Your name is <Highlight>{user?.fullName}</Highlight> and username
              is <Highlight>{user?.username}</Highlight>. Your email is{" "}
              <Highlight>{user?.email}</Highlight>. You created this account at{" "}
              <Highlight>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "N/A"}
                .
              </Highlight>
            </p>
          )}
        </>
      ),
    },
    {
      id: 1,
      name: isLoading ? "" : user?.fullName || "Anonymous",
      designation: "Bio",
      content: (
        <>
          {isLoading ? (
            <div className="flex justify-between items-center gap-x-2">
              <LoaderCircle className="animate-spin repeat-infinite text-muted-foreground" />
              <p className="text-center text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <p>
              Your bio goes as <Highlight>{user?.bio}</Highlight>
            </p>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    setInitialData({
      fullName: user?.fullName || "",
      bio: user?.bio || "",
    });
  }, [user]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const api = "/api/auth/profile/updateProfile";
      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData = await res.json();
        toast({
          title: "Profile updated",
          description: resData.message,
          variant: "default",
        });
        toast({
          title: "Notifications",
          description:
            "We are using cache for memory so kindly refresh the page for changes.",
          variant: "default",
        });
        setIsProfileDialogOpen(false);
      } else {
        const errorData = await res.json();
        toast({
          title: "Error updating profile",
          description: errorData.message || "Something went wrong.",
          variant: "destructive", // Changed to destructive
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive", // Changed to destructive
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setImageLoading(true);
      const file = e.target.files?.[0];

      if (!file) {
        throw new Error("No file selected");
      }

      // File type validation
      const validTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please select a PNG, JPG, or JPEG file."
        );
      }

      // File size validation (5MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        toast({
          description:
            "File size exceeds the 5MB limit. Please select a smaller file.",
          variant: "destructive",
        });
        throw new Error(
          "File size exceeds the 5MB limit. Please select a smaller file."
        );
      }

      setSelectedImage(file);
    } catch (error) {
      toast({
        description: (error as Error).message || "Error processing the image.",
        variant: "destructive", // Error toast
      });
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast({
        description: "No image selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageLoading(true);

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

      const base64Image = await toBase64(selectedImage);
      const response = await axios.put("/api/auth/profile/updateProfileImage", {
        profilePic: base64Image,
      });

      if (response.status === 200) {
        toast({
          description: response.data.message,
          variant: "default",
        });
        toast({
          title: "Profile Image",
          description: response.data.message,
          variant: "default",
        });
        toast({
          title: "Notifications",
          description:
            "We are using cache for memory, so kindly refresh the page for changes.",
          variant: "default",
        });
        setIsImageDialogOpen(false);
      } else {
        throw new Error("Failed to upload profile picture.");
      }
    } catch (error) {
      toast({
        description:
          (error as Error).message || "Failed to upload profile picture.",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  const isSaveDisabled = !isDirty;

  return (
    <div className="container mx-auto my-10 px-4">
      <div className="relative -mt-[40px] md:-mt-[100px]">
        <LampComponent
          text1={user?.username || "Anonymous"}
          text2={user?.fullName || "Anonymous"}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 -mt-[250px] md:-mt-[200px]">
        <div className="flex items-center justify-center gap-x-3 ">
          <Image
            alt="User Avatar"
            src={user?.profilePic ? user.profilePic : userAvatar}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full border object-cover border-gray-300 z-50 cursor-pointer"
            onClick={() => setIsImageDialogOpen(true)}
          />
          <CardStack items={CARDS} />
        </div>

        <div className="z-50 flex justify-end">
          <Button onClick={() => setIsProfileDialogOpen(true)}>
            Update Profile
          </Button>
        </div>
      </div>

      {/* Profile Update Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="mx-1">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-2 md:gap-4">
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "Full Name is required" }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input {...field} placeholder="Enter your full name" />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm">
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
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <Input {...field} placeholder="Enter your bio" />
                  </div>
                )}
              />
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsProfileDialogOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <LoadingButton
                loading={isLoading}
                disabled={isSaveDisabled}
                type="submit"
              >
                Save Changes
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Click Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="mx-1">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col justify-center ">
            <div className="relative flex justify-center items-center">
              <div className="relative">
                <Image
                  alt="User Avatar"
                  src={user?.profilePic ? user.profilePic : userAvatar}
                  width={150}
                  height={400}
                  className="w-[10rem] h-[10rem] rounded-full border object-cover border-gray-300 z-50 cursor-pointer"
                />
                <div className="absolute bottom-[23px] right-[8px] rounded-full">
                  <input
                    type="file"
                    className="hidden"
                    id="profileImage"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      document.getElementById("profileImage")?.click()
                    }
                    disabled={imageLoading}
                  >
                    <CameraIcon />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <LoadingButton
                loading={imageLoading}
                disabled={!selectedImage}
                onClick={handleImageUpload}
              >
                Upload Image
              </LoadingButton>
              <Button
                variant="outline"
                onClick={() => setIsImageDialogOpen(false)}
                type="button"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacebookDataFetcher;
