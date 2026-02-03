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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_lockouts: {
        Row: {
          created_at: string
          email: string
          failed_attempts: number | null
          id: string
          locked_until: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          failed_attempts?: number | null
          id?: string
          locked_until: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          failed_attempts?: number | null
          id?: string
          locked_until?: string
          updated_at?: string
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          category: string | null
          click_count: number | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_hero: boolean | null
          title: string
          url: string
        }
        Insert: {
          category?: string | null
          click_count?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hero?: boolean | null
          title: string
          url: string
        }
        Update: {
          category?: string | null
          click_count?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_hero?: boolean | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          link_id: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string
          visitor_ip: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id: string
          visitor_ip?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_settings: {
        Row: {
          created_at: string | null
          ga_measurement_id: string | null
          id: string
          is_ga_enabled: boolean | null
          is_meta_enabled: boolean | null
          meta_pixel_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ga_measurement_id?: string | null
          id?: string
          is_ga_enabled?: boolean | null
          is_meta_enabled?: boolean | null
          meta_pixel_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ga_measurement_id?: string | null
          id?: string
          is_ga_enabled?: boolean | null
          is_meta_enabled?: boolean | null
          meta_pixel_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      click_logs: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          is_unique: boolean | null
          link_id: string | null
          os: string | null
          profile_id: string | null
          referer: string | null
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_unique?: boolean | null
          link_id?: string | null
          os?: string | null
          profile_id?: string | null
          referer?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_unique?: boolean | null
          link_id?: string | null
          os?: string | null
          profile_id?: string | null
          referer?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_logs_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          preview_image: string | null
          price: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          preview_image?: string | null
          price?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          preview_image?: string | null
          price?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guide_pages: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string
          file_url: string
          id?: string
          is_active?: boolean
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          affiliate_code: string | null
          animation: string | null
          badge: string | null
          click_count: number | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_affiliate: boolean | null
          is_highlighted: boolean | null
          link_type: string | null
          position: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          animation?: string | null
          badge?: string | null
          click_count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_affiliate?: boolean | null
          is_highlighted?: boolean | null
          link_type?: string | null
          position?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          animation?: string | null
          badge?: string | null
          click_count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_affiliate?: boolean | null
          is_highlighted?: boolean | null
          link_type?: string | null
          position?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          is_pro: boolean | null
          pending_revenue: number | null
          referral_code: string | null
          referred_by: string | null
          template: string | null
          theme_color: string | null
          total_clicks: number | null
          unique_clicks: number | null
          updated_at: string
          user_id: string
          username: string
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          is_pro?: boolean | null
          pending_revenue?: number | null
          referral_code?: string | null
          referred_by?: string | null
          template?: string | null
          theme_color?: string | null
          total_clicks?: number | null
          unique_clicks?: number | null
          updated_at?: string
          user_id: string
          username: string
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          is_pro?: boolean | null
          pending_revenue?: number | null
          referral_code?: string | null
          referred_by?: string | null
          template?: string | null
          theme_color?: string | null
          total_clicks?: number | null
          unique_clicks?: number | null
          updated_at?: string
          user_id?: string
          username?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_earned: number | null
          created_at: string
          id: string
          level: number | null
          referred_id: string
          referrer_id: string
        }
        Insert: {
          commission_earned?: number | null
          created_at?: string
          id?: string
          level?: number | null
          referred_id: string
          referrer_id: string
        }
        Update: {
          commission_earned?: number | null
          created_at?: string
          id?: string
          level?: number | null
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          position: number | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          position?: number | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          position?: number | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_image: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image?: string | null
        }
        Relationships: []
      }
      tip_jar: {
        Row: {
          cashapp_tag: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          message: string | null
          minimum_amount: number | null
          paypal_email: string | null
          suggested_amounts: Json | null
          updated_at: string | null
          user_id: string
          venmo_username: string | null
        }
        Insert: {
          cashapp_tag?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          message?: string | null
          minimum_amount?: number | null
          paypal_email?: string | null
          suggested_amounts?: Json | null
          updated_at?: string | null
          user_id: string
          venmo_username?: string | null
        }
        Update: {
          cashapp_tag?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          message?: string | null
          minimum_amount?: number | null
          paypal_email?: string | null
          suggested_amounts?: Json | null
          updated_at?: string | null
          user_id?: string
          venmo_username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          fraud_flags: Json | null
          fraud_score: number | null
          id: string
          is_flagged: boolean | null
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          fraud_flags?: Json | null
          fraud_score?: number | null
          id?: string
          is_flagged?: boolean | null
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          fraud_flags?: Json | null
          fraud_score?: number | null
          id?: string
          is_flagged?: boolean | null
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          template: string | null
          theme_color: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          template?: string | null
          theme_color?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          template?: string | null
          theme_color?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      social_links_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          platform: string | null
          position: number | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          platform?: string | null
          position?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          platform?: string | null
          position?: number | null
          url?: string | null
        }
        Relationships: []
      }
      tip_jar_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_enabled: boolean | null
          message: string | null
          minimum_amount: number | null
          suggested_amounts: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_enabled?: boolean | null
          message?: string | null
          minimum_amount?: number | null
          suggested_amounts?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_enabled?: boolean | null
          message?: string | null
          minimum_amount?: number | null
          suggested_amounts?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "creator", "user"],
    },
  },
} as const
