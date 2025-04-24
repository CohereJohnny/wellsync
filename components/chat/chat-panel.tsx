'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/stores/chat-store'
import { useToast } from '@/hooks/use-toast'
import type { Message } from '@/lib/stores/chat-store'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupabase } from '@/context/supabase-context'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'

interface ChatPanelProps {
  className?: string
  wellId: string
}

export function ChatPanel({ className, wellId }: ChatPanelProps) {
  const t = useTranslations('chat') // Initialize translation hook with namespace
  const {
    messages,
    isLoading,
    addMessage,
    setLoading,
    setError,
    setMessages,
  } = useChatStore()
  const { toast } = useToast()
  const [input, setInput] = React.useState('')
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(true)
  const [isSearching, setIsSearching] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const wellMessages = useMemo(() => messages[wellId] || [], [messages, wellId])
  const supabase = useSupabase()
  const inventoryChannelRef = React.useRef<RealtimeChannel | null>(null)

  React.useEffect(() => {
    async function fetchHistory() {
      setIsHistoryLoading(true)
      try {
        const response = await fetch(`/api/chat_history?wellId=${wellId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.statusText}`)
        }
        const data = await response.json()
        setMessages(wellId, data.messages || [])
      } catch (error) {
        console.error('Failed to load chat history:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load history'
        )
        toast({
          variant: 'destructive',
          title: 'History Error',
          description:
            error instanceof Error ? error.message : 'Could not load chat history.',
        })
        setMessages(wellId, [])
      } finally {
        setIsHistoryLoading(false)
      }
    }

    fetchHistory()
    // We only want this to run once on mount for the specific wellId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellId])

  React.useEffect(() => {
    console.log('[Realtime] Setting up inventory subscription.');

    if (inventoryChannelRef.current) {
      supabase.removeChannel(inventoryChannelRef.current);
      inventoryChannelRef.current = null;
      console.log('[Realtime] Removed previous inventory channel.');
    }

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('[Realtime] Inventory Change received!', payload)
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to inventory changes!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Realtime] Inventory subscription error:', status, err);
          toast({
            variant: 'destructive',
            title: 'Realtime Error',
            description: `Could not subscribe to inventory updates: ${err?.message || status}`,
          });
        }
      });

    inventoryChannelRef.current = channel;

    return () => {
      if (inventoryChannelRef.current) {
        console.log('[Realtime] Unsubscribing from inventory changes.');
        supabase.removeChannel(inventoryChannelRef.current);
        inventoryChannelRef.current = null;
      }
    };
  }, [supabase, toast]);

  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  React.useEffect(() => {
    // Defer scroll slightly to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 0); // Timeout of 0 pushes execution after current stack

    // Cleanup function to clear timeout if component unmounts or effect re-runs
    return () => clearTimeout(timer);
  }, [wellMessages, scrollToBottom])

  /**
   * Handles the semantic fault search process.
   * Fetches embeddings for the query, calls the search API, and displays results.
   * @param query The user's search query string.
   */
  const handleSearch = async (query: string) => {
    if (!query || isSearching || isLoading) return;
    setIsSearching(true);
    setInput('');
    setError(null);

    try {
      const response = await fetch('/api/search_faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, wellId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse search error response' }));
        throw new Error(errorData.error || `Search failed with status: ${response.status}`);
      }

      const searchResults = await response.json();
      let resultSummary = 'No relevant faults found.';
      if (searchResults && searchResults.length > 0) {
        resultSummary = `Found ${searchResults.length} relevant faults. Top result: \n- **Type**: ${searchResults[0].fault_type}\n- **Timestamp**: ${new Date(searchResults[0].timestamp).toLocaleString()}\n- **Score**: ${searchResults[0].rerank_score.toFixed(3)}`;
      }
      
      addMessage(wellId, {
          role: 'assistant',
          content: resultSummary, 
          wellId,
      });

    } catch (error) {
      console.error('handleSearch: Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('searchError'),
        description: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handles form submission for both sending regular chat messages
   * and initiating a semantic search via the `/search` keyword.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    // Prevent submission if input is empty or either chat/search is loading
    if (!trimmedInput || isLoading || isSearching) return;

    // Check for keyword trigger
    if (trimmedInput.toLowerCase().startsWith('/search ')) {
      const searchQuery = trimmedInput.substring(8); // Get text after "/search "
      if (searchQuery) {
        handleSearch(searchQuery); // Call the search handler
      } else {
        // Show toast or message indicating search query is missing
        toast({ 
          title: t('searchError'), 
          description: t('searchErrorMissingQuery'), 
          variant: "destructive" 
        });
      }
    } else {
      // --- Existing Chat Completion Logic ---
      const currentUserMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'user',
        content: trimmedInput,
        wellId,
      };
      addMessage(wellId, currentUserMessage); // Add user message to store

      // Create a snapshot of messages *including* the new user message for the API call
      // Note: useChatStore provides the latest state, so we read it again or pass the new state
      const currentMessagesForWell = useChatStore.getState().messages[wellId] || [];
      // Ensure the temp message object has all needed fields for API (even if ignored)
      const messagesToSend = [
          ...currentMessagesForWell, 
      ];

      // Clear input immediately for responsiveness
      setInput(''); 
      setLoading(true); // Set chat loading state
      setError(null);

      try {
        const response = await fetch('/api/chat', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Send only the *new* user message, backend handles history
              messages: [currentUserMessage],
              wellId,
            }),
        });
       
        if (!response.ok) { 
            const errorText = await response.text();
            let errorMessage = `Error ${response.status}: `;
            try { 
                const errorJson = JSON.parse(errorText); 
                errorMessage += errorJson.error || 'Unknown chat error'; 
            }
            catch { 
                errorMessage += errorText.slice(0, 200); 
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        // Add assistant response to store
        addMessage(wellId, { role: 'assistant', content: data.content, wellId });
      } catch (error) {
        console.error('handleSubmit: Failed to send message:', error);
        const errorMessage = error instanceof Error ? error.message : t('failedToSendMessage');
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: t('chatError'),
            description: errorMessage,
        });
         // Optional: Remove the user message if the API call failed?
        // Consider state management implications here.
      } finally {
        setLoading(false); // Unset chat loading state
      }
    }
  };

  /**
   * Handles clicks on the dedicated Search button.
   * Triggers handleSearch with the current input value.
   */
  const handleSearchButtonClick = () => {
    const trimmedInput = input.trim()
    if (trimmedInput) {
      handleSearch(trimmedInput)
    }
  }

  // Determine message alignment and styling based on role
  const getMessageClasses = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      // User: right-align, teal bg, navy text, rounded except top-right
      return 'flex justify-end mb-2';
    } else {
      // Assistant: left-align
      return 'flex justify-start mb-2';
    }
  };
  const getBubbleClasses = (role: 'user' | 'assistant') => {
     if (role === 'user') {
       // User: cyan-100 bg, rounded-lg, rounded-tr-none, p-3, max-w-sm
       return 'bg-cyan-100 rounded-lg rounded-tr-none p-3 max-w-sm'; 
     } else {
       // Assistant: white bg, rounded-lg, rounded-tl-none, p-3, max-w-sm, shadow
       return 'bg-white rounded-lg rounded-tl-none p-3 max-w-sm shadow-sm'; 
     }
  }

  return (
    <Card className={cn('flex flex-col h-full bg-gray-50 shadow-sm rounded-lg p-1', className)}>
      <ScrollArea className="flex-1 mb-2 pr-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }} ref={scrollAreaRef}>
        <div className="space-y-2 p-2">
          {isHistoryLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-3/4 ml-auto" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : wellMessages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm p-4">
              {t('noHistory')}
            </p>
          ) : (
            wellMessages.map((message: Message, index: number) => (
              <div key={index} className={getMessageClasses(message.role)}>
                <div className={cn(getBubbleClasses(message.role), "text-base")}>
                  <ReactMarkdown 
                    components={{
                       p: ({node, ...props}) => <p {...props} className="mb-0 last:mb-0" />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.timestamp && (
                    <div className={`text-xs text-gray-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isSearching && (
            <div className="flex items-center justify-center p-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Search className="h-4 w-4 animate-spin" />
                    <span>{t('searchingFaults')}</span>
                </div>
            </div>
          )}
          {isLoading && (
             <div className={getMessageClasses('assistant')}>
                <div className={cn(getBubbleClasses('assistant'), "text-base")}>
                  <Skeleton className="h-5 w-10" />
                </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder={t('placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isSearching}
            className="pr-10 text-sm h-8"
          />
          <button
              type="button"
              onClick={handleSearchButtonClick}
              disabled={isLoading || isSearching || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              aria-label={t('searchButtonAriaLabel')}
          >
              <Search className="h-3 w-3" />
          </button>
        </div>
        <Button 
            type="submit" 
            disabled={isLoading || isSearching || !input.trim()}
            className="px-2 h-8"
            size="sm"
            aria-label={t('sendButtonAriaLabel')}
         >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  )
} 