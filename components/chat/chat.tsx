'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSupabase } from '@/context/supabase-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  resourceId: string;
  resourceType: 'transformer' | 'well';
}

export function Chat({ resourceId, resourceType }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const supabase = useSupabase();
  
  // Fallback values for translations in case they're missing
  const translationFallbacks = {
    noHistory: 'No chat history yet. Start a conversation!',
    chatError: 'Chat Error',
    failedToSendMessage: 'Failed to send message',
    placeholder: 'Type your message here...',
    searchButtonAriaLabel: 'Search',
    sendButtonAriaLabel: 'Send message'
  };
  
  // Always call the hook (to avoid React Hook rules violation)
  const translator = useTranslations('chat');
  
  // Safe translation function that uses fallbacks if needed
  const t = (key: string) => {
    try {
      return translator(key);
    } catch (e) {
      return translationFallbacks[key as keyof typeof translationFallbacks] || key;
    }
  };
  
  const { toast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    async function loadChatHistory() {
      setIsFetching(true);
      try {
        const resourceIdField = resourceType === 'transformer' ? 'transformer_id' : 'well_id';
        
        const { data, error } = await supabase
          .from('chat_history')
          .select('messages')
          .eq(resourceIdField, resourceId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        if (data?.messages) {
          setMessages(data.messages as ChatMessage[]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsFetching(false);
      }
    }

    if (resourceId) {
      loadChatHistory();
    }
  }, [resourceId, resourceType, supabase]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call the real chat API instead of using a simulated response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage],
          resourceId,
          resourceType,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save the chat history to the database
      const resourceIdField = resourceType === 'transformer' ? 'transformer_id' : 'well_id';
      await supabase
        .from('chat_history')
        .upsert(
          {
            [resourceIdField]: resourceId,
            messages: finalMessages,
            updated_at: new Date().toISOString()
          },
          { onConflict: resourceIdField }
        );
    } catch (error: any) {
      console.error('Chat API error:', error);
      toast({
        title: t('chatError'),
        description: t('failedToSendMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 border rounded-md bg-gray-50">
        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-400">Loading conversation...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {t('noHistory')}
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          className="min-h-[80px] resize-none pr-20"
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-2 flex space-x-2">
          <Button
            size="icon"
            variant="outline"
            type="button"
            disabled={isLoading}
            aria-label={t('searchButtonAriaLabel')}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            type="submit"
            disabled={!input.trim() || isLoading}
            onClick={handleSendMessage}
            aria-label={t('sendButtonAriaLabel')}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 