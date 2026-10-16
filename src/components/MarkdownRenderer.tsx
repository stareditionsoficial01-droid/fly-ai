import React, { useState } from 'react';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Extract tokens via marked
  let tokens: any[] = [];
  try {
    tokens = marked.lexer(content || '');
  } catch (e) {
    tokens = [{ type: 'paragraph', text: content }];
  }

  return (
    <div className="space-y-3 text-slate-800 dark:text-slate-100 text-[15px] leading-relaxed break-words font-normal">
      {tokens.map((token, index) => (
        <TokenItem key={index} token={token} />
      ))}
    </div>
  );
};

const TokenItem: React.FC<{ token: any }> = ({ token }) => {
  switch (token.type) {
    case 'code':
      return <CodeBlock code={token.text} lang={token.lang} />;

    case 'heading': {
      const HeadingTag = `h${Math.min(token.depth, 4)}` as keyof React.JSX.IntrinsicElements;
      const headingStyles = {
        1: 'text-xl sm:text-2xl font-bold mt-4 mb-2 text-slate-900 dark:text-white',
        2: 'text-lg sm:text-xl font-bold mt-3 mb-1.5 text-slate-900 dark:text-white',
        3: 'text-base sm:text-lg font-semibold mt-2 mb-1 text-slate-900 dark:text-slate-100',
        4: 'text-sm sm:text-base font-semibold mt-2 mb-1 text-slate-900 dark:text-slate-200',
      }[token.depth as 1 | 2 | 3 | 4] || 'text-base font-semibold mt-2 mb-1';

      return (
        <HeadingTag className={headingStyles} dangerouslySetInnerHTML={{ __html: marked.parseInline(token.text) as string }} />
      );
    }

    case 'paragraph':
      return (
        <p
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: marked.parseInline(token.text) as string }}
        />
      );

    case 'list': {
      const ListTag = token.ordered ? 'ol' : 'ul';
      const listClass = token.ordered ? 'list-decimal ml-6 space-y-1.5' : 'list-disc ml-6 space-y-1.5';
      return (
        <ListTag className={listClass}>
          {token.items.map((item: any, i: number) => (
            <li
              key={i}
              className="leading-relaxed pl-1"
              dangerouslySetInnerHTML={{ __html: marked.parseInline(item.text) as string }}
            />
          ))}
        </ListTag>
      );
    }

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 rounded-r-lg my-2">
          <p dangerouslySetInnerHTML={{ __html: marked.parseInline(token.text) as string }} />
        </blockquote>
      );

    case 'table':
      return (
        <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                {token.header.map((col: any, idx: number) => (
                  <th key={idx} className="p-2.5">
                    {col.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {token.rows.map((row: any, rIdx: number) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {row.map((cell: any, cIdx: number) => (
                    <td key={cIdx} className="p-2.5">
                      {cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'hr':
      return <hr className="my-4 border-slate-200 dark:border-slate-800" />;

    default:
      if (token.text) {
        return (
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: marked.parseInline(token.text) as string }}
          />
        );
      }
      return null;
  }
};

const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-slate-800/80 bg-[#0d1117] text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="uppercase font-semibold tracking-wider text-[11px] text-blue-400">
          {lang || 'código'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
