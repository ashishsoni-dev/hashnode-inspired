import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";

import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("json", json);

function MarkdownPreview({ content }) {
    if (!content.trim()) {
        return (
            <div className="markdown-preview__placeholder">
                <p>Your live preview will appear here.</p>
                <span>Start writing Markdown to see your article take shape.</span>
            </div>
        );
    }

    return (
        <div className="markdown-preview">
            <ReactMarkdown
                components={{
                    code({ children, className, ...props }) {
                        const match = /language-([\w-]+)/.exec(
                            className || ""
                        );

                        if (!match) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }

                        const language = match[1].toLowerCase();
                        const code = String(children).replace(/\n$/, "");

                        const supportedLanguages = [
                            "javascript",
                            "jsx",
                            "css",
                            "markup",
                            "html",
                            "json",
                        ];

                        if (supportedLanguages.includes(language)) {
                            return (
                                <SyntaxHighlighter
                                    language={
                                        language === "html" ? "markup" : language
                                    }
                                    style={oneDark}
                                    PreTag="div"
                                    wrapLongLines
                                >
                                    {code}
                                </SyntaxHighlighter>
                            );
                        }

                        return (
                            <pre className="markdown-preview__code-block">
                                <code>{code}</code>
                            </pre>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default MarkdownPreview;