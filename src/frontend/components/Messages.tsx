import { useEffect, useRef } from 'react';
import { idb } from '@/frontend/dexie/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { UIMessage } from 'ai';
import MarkdownRenderer from './Markdown';

interface MessagesProps {
  threadId: string;
  streamingMessages?: UIMessage[];
}

export default function Messages({ threadId, streamingMessages = [] }: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live query messages for the current thread
  const storedMessages = useLiveQuery(
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

  // Combine stored messages with streaming messages, avoiding duplicates
  const allMessages = [
    ...(storedMessages || []),
    ...streamingMessages.filter(streamMsg =>
      !storedMessages?.some(storedMsg => storedMsg.id === streamMsg.id)
    )
  ].sort((a, b) => {
    const dateA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)) : new Date(0);
    const dateB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)) : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  if (storedMessages === null) return null;
  if (storedMessages === undefined) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-4">
      {allMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a new conversation
        </div>
      ) : (
        allMessages.map((message) => (
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
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
} 
