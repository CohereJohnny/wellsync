'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/stores/chat-store'
import { useToast } from '@/hooks/use-toast'
import type { Message } from '@/lib/stores/chat-store'
import { Skeleton } from '@/components/ui/skeleton'

interface ChatPanelProps {
  className?: string
  wellId: string
}

export function ChatPanel({ className, wellId }: ChatPanelProps) {
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
  const wellMessages = messages[wellId] || []

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
    console.log('handleSearch: Initiating search for:', query);
    setIsSearching(true);
    setInput('');

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
      console.log('handleSearch: Received results:', searchResults);

      // --- Display Search Results --- 
      let resultSummary = 'No relevant faults found.';
      if (searchResults && searchResults.length > 0) {
        resultSummary = `Found ${searchResults.length} relevant faults. Top result: \n- **Type**: ${searchResults[0].fault_type}\n- **Timestamp**: ${new Date(searchResults[0].timestamp).toLocaleString()}\n- **Score**: ${searchResults[0].rerank_score.toFixed(3)}`;
        // Add more details or format differently as needed
      }
      
      // Add a system message to display the results summary
      addMessage(wellId, {
          role: 'assistant', // Use assistant role for display purposes
          content: resultSummary, 
          // Maybe add a special flag later to render this differently
          // isSearchResult: true 
          wellId,
      });

      // Remove toast notifications as results are now shown in chat
      /* 
      if (searchResults && searchResults.length > 0) {
          toast({ ... });
      } else {
          toast({ ... });
      }
      */

    } catch (error) {
      console.error('handleSearch: Error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: message,
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
        toast({ title: "Search Error", description: "Please provide a query after /search", variant: "destructive" });
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
        //   { ...currentUserMessage, id: 'temp', timestamp: new Date() } // Re-evaluate if this structure is needed for API
      ];

      // Clear input immediately for responsiveness
      setInput(''); 
      setLoading(true); // Set chat loading state
      setError(null);

      try {
        console.log('handleSubmit: Sending message to /api/chat');
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
        const message = error instanceof Error ? error.message : 'Failed to send message';
        setError(message);
        toast({
            variant: 'destructive',
            title: 'Chat Error',
            description: message,
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

  return (
    <Card className={cn('flex h-[600px] flex-col', className)}>
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-4 scrollbar scrollbar-track-background scrollbar-thumb-muted-foreground/50 scrollbar-thumb-rounded scrollbar-w-2"
      >
        <div className="space-y-4">
          {isHistoryLoading && (
            <div className="space-y-4 p-4">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-3/4 self-end" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          )}
          {!isHistoryLoading && wellMessages.length === 0 && (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
              <p>No conversation history for this well yet. Start chatting!</p>
            </div>
          )}
          {!isHistoryLoading &&
            wellMessages.length > 0 &&
            wellMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-2 animate-in fade-in duration-300',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'flex w-fit max-w-[85%] flex-col rounded-lg px-4 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  <div className="mt-1 text-xs opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          }
          {isSearching && (
            <div className="flex items-center justify-center p-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Search className="h-4 w-4 animate-spin" />
                    <span>Searching relevant faults...</span>
                </div>
            </div>
          )}
          {isLoading && (
            <div className="flex items-start">
              <div className="flex w-fit max-w-[85%] flex-col rounded-lg bg-muted px-4 py-2">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type /search [query] or message...'
          disabled={isLoading || isSearching}
          className="flex-1"
        />
        <Button 
          type="button"
          variant="outline" 
          size="icon"
          onClick={handleSearchButtonClick}
          disabled={isLoading || isSearching || !input.trim()} 
          title="Search similar faults"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isSearching}
          title="Send message"
        >
          Send
        </Button>
      </form>
    </Card>
  )
} 