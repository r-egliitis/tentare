import { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ProfileDetails {
  username: string;
}

// Accepts anything with the required id, defaulting missing/invalid
// optional fields rather than rejecting — same convention as
// normalizeDeck/normalizeCard in data/storage.ts.
function normalizeProfile(raw: unknown): Profile | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;

  return {
    id: r.id,
    username: typeof r.username === "string" ? r.username : "",
    avatarUrl: typeof r.avatar_url === "string" ? r.avatar_url : null,
  };
}

// One row per signed-in user, extending auth.users. Loads on mount; if no
// row exists yet (first visit — there's no DB trigger, matching this
// project's "skip SQL trigger machinery" convention from useDecks.ts),
// lazily upserts an empty one. Mirrors useDecks.ts's shape, with one
// deliberate deviation: uploadAvatar is awaited rather than fire-and-forget
// optimistic, because there's no locally-known value to optimistically set
// until Supabase Storage returns the uploaded file's public URL.
export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;

      if (error) {
        console.error("Failed to load profile.", error);
        setLoading(false);
        return;
      }
      if (data) {
        setProfile(normalizeProfile(data));
        setLoading(false);
        return;
      }

      // No row yet — lazily create one. upsert (not insert) so a
      // concurrent tab racing to create the same first-ever row doesn't
      // surface a spurious unique-violation error.
      const { data: created, error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: userId, username: "", avatar_url: null }, { onConflict: "id" })
        .select()
        .single();
      if (cancelled) return;
      if (upsertError) {
        console.error("Failed to create profile.", upsertError);
      } else {
        setProfile(normalizeProfile(created));
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function updateProfile(values: ProfileDetails) {
    if (!profile) return;
    setProfile({ ...profile, ...values });
    void supabase
      .from("profiles")
      .update({ username: values.username, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) console.error("Failed to update profile.", error);
      });
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    const path = `${userId}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      console.error("Failed to upload avatar.", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust: the object key never changes on re-upload, so without a
    // changing query string a browser/CDN could keep serving the old image.
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (updateError) {
      console.error("Failed to save avatar URL.", updateError);
      return null;
    }

    setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
    return avatarUrl;
  }

  return { profile, loading, updateProfile, uploadAvatar };
}
