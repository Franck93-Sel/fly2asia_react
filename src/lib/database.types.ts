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
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string
          short_description: string
          price: number
          duration_days: number
          image_url: string
          gallery_urls: string[]
          program: Json
          highlights: string[]
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          description: string
          short_description: string
          price: number
          duration_days: number
          image_url: string
          gallery_urls?: string[]
          program?: Json
          highlights?: string[]
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          description?: string
          short_description?: string
          price?: number
          duration_days?: number
          image_url?: string
          gallery_urls?: string[]
          program?: Json
          highlights?: string[]
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string | null
          destination_id: string
          traveler_name: string
          traveler_email: string
          traveler_phone: string
          number_of_travelers: number
          travel_date: string
          total_price: number
          status: string
          special_requests: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          destination_id: string
          traveler_name: string
          traveler_email: string
          traveler_phone: string
          number_of_travelers?: number
          travel_date: string
          total_price: number
          status?: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          destination_id?: string
          traveler_name?: string
          traveler_email?: string
          traveler_phone?: string
          number_of_travelers?: number
          travel_date?: string
          total_price?: number
          status?: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          message?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          booking_id: string | null
          amount: number
          status: string
          payment_method: string | null
          reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          booking_id?: string | null
          amount: number
          status?: string
          payment_method?: string | null
          reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          booking_id?: string | null
          amount?: number
          status?: string
          payment_method?: string | null
          reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Destination = Database['public']['Tables']['destinations']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];

export interface ProgramDay {
  day: number;
  title: string;
  description: string;
}
