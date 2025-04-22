'use client'

import React, { createContext, useContext, useRef, ReactNode } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Define the context type
interface SupabaseContextType {
  supabase: SupabaseClient | null
}

// Create the context with a default value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Define the props for the provider
interface SupabaseProviderProps {
  children: ReactNode
}

// Create the provider component
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Use useRef to ensure the client is created ONLY once, even in Strict Mode
  const supabaseRef = useRef<SupabaseClient | null>(null);

  if (supabaseRef.current === null) {
    supabaseRef.current = createClient();
  }

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseRef.current }}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Create a custom hook to use the Supabase context
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  // We initialize with createClient, so it should not be null here
  // Adding a check just in case, though it indicates a provider setup issue.
  if (context.supabase === null) {
    throw new Error('Supabase client initialization failed in provider');
  }
  return context.supabase
}