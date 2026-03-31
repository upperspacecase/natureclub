"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/useAuth";
import apiClient from "@/libs/api";

export default function ProfileSetup() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;

    setSaving(true);
    setError("");

    try {
      await apiClient.patch("/user", {
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
      });
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

  // Already has a username — redirect
  if (user?.username) {
    router.replace(`/profile/${user.username}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="mb-2 font-serif text-3xl italic text-white">
          Set up your profile
        </h1>
        <p className="mb-8 text-sm text-white/50">
          Choose a username so people can find you on Nature Club.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
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
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-white/30">
              Letters, numbers, underscores, and periods only
            </p>
          </div>

          {/* Bio */}
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
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving || !username.trim()}
            className="w-full rounded-xl bg-white py-4 text-base font-semibold text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
