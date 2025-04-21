import { type StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  wellId?: string // To associate messages with specific wells
}

interface ChatState {
  messages: Record<string, Message[]> // Keyed by wellId
  isLoading: boolean
  error: string | null
  addMessage: (wellId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearMessages: (wellId: string) => void
  setMessages: (wellId: string, messages: Message[]) => void
}

type ChatStore = StateCreator<
  ChatState,
  [],
  [['zustand/persist', unknown]],
  ChatState
>

const createChatStore: ChatStore = (set) => ({
  messages: {},
  isLoading: false,
  error: null,

  addMessage: (wellId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [wellId]: [
          ...(state.messages[wellId] || []),
          {
            ...message,
            id: nanoid(),
            timestamp: new Date(),
          },
        ],
      },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error: error }),

  clearMessages: (wellId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [wellId]: [],
      },
    })),

  setMessages: (wellId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [wellId]: messages,
      },
    })),
})

export const useChatStore = create<ChatState>()(
  persist(createChatStore, {
    name: 'chat-storage', // Name for localStorage
    partialize: (state) => ({
      messages: state.messages, // Only persist messages
    }),
  })
) 