import { useEffect, useRef } from 'react';
import { idb } from '@/frontend/dexie/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
    <div className="flex flex-col gap-4 px-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a new conversation
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div
              className={cn(
                'px-4 py-3 rounded-xl max-w-[80%]',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
} 
