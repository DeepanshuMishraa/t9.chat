'use client';

import {
  ScrollArea,
  ScrollBar,
} from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => (
  <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
    <div className={cn('flex w-max flex-nowrap items-center gap-2', className)}>
      {children}
    </div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
);

export type SuggestionProps = {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <div className="w-full">
      <div
        className={cn('cursor-pointer px-4 py-3 text-left text-muted-foreground hover:text-foreground transition-colors', className)}
        onClick={handleClick}
        {...props}
      >
        {children || suggestion}
      </div>
      <div className="border-t border-border h-px w-full" />
    </div>
  );
};
