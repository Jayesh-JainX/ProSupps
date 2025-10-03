"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    fetchProfile();
  }, []);

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }

      setUser(profile);
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(file: File): Promise<string | null> {
    try {
      if (!user) return null;

      setUploadingAvatar(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete old avatar if exists
      if (user.avatar_url && user.avatar_url.includes("user-avatars")) {
        const oldPath = user.avatar_url.split("/user-avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("user-avatars").remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await handleAvatarUpload(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
      setAvatarPreview("");
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(`Failed to update profile: ${error || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar file size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setAvatarFile(file);
      setError("");
    }
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData({ ...formData, avatar_url: "" });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading profile...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <p className="text-red-500">Failed to load user profile</p>
              <Button onClick={fetchProfile} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div data-aos="fade-up" className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Profile Settings
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900 dark:text-green-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div data-aos="fade-up" className="lg:col-span-1">
              <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>

                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {avatarPreview || formData.avatar_url ? (
                      <Image
                        src={avatarPreview || formData.avatar_url}
                        alt="Profile Avatar"
                        width={120}
                        height={120}
                        className="h-30 w-30 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        unoptimized
                      />
                    ) : (
                      <div className="h-30 w-30 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                        <svg
                          className="h-12 w-12 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-medium">
                    {formData.full_name || "No name set"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <Badge
                    className={`mt-2 ${getRoleColor(user.role || "user")}`}
                  >
                    {user.role?.toUpperCase() || "USER"}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      User ID:
                    </span>
                    <p className="text-gray-500 dark:text-gray-400 break-all">
                      {`p-${user.id.slice(0, 8)}`}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Member Since:
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Last Updated:
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div data-aos="fade-up" className="lg:col-span-2">
              <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <Label
                      htmlFor="full_name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1 bg-gray-50 dark:bg-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed from this page
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="avatar"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Profile Avatar
                    </Label>
                    <div className="mt-1 space-y-3">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload a new avatar image (max 5MB). Supported formats:
                        JPG, PNG, WEBP, GIF
                      </p>

                      {(avatarPreview || formData.avatar_url) && (
                        <div className="flex items-center space-x-3">
                          <Image
                            src={avatarPreview || formData.avatar_url}
                            alt="Avatar preview"
                            width={60}
                            height={60}
                            className="h-15 w-15 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            unoptimized
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeAvatar}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                          >
                            Remove Avatar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Account Role
                    </Label>
                    <div className="mt-1">
                      <Badge className={getRoleColor(user.role || "user")}>
                        {user.role?.toUpperCase() || "USER"}
                      </Badge>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Contact an administrator to change your role
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="submit"
                      disabled={updating || uploadingAvatar}
                      className="min-w-[120px]"
                    >
                      {updating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : uploadingAvatar ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
