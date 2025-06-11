import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (e: any) => {
    setLoading(false);
    setError(true);
  };

  if (!src || src.trim() === '') {
    return null;
  }

  return (
    <div className="relative w-full max-w-lg mx-auto my-4">
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading image...</span>
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">Failed to load image</p>
          <p className="text-xs text-muted-foreground mt-1">{alt}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-auto rounded-lg shadow-md transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          style={{ display: loading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = useMemo(() => {
    if (!content) return content;

    const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g;
    const matches = [...content.matchAll(base64ImageRegex)];

    if (matches.length > 0) {
      matches.forEach((match, index) => {
        console.log(`Image ${index + 1}: alt="${match[1]}", data length=${match[2]?.length}`);
      });
    }

    return content;
  }, [content]);

  return (
    <div>
      {(() => {
        const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g;
        const matches = [...content.matchAll(base64ImageRegex)];

        if (matches.length > 0) {
          return matches.map((match, index) => {
            const alt = match[1] || 'Generated Image';
            const fullDataUrl = `data:image/png;base64,${match[2]}`;

            return (
              <div key={index}>
                <ImageWithSkeleton src={fullDataUrl} alt={alt} />
              </div>
            );
          });
        }

        return (
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              img({ src, alt }) {
                const srcString = typeof src === 'string' ? src : '';
                return <ImageWithSkeleton src={srcString} alt={alt || 'Generated image'} />;
              },
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
            {processedContent}
          </Markdown>
        );
      })()}
    </div>
  )
}
