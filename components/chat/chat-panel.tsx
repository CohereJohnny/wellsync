'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentUserMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'user',
      content: input.trim(),
      wellId,
    }

    addMessage(wellId, currentUserMessage)

    const messagesToSend = [
      ...wellMessages, 
      {
        ...currentUserMessage,
        id: 'temp-id', // temporary id, API doesn't use it
        timestamp: new Date(), // temporary timestamp
      }
    ];

    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend, // Send the array including the new message
          wellId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text() // Get raw response text
        let errorMessage = `Error ${response.status}: `
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText)
          errorMessage += errorJson.error || 'Unknown error'
        } catch {
          // If not JSON, use the raw text
          errorMessage += errorText.slice(0, 200) // Limit length of error message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Add assistant message
      addMessage(wellId, {
        role: 'assistant',
        content: data.content,
        wellId,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      const message = error instanceof Error ? error.message : 'Failed to send message'
      setError(message)
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: message,
      })
    } finally {
      setLoading(false)
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
          {/* Empty History Message */}
          {!isHistoryLoading && wellMessages.length === 0 && (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
              <p>No conversation history for this well yet. Start chatting!</p>
            </div>
          )}
          {/* Messages Display */}
          {!isHistoryLoading &&
            wellMessages.length > 0 && // Only map if messages exist
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
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </Card>
  )
} 