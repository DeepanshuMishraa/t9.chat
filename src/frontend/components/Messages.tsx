import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { UIMessage } from 'ai';
import MarkdownRenderer from './Markdown';
import { ChatBar } from './ChatBar';

interface MessagesProps {
  threadId: string;
  streamingMessages?: UIMessage[];
  storedMessages?: any[] | null;
  isLoading?: boolean;
}


function MessageContent({ message }: { message: any }) {
  return <MarkdownRenderer content={message.content || ''} />;
}

export default function Messages({ threadId, streamingMessages = [], storedMessages, isLoading }: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(() => {
    if (!storedMessages) return streamingMessages;

    // Get all streaming messages that aren't already stored
    const newStreamingMessages = streamingMessages.filter(streamMsg =>
      !storedMessages.some(storedMsg => storedMsg.id === streamMsg.id)
    );

    const combined = [...storedMessages, ...newStreamingMessages];

    return combined.sort((a, b) => {
      const dateA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)) : new Date(0);
      const dateB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)) : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [storedMessages, streamingMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  if (storedMessages === null) return null;
  if (storedMessages === undefined) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-4 mt-20">
      <ChatBar threadId={threadId} />
      {allMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a new conversation
        </div>
      ) : (
        allMessages.map((message, index) => { 
          return (
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
                  'max-w-[85%]  md:max-w-[75%] lg:max-w-[65%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted prose dark:prose-invert prose-sm sm:prose-base max-w-none'
                )}
              >
                <MessageContent message={message} />
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
} 
