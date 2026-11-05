import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MarkdownPreview from "../components/editor/MarkdownPreview";
import {
    EDITOR_PREVIEW_KEY,
    readEditorPreview,
} from "../utils/editorPreview";

const EMPTY_PREVIEW = {
    title: "",
    content: "",
    coverImage: "",
    tagsInput: "",
};

function EditorPreview() {
    const [preview, setPreview] = useState(
        () => readEditorPreview() ?? EMPTY_PREVIEW
    );

    useEffect(() => {
        function handleStorageChange(event) {
            if (event.key === EDITOR_PREVIEW_KEY) {
                setPreview(readEditorPreview() ?? EMPTY_PREVIEW);
            }
        }

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const tags = (preview.tagsInput || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

    return (
        <div className="container editor-preview-page">
            <header className="editor-preview__toolbar">
                <div>
                    <p>LIVE PREVIEW</p>
                    <span>Unsaved editor content</span>
                </div>

                <Link to="/dashboard">Dashboard</Link>
            </header>

            <article className="editor-preview__article editor-preview">
                {preview.coverImage && (
                    <img
                        className="editor-preview__cover"
                        src={preview.coverImage}
                        alt="Article cover"
                    />
                )}

                <header className="editor-preview__header">
                    <h1>{preview.title || "Your article title"}</h1>

                    {tags.length > 0 && (
                        <div
                            className="editor-preview__tags"
                            aria-label="Article tags"
                        >
                            {tags.map((tag) => (
                                <span key={tag.toLowerCase()}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                <MarkdownPreview content={preview.content || ""} />
            </article>
        </div>
    );
}

export default EditorPreview;