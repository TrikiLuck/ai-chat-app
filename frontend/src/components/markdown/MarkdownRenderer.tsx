import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none"
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          
          return !isInline && match ? (
            <div className="relative">
              <button
                className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                onClick={() => {
                  navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                }}
              >
                Копировать
              </button>
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
