import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  isDark: boolean;
}

export function MarkdownMessage({ content, isDark }: MarkdownMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');

          return !inline && match ? (
            <div className="relative group">
              <button
                onClick={() => handleCopyCode(code)}
                className="absolute right-2 top-2 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/75 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy code"
              >
                {copiedCode === code ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                className="rounded-md !my-4"
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`${className} bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded`} {...props}>
              {children}
            </code>
          );
        },
        // Style other markdown elements
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 mb-4 italic">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}