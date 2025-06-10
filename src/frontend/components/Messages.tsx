import { useEffect, useRef } from 'react';
import { idb } from '@/frontend/dexie/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


interface MessagesProps {
  threadId: string;
}

export default function Messages({ threadId }: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live query messages for the current thread
  const messages = useLiveQuery(
    async () => {
      const thread = await idb.threads.get(threadId);
      if (!thread) return null;

      return await idb.messages
        .where('threadId')
        .equals(threadId)
        .sortBy('createdAt');
    },
    [threadId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages === null) return null;
  if (messages === undefined) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-4 pb-32">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a new conversation
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col m-4',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div
              className={cn(
                'px-4 py-3 rounded-xl',
                'max-w-[85%] md:max-w-[75%] lg:max-w-[65%]',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted prose dark:prose-invert prose-sm sm:prose-base max-w-none'
              )}
            >
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
                {message.content}
              </Markdown>
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
} 
