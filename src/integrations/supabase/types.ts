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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ad_earnings_logs: {
        Row: {
          created_at: string | null
          creator_share: number | null
          date: string
          gross_revenue: number | null
          id: string
          impressions: number | null
          platform_share: number | null
          revenue_share_pct: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creator_share?: number | null
          date?: string
          gross_revenue?: number | null
          id?: string
          impressions?: number | null
          platform_share?: number | null
          revenue_share_pct?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creator_share?: number | null
          date?: string
          gross_revenue?: number | null
          id?: string
          impressions?: number | null
          platform_share?: number | null
          revenue_share_pct?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          ad_slot: string | null
          country: string | null
          created_at: string
          device_type: string | null
          estimated_revenue: number | null
          id: string
          profile_id: string
          user_agent: string | null
          user_id: string
          visitor_ip: string | null
        }
        Insert: {
          ad_slot?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          estimated_revenue?: number | null
          id?: string
          profile_id: string
          user_agent?: string | null
          user_id: string
          visitor_ip?: string | null
        }
        Update: {
          ad_slot?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          estimated_revenue?: number | null
          id?: string
          profile_id?: string
          user_agent?: string | null
          user_id?: string
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
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
      adsense_settings: {
        Row: {
          created_at: string
          creator_earnings: number | null
          id: string
          is_revenue_sharing_enabled: boolean | null
          last_calculated_at: string | null
          total_estimated_revenue: number | null
          total_impressions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_earnings?: number | null
          id?: string
          is_revenue_sharing_enabled?: boolean | null
          last_calculated_at?: string | null
          total_estimated_revenue?: number | null
          total_impressions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_earnings?: number | null
          id?: string
          is_revenue_sharing_enabled?: boolean | null
          last_calculated_at?: string | null
          total_estimated_revenue?: number | null
          total_impressions?: number | null
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "affiliate_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links_public"
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
      bug_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
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
            foreignKeyName: "click_logs_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links_public"
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
      content_track: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string | null
          id: string
          owner_id: string | null
          user_agent: string | null
          viewer_ip: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          user_agent?: string | null
          viewer_ip?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          user_agent?: string | null
          viewer_ip?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number | null
          type: string
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          type?: string
          used_count?: number
          value?: number
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          type?: string
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      creator_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          hearts_count: number
          id: string
          is_pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_pinned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          hearts_count?: number
          id?: string
          is_pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_subscribers: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          subscriber_email: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          subscriber_email: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          subscriber_email?: string
        }
        Relationships: []
      }
      digital_products: {
        Row: {
          copies_sold: number
          created_at: string | null
          currency: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          flash_sale_ends_at: string | null
          id: string
          is_active: boolean | null
          is_flash_sale: boolean
          max_quantity: number | null
          preview_image: string | null
          price: number
          title: string
          updated_at: string | null
          upsell_product_ids: string[] | null
          user_id: string
        }
        Insert: {
          copies_sold?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          flash_sale_ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_flash_sale?: boolean
          max_quantity?: number | null
          preview_image?: string | null
          price?: number
          title: string
          updated_at?: string | null
          upsell_product_ids?: string[] | null
          user_id: string
        }
        Update: {
          copies_sold?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          flash_sale_ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_flash_sale?: boolean
          max_quantity?: number | null
          preview_image?: string | null
          price?: number
          title?: string
          updated_at?: string | null
          upsell_product_ids?: string[] | null
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
      leads: {
        Row: {
          created_at: string
          creator_id: string
          digital_product_id: string | null
          email: string
          id: string
          message: string | null
          name: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          digital_product_id?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          digital_product_id?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
        }
        Relationships: []
      }
      link_display_rules: {
        Row: {
          action: string
          condition_type: string
          condition_value: string
          created_at: string
          id: string
          is_active: boolean
          link_ids: string[]
          name: string
          priority: number
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string
          condition_type?: string
          condition_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          link_ids?: string[]
          name: string
          priority?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          condition_type?: string
          condition_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          link_ids?: string[]
          name?: string
          priority?: number
          updated_at?: string
          user_id?: string
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
          lock_password: string | null
          lock_type: string | null
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
          lock_password?: string | null
          lock_type?: string | null
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
          lock_password?: string | null
          lock_type?: string | null
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
      orders: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          base_amount: number | null
          city: string | null
          courier_partner: string | null
          created_at: string | null
          creator_id: string | null
          currency: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_charges: number | null
          id: string
          items: Json
          package_weight_kg: number | null
          payment_method: string | null
          payout_status: string | null
          pickup_scheduled_at: string | null
          pincode: string | null
          platform_fee: number | null
          seller_payout_amount: number | null
          shipping_address: string | null
          shiprocket_order_id: string | null
          state: string | null
          status: string | null
          total_amount: number
          tracking_id: string | null
          transaction_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          base_amount?: number | null
          city?: string | null
          courier_partner?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_charges?: number | null
          id?: string
          items: Json
          package_weight_kg?: number | null
          payment_method?: string | null
          payout_status?: string | null
          pickup_scheduled_at?: string | null
          pincode?: string | null
          platform_fee?: number | null
          seller_payout_amount?: number | null
          shipping_address?: string | null
          shiprocket_order_id?: string | null
          state?: string | null
          status?: string | null
          total_amount: number
          tracking_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          base_amount?: number | null
          city?: string | null
          courier_partner?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_charges?: number | null
          id?: string
          items?: Json
          package_weight_kg?: number | null
          payment_method?: string | null
          payout_status?: string | null
          pickup_scheduled_at?: string | null
          pincode?: string | null
          platform_fee?: number | null
          seller_payout_amount?: number | null
          shipping_address?: string | null
          shiprocket_order_id?: string | null
          state?: string | null
          status?: string | null
          total_amount?: number
          tracking_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          post_id: string
          visitor_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          post_id: string
          visitor_name?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          post_id?: string
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "creator_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          visitor_ip: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          visitor_ip: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          visitor_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "creator_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          allow_cod: boolean | null
          category: string | null
          created_at: string | null
          creator_id: string | null
          currency: string | null
          description: string | null
          file_url: string | null
          id: string
          images: string[] | null
          preview_image_url: string | null
          price: number
          slug: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          allow_cod?: boolean | null
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          images?: string[] | null
          preview_image_url?: string | null
          price: number
          slug?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          allow_cod?: boolean | null
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          images?: string[] | null
          preview_image_url?: string | null
          price?: number
          slug?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile_layout_elements: {
        Row: {
          created_at: string
          custom_asset_url: string | null
          element_id: string | null
          element_type: string
          height: number | null
          id: string
          is_absolute: boolean | null
          opacity: number | null
          position_x: number | null
          position_y: number | null
          settings: Json | null
          updated_at: string
          user_id: string
          width: number | null
          z_index: number | null
        }
        Insert: {
          created_at?: string
          custom_asset_url?: string | null
          element_id?: string | null
          element_type?: string
          height?: number | null
          id?: string
          is_absolute?: boolean | null
          opacity?: number | null
          position_x?: number | null
          position_y?: number | null
          settings?: Json | null
          updated_at?: string
          user_id: string
          width?: number | null
          z_index?: number | null
        }
        Update: {
          created_at?: string
          custom_asset_url?: string | null
          element_id?: string | null
          element_type?: string
          height?: number | null
          id?: string
          is_absolute?: boolean | null
          opacity?: number | null
          position_x?: number | null
          position_y?: number | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
          width?: number | null
          z_index?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ads_balance: number | null
          announcement_text: string | null
          avatar_url: string | null
          bank_details: Json | null
          bio: string | null
          content_track: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean | null
          id: string
          interests: string[] | null
          is_onboarded: boolean | null
          is_pro: boolean | null
          is_verified: boolean | null
          layout_config: Json | null
          pending_revenue: number | null
          pickup_address_line1: string | null
          pickup_address_line2: string | null
          pickup_city: string | null
          pickup_phone: string | null
          pickup_pincode: string | null
          pickup_state: string | null
          referral_code: string | null
          referred_by: string | null
          reset_token: string | null
          reset_token_expires_at: string | null
          subscription_plan: string | null
          template: string | null
          theme_color: string | null
          total_clicks: number | null
          total_withdrawn: number | null
          unique_clicks: number | null
          updated_at: string
          user_id: string
          user_intent: Json | null
          username: string
          verification_token: string | null
          verification_token_expires_at: string | null
          video_background_url: string | null
          video_overlay_opacity: number | null
          wallet_balance: number | null
          whatsapp_number: string | null
        }
        Insert: {
          ads_balance?: number | null
          announcement_text?: string | null
          avatar_url?: string | null
          bank_details?: Json | null
          bio?: string | null
          content_track?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          id?: string
          interests?: string[] | null
          is_onboarded?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          layout_config?: Json | null
          pending_revenue?: number | null
          pickup_address_line1?: string | null
          pickup_address_line2?: string | null
          pickup_city?: string | null
          pickup_phone?: string | null
          pickup_pincode?: string | null
          pickup_state?: string | null
          referral_code?: string | null
          referred_by?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          subscription_plan?: string | null
          template?: string | null
          theme_color?: string | null
          total_clicks?: number | null
          total_withdrawn?: number | null
          unique_clicks?: number | null
          updated_at?: string
          user_id: string
          user_intent?: Json | null
          username: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
          video_background_url?: string | null
          video_overlay_opacity?: number | null
          wallet_balance?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          ads_balance?: number | null
          announcement_text?: string | null
          avatar_url?: string | null
          bank_details?: Json | null
          bio?: string | null
          content_track?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          id?: string
          interests?: string[] | null
          is_onboarded?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          layout_config?: Json | null
          pending_revenue?: number | null
          pickup_address_line1?: string | null
          pickup_address_line2?: string | null
          pickup_city?: string | null
          pickup_phone?: string | null
          pickup_pincode?: string | null
          pickup_state?: string | null
          referral_code?: string | null
          referred_by?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          subscription_plan?: string | null
          template?: string | null
          theme_color?: string | null
          total_clicks?: number | null
          total_withdrawn?: number | null
          unique_clicks?: number | null
          updated_at?: string
          user_id?: string
          user_intent?: Json | null
          username?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
          video_background_url?: string | null
          video_overlay_opacity?: number | null
          wallet_balance?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      qa_questions: {
        Row: {
          answer_text: string | null
          answer_video_url: string | null
          answered_at: string | null
          asker_email: string | null
          asker_name: string
          created_at: string
          creator_user_id: string
          id: string
          is_answered: boolean
          is_paid: boolean
          is_public: boolean
          question: string
          tip_amount: number | null
        }
        Insert: {
          answer_text?: string | null
          answer_video_url?: string | null
          answered_at?: string | null
          asker_email?: string | null
          asker_name?: string
          created_at?: string
          creator_user_id: string
          id?: string
          is_answered?: boolean
          is_paid?: boolean
          is_public?: boolean
          question: string
          tip_amount?: number | null
        }
        Update: {
          answer_text?: string | null
          answer_video_url?: string | null
          answered_at?: string | null
          asker_email?: string | null
          asker_name?: string
          created_at?: string
          creator_user_id?: string
          id?: string
          is_answered?: boolean
          is_paid?: boolean
          is_public?: boolean
          question?: string
          tip_amount?: number | null
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
      store_integrations: {
        Row: {
          access_token: string | null
          api_key: string | null
          api_secret: string | null
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          settings: Json | null
          store_domain: string | null
          store_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          settings?: Json | null
          store_domain?: string | null
          store_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          settings?: Json | null
          store_domain?: string | null
          store_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          contact_number: string | null
          created_at: string | null
          id: string
          query_text: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          query_text?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          query_text?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
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
          razorpay_enabled: boolean | null
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
          razorpay_enabled?: boolean | null
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
          razorpay_enabled?: boolean | null
          suggested_amounts?: Json | null
          updated_at?: string | null
          user_id?: string
          venmo_username?: string | null
        }
        Relationships: []
      }
      tip_transactions: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          currency: string | null
          id: string
          message: string | null
          order_id: string | null
          payment_id: string | null
          status: string | null
          supporter_email: string | null
          supporter_name: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id: string
          currency?: string | null
          id?: string
          message?: string | null
          order_id?: string | null
          payment_id?: string | null
          status?: string | null
          supporter_email?: string | null
          supporter_name?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          currency?: string | null
          id?: string
          message?: string | null
          order_id?: string | null
          payment_id?: string | null
          status?: string | null
          supporter_email?: string | null
          supporter_name?: string | null
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
      user_wallets: {
        Row: {
          adsense_share: number | null
          product_sales: number | null
          updated_at: string | null
          user_id: string
          withdrawable_balance: number | null
        }
        Insert: {
          adsense_share?: number | null
          product_sales?: number | null
          updated_at?: string | null
          user_id: string
          withdrawable_balance?: number | null
        }
        Update: {
          adsense_share?: number | null
          product_sales?: number | null
          updated_at?: string | null
          user_id?: string
          withdrawable_balance?: number | null
        }
        Relationships: []
      }
      wallet_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          id: string
          next_renewal_at: string
          plan: string
          price: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          next_renewal_at?: string
          plan?: string
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          next_renewal_at?: string
          plan?: string
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
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
      links_public: {
        Row: {
          animation: string | null
          badge: string | null
          click_count: number | null
          created_at: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          is_highlighted: boolean | null
          link_type: string | null
          position: number | null
          title: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          animation?: string | null
          badge?: string | null
          click_count?: number | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          is_highlighted?: boolean | null
          link_type?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          animation?: string | null
          badge?: string | null
          click_count?: number | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          is_highlighted?: boolean | null
          link_type?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          announcement_text: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          is_pro: boolean | null
          is_verified: boolean | null
          template: string | null
          theme_color: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          announcement_text?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          template?: string | null
          theme_color?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          announcement_text?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          is_pro?: boolean | null
          is_verified?: boolean | null
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
      store_integrations_public: {
        Row: {
          id: string | null
          is_active: boolean | null
          platform: string | null
          store_domain: string | null
          store_name: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          is_active?: boolean | null
          platform?: string | null
          store_domain?: string | null
          store_name?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          is_active?: boolean | null
          platform?: string | null
          store_domain?: string | null
          store_name?: string | null
          user_id?: string | null
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
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_withdrawal: {
        Args: {
          p_amount: number
          p_fraud_flags?: Json
          p_fraud_score?: number
          p_is_flagged?: boolean
          p_payment_details: Json
          p_payment_method: string
          p_user_id: string
        }
        Returns: string
      }
      track_profile_view: {
        Args: {
          p_device_type: string
          p_is_unique: boolean
          p_pro_threshold: number
          p_profile_id: string
          p_referer: string
          p_revenue_per_view: number
          p_user_agent: string
          p_visitor_ip: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "user"
      ticket_status: "new" | "pending" | "resolved"
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
      ticket_status: ["new", "pending", "resolved"],
    },
  },
} as const
