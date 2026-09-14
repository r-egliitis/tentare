import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useProfile } from "../hooks/useProfile";
import styles from "./ProfilePage.module.css";

interface ProfilePageProps {
  user: User;
  onBack: () => void;
}

export function ProfilePage({ user, onBack }: ProfilePageProps) {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile(user.id);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  // profile arrives asynchronously (and may be lazily created on first
  // visit) — seed the editable field once it shows up. Depends on
  // profile?.id (stable once set), not the whole profile object: profile
  // is a new object reference on every mutation (including the avatar
  // upload below), and re-seeding on every change would silently discard
  // an in-progress, unsaved username edit if an avatar is uploaded first.
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setInitialUsername(profile.username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const isDirty = username !== initialUsername;

  function handleEditProfile() {
    setIsEditing(true);
  }

  function handleCancel() {
    if (isDirty && !window.confirm("Discard your changes?")) return;
    setUsername(initialUsername);
    setError(null);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("A username is required.");
      return;
    }
    updateProfile({ username: trimmed });
    setUsername(trimmed);
    setInitialUsername(trimmed);
    setError(null);
    setIsEditing(false);
  }

  function handleAvatarClick() {
    setAvatarError(null);
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError(null);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (!url) setAvatarError("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }
  }

  if (loading) {
    return <p>Loading profile…</p>;
  }

  const avatarSrc = avatarPreview ?? profile?.avatarUrl ?? null;

  return (
    <>
      <div className={styles.avatarRow}>
        {avatarSrc ? (
          <img className={styles.avatar} src={avatarSrc} alt="Profile avatar" />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {(username || user.email || "?").charAt(0).toUpperCase()}
          </div>
        )}
        {isEditing && (
          <div>
            <button type="button" onClick={handleAvatarClick} disabled={avatarUploading}>
              {avatarUploading ? "Uploading…" : "Change avatar"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
            {avatarError && <p className={styles.error}>{avatarError}</p>}
          </div>
        )}
      </div>

      {isEditing ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="profile-username">Username</label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="profile-email">Email</label>
            <p id="profile-email">{user.email}</p>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="submit">Save</button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.form}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Username</span>
            <p>{profile?.username || "—"}</p>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <p>{user.email}</p>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {!isEditing && (
          <>
            <button type="button" onClick={handleEditProfile}>
              Edit Profile
            </button>
            {/* Placeholder — no settings exist yet. */}
            <button type="button" onClick={() => {}}>
              Settings
            </button>
          </>
        )}
        <button type="button" onClick={onBack}>
          ← Back to Quizzes
        </button>
      </div>
    </>
  );
}
