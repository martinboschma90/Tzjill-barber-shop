/**
 * Generated with `supabase gen types typescript --schema tzjill` against
 * Flow Mates - Websites (bzvhqmaelahohyerqboj).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  tzjill: {
    Tables: {
      api_rate_limits: {
        Row: {
          bucket: string
          count: number
          ip_hash: string
          updated_at: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          ip_hash: string
          updated_at?: string
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          ip_hash?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          art_direction_version: number | null
          bio: string | null
          created_at: string
          genre: string | null
          id: string
          image_alt: string | null
          image_focus: string | null
          image_focus_x: number | null
          image_focus_y: number | null
          image_scale: number | null
          image_url: string | null
          name: string
          presskit_url: string | null
          published_at: string | null
          sections: Json
          slug: string
          socials: Json
          status: string
          tracks: Json
          updated_at: string
          video_url: string | null
          videos: Json
          visible: boolean
        }
        Insert: {
          art_direction_version?: number | null
          bio?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          image_alt?: string | null
          image_focus?: string | null
          image_focus_x?: number | null
          image_focus_y?: number | null
          image_scale?: number | null
          image_url?: string | null
          name: string
          presskit_url?: string | null
          published_at?: string | null
          sections?: Json
          slug: string
          socials?: Json
          status?: string
          tracks?: Json
          updated_at?: string
          video_url?: string | null
          videos?: Json
          visible?: boolean
        }
        Update: {
          art_direction_version?: number | null
          bio?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          image_alt?: string | null
          image_focus?: string | null
          image_focus_x?: number | null
          image_focus_y?: number | null
          image_scale?: number | null
          image_url?: string | null
          name?: string
          presskit_url?: string | null
          published_at?: string | null
          sections?: Json
          slug?: string
          socials?: Json
          status?: string
          tracks?: Json
          updated_at?: string
          video_url?: string | null
          videos?: Json
          visible?: boolean
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          artists: Json
          city: string
          country: string
          id: string
          submitted_at: string
        }
        Insert: {
          artists?: Json
          city?: string
          country?: string
          id?: string
          submitted_at?: string
        }
        Update: {
          artists?: Json
          city?: string
          country?: string
          id?: string
          submitted_at?: string
        }
        Relationships: []
      }
      cms_artists: {
        Row: {
          data: Json
          id: string
          slug: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          slug: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          data: Json
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          created_by: string | null
          duration: number | null
          height: number | null
          id: string
          kind: string
          mime_type: string
          name: string
          size: number
          storage_path: string
          width: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration?: number | null
          height?: number | null
          id?: string
          kind: string
          mime_type: string
          name: string
          size: number
          storage_path: string
          width?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration?: number | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          name?: string
          size?: number
          storage_path?: string
          width?: number | null
        }
        Relationships: []
      }
      site_health_cache: {
        Row: {
          cache_key: string
          fetched_at: string
          payload: Json
        }
        Insert: {
          cache_key: string
          fetched_at?: string
          payload?: Json
        }
        Update: {
          cache_key?: string
          fetched_at?: string
          payload?: Json
        }
        Relationships: []
      }
      site_rum: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          kind: string
          message: string
          name: string
          path: string
          session_id: string
          value: number | null
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          kind: string
          message?: string
          name?: string
          path?: string
          session_id?: string
          value?: number | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          kind?: string
          message?: string
          name?: string
          path?: string
          session_id?: string
          value?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          content: Json
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_speed_tests: {
        Row: {
          cls: number | null
          created_at: string
          id: string
          inp: number | null
          lcp: number | null
          optimize_summary: string
          optimized_at: string | null
          origin: string
          score: number | null
          source: string
          ttfb: number | null
        }
        Insert: {
          cls?: number | null
          created_at?: string
          id?: string
          inp?: number | null
          lcp?: number | null
          optimize_summary?: string
          optimized_at?: string | null
          origin: string
          score?: number | null
          source?: string
          ttfb?: number | null
        }
        Update: {
          cls?: number | null
          created_at?: string
          id?: string
          inp?: number | null
          lcp?: number | null
          optimize_summary?: string
          optimized_at?: string | null
          origin?: string
          score?: number | null
          source?: string
          ttfb?: number | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      api_rate_limit_hit: {
        Args: {
          p_bucket: string
          p_ip_hash: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      cms_ensure_role: { Args: never; Returns: string }
      cms_is_editor: { Args: never; Returns: boolean }
      cms_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  tzjill: {
    Enums: {},
  },
} as const

export type ArtistRow = Database['tzjill']['Tables']['artists']['Row']
export type TeamMemberRow = Database['tzjill']['Tables']['team_members']['Row']
export type SiteSettingsRow = Database['tzjill']['Tables']['site_settings']['Row']
export type MediaAssetRow = Database['tzjill']['Tables']['media_assets']['Row']
