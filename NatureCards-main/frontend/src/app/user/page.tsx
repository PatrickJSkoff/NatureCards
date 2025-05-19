"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile, deleteUserAccount } from "@/lib/users";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { signOut } from "next-auth/react";

import bgDesktop from "@/app/images/bg-desktop.png";
import bgMobile from "@/app/images/bg-mobilev2.png";
import { userState } from "@/lib/gallery";

export default function UserSettings() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewPic, setPreviewPic] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({ username, password, profilePic });
      setFeedback({
        type: "success",
        title: "Saved",
        message: "Your changes have been saved.",
      });
      setTimeout(() => setFeedback(null), 5000);
      //add update logic/ save logic
    } catch {
      setFeedback({
        type: "error",
        title: "Failed",
        message: "Could not update your profile.",
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserAccount();
      // setFeedback({
      //   type: "success",
      //   title: "Deleted",
      //   message: "Your account has been deleted.",
      // });
      setDeleteDialogOpen(false);
      //Change to proper route and update database/states
      router.push("./login");
    } catch {
      setFeedback({
        type: "error",
        title: "Failed",
        message: "Could not delete account.",
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const signUserOutAndClearUserId = () => {
    signOut({ callbackUrl: '/' });
    userState.clearUserId();
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <style jsx>{`
        .background-wrapper {
          background-image: url(${bgMobile.src});
        }
        @media (min-width: 640px) {
          .background-wrapper {
            background-image: url(${bgDesktop.src});
          }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      <div className="background-wrapper absolute inset-0 bg-cover bg-no-repeat bg-center flex items-center justify-center px-4">
        <div className="glass-card w-full max-w-xl px-6 py-6 rounded-xl border border-white/30 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">User Settings</h1>

          {/* Avatar + upload */}
          <div className="relative w-24 h-24 mx-auto group mb-6">
            <Avatar className="w-full h-full">
              <AvatarImage
                src={
                  previewPic ||
                  "https://www.shutterstock.com/image-vector/profile-default-avatar-icon-user-600nw-2463844171.jpg"
                }
                className="rounded-full object-cover"
                alt="profile picture"
              />
            </Avatar>
            <label
              htmlFor="profilePicUpload"
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition cursor-pointer"
            >
              Change
            </label>
            <input
              id="profilePicUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          {/* Buttons */}
          <div className="justify-end flex gap-2 mt-6">
            <Button className="hover:bg-gray-700" onClick={handleSave}>
              Save Changes
            </Button>

            <Button className="hover:bg-gray-700" onClick={signUserOutAndClearUserId}>
              Sign Out
            </Button>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hover:bg-red-400" variant="destructive">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-lg font-semibold mb-2">Are you sure?</h2>
                <p className="mb-4">This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <Button
                    className="hover:bg-gray-200"
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="hover:bg-red-400"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Confirm Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="mt-6">
              <FeedbackAlert
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
