import { SupabaseClient } from '@supabase/supabase-js'

declare global {
  type SupabaseSession = {
    user: {
      id: string
      email: string
    }
  }
}

export type { SupabaseSession } 