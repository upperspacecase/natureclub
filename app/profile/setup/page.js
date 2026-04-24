"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/useAuth";
import apiClient from "@/libs/api";

export default function ProfileEdit() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setUsername(user.username || "");
    setBio(user.bio || "");
    setPhotoUrl(user.photoUrl || "");
  }, [user]);

  const isNewUser = !user?.username;

  async function handlePhotoUpload(file) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      setPhotoUrl(url);
    } catch (ex) {
      setError(ex?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;

    setSaving(true);
    setError("");

    try {
      const body = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
      };
      if (photoUrl !== (user?.photoUrl || "")) body.photoUrl = photoUrl;

      await apiClient.patch("/user", body);
      router.replace(`/profile/${username.trim().toLowerCase()}`);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "That username may be taken. Try another."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <span className="text-white/30">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-12">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-white/60 hover:text-white/90"
          >
            Cancel
          </button>
          <span className="text-xs uppercase tracking-widest text-white/45">
            {isNewUser ? "Set up profile" : "Edit profile"}
          </span>
          <div className="w-12" />
        </div>

        <h1 className="mb-2 font-serif text-3xl italic text-white">
          {isNewUser ? "Set up your profile" : "Edit your profile"}
        </h1>
        <p className="mb-8 text-sm text-white/50">
          {isNewUser
            ? "Choose a username so people can find you on Nature Club."
            : "Update how you show up on Nature Club."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Photo
            </label>
            <div className="flex items-center gap-4">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover border border-white/15"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-white/40">
                  No photo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[6px] border border-white/35 bg-white/[0.04] px-4 py-2 text-sm text-white hover:border-white/70 disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-xs text-white/50 hover:text-white/80 text-left"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="Your name"
              className="w-full rounded-[6px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/70"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-0 rounded-[6px] border border-white/35 bg-white/[0.04] overflow-hidden focus-within:border-white/70">
              <span className="pl-4 text-sm text-white/40">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 30)
                  )
                }
                placeholder="yourname"
                className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder-white/40 outline-none"
                autoFocus={isNewUser}
              />
            </div>
            <p className="mt-1 text-xs text-white/30">
              Letters, numbers, underscores, and periods only
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Bio <span className="text-white/30">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Tell people a bit about yourself…"
              className="w-full resize-none rounded-[6px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/70"
            />
            <p className="mt-1 text-xs text-white/30 text-right">
              {bio.length} / 200
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving || !username.trim()}
            className="w-full rounded-xl bg-white py-4 text-base font-semibold text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : isNewUser ? "Continue" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
