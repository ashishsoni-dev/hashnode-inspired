import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";

import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("diff", diff);

const SUPPORTED_LANGUAGES = [
    "javascript",
    "jsx",
    "css",
    "markup",
    "html",
    "json",
    "typescript",
    "tsx",
    "python",
    "bash",
    "sql",
    "yaml",
    "markdown",
    "diff",
];

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
                        const match = /language-([\w-]+)/.exec(className || "");

                        if (!match) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }

                        const language = match[1].toLowerCase();
                        const code = String(children).replace(/\n$/, "");

                        if (SUPPORTED_LANGUAGES.includes(language)) {
                            return (
                                <SyntaxHighlighter
                                    language={language === "html" ? "markup" : language}
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
