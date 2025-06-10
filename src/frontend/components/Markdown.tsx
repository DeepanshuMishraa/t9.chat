import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return isInline ? (
            <code {...props} className="rounded px-1 py-0.5 bg-muted-foreground/20">
              {children}
            </code>
          ) : (
            <div className="rounded-md overflow-hidden">
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="!my-0"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          );
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal pl-4 mb-4 last:mb-0">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-primary/50 pl-4 italic">{children}</blockquote>
        },
        a({ children, href }) {
          return <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">{children}</a>
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">{children}</table>
            </div>
          )
        }
      }}
    >
      {content}
    </Markdown>
  )
}
