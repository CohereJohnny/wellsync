export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      wells: {
        Row: {
          id: string
          name: string
          camp: string
          formation: string
          status: string
          location: string
          depth: number
          pressure: number
          temperature: number
          flow_rate: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          camp: string
          formation: string
          status?: string
          location: string
          depth: number
          pressure: number
          temperature: number
          flow_rate: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          camp?: string
          formation?: string
          status?: string
          location?: string
          depth?: number
          pressure?: number
          temperature?: number
          flow_rate?: number
          updated_at?: string
          created_at?: string
        }
      }
      parts: {
        Row: {
          id: string
          name: string
          type: string
          well_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          well_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          well_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      faults: {
        Row: {
          id: string
          well_id: string
          part_id: string
          type: string
          description: string | null
          timestamp: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          well_id: string
          part_id: string
          type: string
          description?: string | null
          timestamp?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          well_id?: string
          part_id?: string
          type?: string
          description?: string | null
          timestamp?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 