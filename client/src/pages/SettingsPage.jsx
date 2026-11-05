
import { useState } from "react";
import { Link } from "react-router-dom";
import { updateMyProfile } from "../api/usersApi";
import { useAuth } from "../hooks/useAuth";
import { uploadImage } from "../api/uploadsApi";

function SettingsPage() {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");

    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    async function handleAvatarUpload(event) {
        const fileInput = event.currentTarget;
        const selectedFile = fileInput.files?.[0];

        if (!selectedFile) return;

        setError("");
        setFeedback("");
        setIsUploadingAvatar(true);

        try {
            const uploadedUrl = await uploadImage(selectedFile, "avatar");

            setAvatarUrl(uploadedUrl);
            setFeedback(
                "Avatar uploaded. Save settings to apply it to your profile."
            );
        } catch (uploadError) {
            const message =
                uploadError.response?.data?.error?.message ||
                uploadError.response?.data?.message;

            setError(
                message ||
                "Could not upload your avatar. Please check your connection and try again."
            );
        } finally {
            setIsUploadingAvatar(false);
            fileInput.value = "";
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setFeedback("");

        const cleanName = name.trim();
        const cleanBio = bio.trim();
        const cleanAvatarUrl = avatarUrl.trim();

        if (!cleanName) {
            setError("Name is required.");
            return;
        }

        if (cleanBio.length > 200) {
            setError("Bio must be 200 characters or fewer.");
            return;
        }

        if (cleanAvatarUrl) {
            try {
                const parsedUrl = new URL(cleanAvatarUrl);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Invalid URL");
                }
            } catch {
                setError("Please enter a valid HTTP or HTTPS avatar URL.");
                return;
            }
        }

        setIsSaving(true);

        try {
            const updatedUser = await updateMyProfile({
                name: cleanName,
                bio: cleanBio,
                avatarUrl: cleanAvatarUrl,
            });

            updateUser(updatedUser);
            setFeedback("Settings saved successfully.");
        } catch (saveError) {
            const message =
                saveError.response?.data?.error?.message ||
                saveError.response?.data?.message;

            setError(
                message ||
                "Could not save your settings. Please check your connection and try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h1>Settings</h1>
                <p>Manage your public profile information.</p>
            </header>

            <form
                className="settings-form"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="settings-form__field">
                    <label htmlFor="settings-name">
                        Display name
                    </label>

                    <input
                        id="settings-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={80}
                        required
                    />
                </div>

                <div className="settings-form__field">
                    <label htmlFor="settings-bio">
                        Bio
                    </label>

                    <textarea
                        id="settings-bio"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        maxLength={200}
                        rows={4}
                    />

                    <small>{bio.length}/200 characters</small>
                </div>

                <div className="settings-form__field">
                    <label htmlFor="settings-avatar">
                        Profile photo
                    </label>

                    <div className="settings-form__upload">
                        <input
                            id="settings-avatar"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                        />

                        <small>
                            Choose a JPG, PNG, WEBP or GIF image.
                            Maximum size: 5 MB.
                        </small>
                    </div>
                </div>

                {avatarUrl.trim() && (
                    <div className="settings-form__avatar-preview">
                        <img
                            src={avatarUrl.trim()}
                            alt="Profile photo preview"
                        />

                        <span>Current profile photo</span>
                    </div>
                )}

                {isUploadingAvatar && (
                    <p
                        className="settings-form__upload-status"
                        role="status"
                    >
                        Uploading profile photo...
                    </p>
                )}

                {error && (
                    <p
                        className="settings-form__feedback settings-form__feedback--error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {feedback && (
                    <p
                        className="settings-form__feedback settings-form__feedback--success"
                        role="status"
                    >
                        {feedback}
                    </p>
                )}

                <div className="settings-form__actions">
                    <button
                        type="submit"
                        disabled={isSaving || isUploadingAvatar}
                    >
                        {isSaving ? "Saving..." : "Save settings"}
                    </button>

                    <Link to="/dashboard">
                        Back to dashboard
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default SettingsPage;
