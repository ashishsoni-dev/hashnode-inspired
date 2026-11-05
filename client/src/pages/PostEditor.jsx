
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPost, getMyPostById, updatePost } from "../api/postsApi";
import { getErrorMessage } from "../api/axios";
import { getPostTags } from "../utils/postTags";
import { writeEditorPreview } from "../utils/editorPreview";
import { uploadImage } from "../api/uploadsApi";
import MarkdownPreview from "../components/editor/MarkdownPreview";

function getTagNames(value) {
    const uniqueTags = new Map();

    value.split(",").forEach((tag) => {
        const cleanName = tag.trim();

        if (cleanName) {
            uniqueTags.set(cleanName.toLowerCase(), cleanName);
        }
    });

    return [...uniqueTags.values()];
}

function PostEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [error, setError] = useState("");

    // Controls the mobile Write and Preview tabs.
    const [mobileEditorView, setMobileEditorView] = useState("write");

    const previewTags = getTagNames(tagsInput);

    useEffect(() => {
        writeEditorPreview({ title, content, coverImage, tagsInput });
    }, [title, content, coverImage, tagsInput]);

    async function handleCoverUpload(event) {
        const fileInput = event.currentTarget;
        const selectedFile = fileInput.files?.[0];

        if (!selectedFile) return;

        setError("");
        setIsUploadingCover(true);

        try {
            const uploadedUrl = await uploadImage(selectedFile, "cover");
            setCoverImage(uploadedUrl);
        } catch (uploadError) {
            setError(
                uploadError.response?.data?.error?.message ||
                uploadError.response?.data?.message ||
                "Could not upload the cover image. Please try again."
            );
        } finally {
            setIsUploadingCover(false);
            fileInput.value = "";
        }
    }

    useEffect(() => {
        if (!id) return undefined;

        let isCurrent = true;

        async function loadArticle() {
            try {
                const post = await getMyPostById(id);

                if (isCurrent) {
                    setTitle(post.title || "");
                    setContent(post.content || "");
                    setCoverImage(post.coverImage || post.thumbnail || "");
                    setTagsInput(
                        getPostTags(post).map((tag) => tag.name).join(", ")
                    );
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(
                        getErrorMessage(
                            loadError,
                            "Could not load this article."
                        )
                    );
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadArticle();

        return () => {
            isCurrent = false;
        };
    }, [id]);

    async function handleSave(status) {
        setError("");

        const cleanTitle = title.trim();
        const cleanContent = content.trim();
        const cleanCoverImage = coverImage.trim();
        const tags = getTagNames(tagsInput);

        if (status === "published") {
            if (!cleanTitle) {
                return setError(
                    "Please enter an article title before publishing."
                );
            }

            if (!cleanContent) {
                return setError(
                    "Please write your article content before publishing."
                );
            }

            if (!cleanCoverImage) {
                return setError(
                    "Please upload a cover image before publishing."
                );
            }

            if (!tags.length) {
                return setError(
                    "Add at least one tag before publishing."
                );
            }
        }

        if (cleanCoverImage) {
            try {
                const imageUrl = new URL(cleanCoverImage);

                if (!["http:", "https:"].includes(imageUrl.protocol)) {
                    throw new Error("Invalid URL");
                }
            } catch {
                return setError(
                    "The uploaded cover image URL is invalid. Please upload the image again."
                );
            }
        }

        setIsSaving(true);

        try {
            const articleDetails = {
                title: cleanTitle,
                content,
                coverImage: cleanCoverImage,
                tags,
                status,
            };

            if (id) {
                await updatePost(id, articleDetails);
            } else {
                await createPost(articleDetails);
            }

            navigate("/dashboard", {
                state: {
                    editorFeedback: status === "draft"
                        ? "Draft saved successfully."
                        : "Article published successfully.",
                },
            });
        } catch (saveError) {
            setError(
                getErrorMessage(
                    saveError,
                    "Unable to save this article. Please try again."
                )
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="container post-editor-page">
                <p role="status">Loading your article...</p>
            </div>
        );
    }

    if (isEditing && error && !title && !content) {
        return (
            <div className="container post-editor-page">
                <h1>Article unavailable</h1>
                <p role="alert">{error}</p>
                <Link to="/dashboard">Back to dashboard</Link>
            </div>
        );
    }

    return (
        <div className="container post-editor-page">
            <header className="post-editor__header">
                <div>
                    <p className="post-editor__eyebrow">
                        PUBLISHING WORKSPACE
                    </p>

                    <h1>{isEditing ? "Edit article" : "Write an article"}</h1>

                    <p>
                        Write in Markdown and preview your article as you work.
                    </p>
                </div>

                <div className="post-editor__header-actions">
                    <button
                        type="button"
                        className="post-editor__desktop-preview-action"
                        onClick={() =>
                            window.open(
                                "/editor/preview",
                                "_blank",
                                "noopener,noreferrer"
                            )
                        }
                    >
                        Open live preview ↗
                    </button>

                    <Link to="/dashboard">
                        Back to dashboard
                    </Link>
                </div>
            </header>

            {error && (
                <p className="post-editor__error" role="alert">
                    {error}
                </p>
            )}

            <form
                className="post-editor__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <label className="post-editor__field">
                    Article title

                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={180}
                        placeholder="Give your article a clear title"
                    />
                </label>

                <div className="post-editor__field">
                    <label htmlFor="post-cover-upload">
                        Cover image
                    </label>

                    <input
                        id="post-cover-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleCoverUpload}
                        disabled={isUploadingCover}
                    />

                    <small>
                        Upload a JPG, PNG, WEBP or GIF image. Maximum size: 5 MB.
                    </small>

                    {isUploadingCover && (
                        <small role="status">
                            Uploading cover image...
                        </small>
                    )}

                    {coverImage && (
                        <div className="post-editor__cover-preview">
                            <img
                                src={coverImage}
                                alt="Article cover preview"
                            />
                            <span>Cover image ready</span>
                        </div>
                    )}
                </div>

                <label className="post-editor__field">
                    Tags

                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(event) => setTagsInput(event.target.value)}
                        placeholder="javascript, react, web development"
                    />

                    <small>
                        Separate tags with commas. You can create new tags while writing.
                    </small>
                </label>

                {/* Mobile Write and Preview tabs */}
                <div
                    className="post-editor__mobile-tabs"
                    role="group"
                    aria-label="Editor view"
                >
                    <button
                        type="button"
                        className={mobileEditorView === "write" ? "is-active" : ""}
                        aria-pressed={mobileEditorView === "write"}
                        onClick={() => setMobileEditorView("write")}
                    >
                        Write
                    </button>

                    <button
                        type="button"
                        className={mobileEditorView === "preview" ? "is-active" : ""}
                        aria-pressed={mobileEditorView === "preview"}
                        onClick={() => setMobileEditorView("preview")}
                    >
                        Preview
                    </button>
                </div>

                <div
                    className={`post-editor__markdown-workspace post-editor__markdown-workspace--${mobileEditorView}`}
                >
                    <label className="post-editor__field post-editor__markdown-field">
                        Article content (Markdown)

                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            rows={18}
                            placeholder={"# Your article title\n\nStart writing your ideas here..."}
                        />
                    </label>

                    {/* Live preview for mobile */}
                    <section
                        className="post-editor__live-preview"
                        aria-label="Live article preview"
                    >
                        <article className="editor-preview">
                            {coverImage && (
                                <img
                                    className="editor-preview__cover"
                                    src={coverImage}
                                    alt={title ? `${title} cover` : "Article cover"}
                                />
                            )}

                            <header className="editor-preview__header">
                                <h1>{title || "Your article title"}</h1>

                                {previewTags.length > 0 && (
                                    <div
                                        className="editor-preview__tags"
                                        aria-label="Article tags"
                                    >
                                        {previewTags.map((tag) => (
                                            <span key={tag.toLowerCase()}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </header>

                            <MarkdownPreview content={content} />
                        </article>
                    </section>
                </div>

                <div className="post-editor__actions">
                    <button
                        type="button"
                        onClick={() => handleSave("draft")}
                        disabled={isSaving || isUploadingCover}
                    >
                        {isSaving
                            ? "Saving..."
                            : isUploadingCover
                                ? "Uploading image..."
                                : "Save draft"}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSave("published")}
                        disabled={isSaving || isUploadingCover}
                    >
                        {isSaving
                            ? "Saving..."
                            : isUploadingCover
                                ? "Uploading image..."
                                : "Publish article"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostEditor;
