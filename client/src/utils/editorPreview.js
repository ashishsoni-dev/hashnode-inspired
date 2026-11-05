export const EDITOR_PREVIEW_KEY = "hashnode-editor-preview-v1";

export function writeEditorPreview(data) {
    try {
        localStorage.setItem(
            EDITOR_PREVIEW_KEY,
            JSON.stringify(data)
        );

        return true;
    } catch {
        return false;
    }
}

export function readEditorPreview() {
    try {
        const saved = localStorage.getItem(EDITOR_PREVIEW_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}