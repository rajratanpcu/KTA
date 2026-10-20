// Safe Text Renderer for AI Chatbot Responses
// Safely converts Markdown formatting (bold, lists, code) into React elements WITHOUT using innerHTML

import React from 'react';

interface ChatSafeTextProps {
  content: string;
}

export const ChatSafeText: React.FC<ChatSafeTextProps> = ({ content }) => {
  // Split content into lines to render paragraphs and lists safely
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  lines.forEach((line, lineIdx) => {
    // Code block toggle (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre
            key={`code-${lineIdx}`}
            className="my-2 p-2.5 rounded bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap"
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Blank line
    if (!line.trim()) {
      elements.push(<div key={`blank-${lineIdx}`} className="h-2" />);
      return;
    }

    // Header 1-3 (### Header)
    if (/^#{1,3}\s+/.test(line)) {
      const headerText = line.replace(/^#{1,3}\s+/, '');
      elements.push(
        <h4 key={`h-${lineIdx}`} className="font-semibold text-gray-900 mt-2 mb-1 text-sm">
          {renderFormattedInline(headerText, `h-${lineIdx}`)}
        </h4>
      );
      return;
    }

    // Bullet point (- or *)
    if (/^\s*[-*•]\s+/.test(line)) {
      const bulletText = line.replace(/^\s*[-*•]\s+/, '');
      elements.push(
        <div key={`li-${lineIdx}`} className="flex items-start gap-2 my-0.5 pl-2 text-xs sm:text-sm">
          <span className="text-primary font-bold select-none">•</span>
          <span className="flex-1">{renderFormattedInline(bulletText, `li-${lineIdx}`)}</span>
        </div>
      );
      return;
    }

    // Numbered list (1. )
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const listText = numberedMatch[2];
      elements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 my-0.5 pl-2 text-xs sm:text-sm">
          <span className="text-primary font-semibold text-xs select-none w-4">{num}.</span>
          <span className="flex-1">{renderFormattedInline(listText, `num-${lineIdx}`)}</span>
        </div>
      );
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${lineIdx}`} className="my-0.5 text-xs sm:text-sm leading-relaxed">
        {renderFormattedInline(line, `p-${lineIdx}`)}
      </p>
    );
  });

  // Flush remaining unclosed code block if any
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <pre
        key="unclosed-code"
        className="my-2 p-2.5 rounded bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap"
      >
        <code>{codeBlockLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5 text-gray-800 break-words">{elements}</div>;
};

/**
 * Parses inline formatting: bold (**text**), inline code (`code`), and currency symbols
 */
function renderFormattedInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Regex splitting by bold (**...**) and inline code (`...`)
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldContent = token.slice(2, -2);
      parts.push(
        <strong key={`${keyPrefix}-b-${tokenIdx++}`} className="font-semibold text-gray-900">
          {boldContent}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeContent = token.slice(1, -1);
      parts.push(
        <code
          key={`${keyPrefix}-c-${tokenIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 text-primary border border-gray-200 text-xs font-mono"
        >
          {codeContent}
        </code>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  // Push remaining trailing plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
