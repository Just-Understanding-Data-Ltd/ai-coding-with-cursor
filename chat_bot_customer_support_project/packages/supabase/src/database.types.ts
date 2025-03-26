export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          customer_email: string
          customer_name: string
          date: string
          end_time: string
          id: string
          metadata: Json | null
          service: string
          status: string
          team_id: string
          time: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_email: string
          customer_name: string
          date: string
          end_time: string
          id?: string
          metadata?: Json | null
          service: string
          status: string
          team_id: string
          time: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string
          customer_name?: string
          date?: string
          end_time?: string
          id?: string
          metadata?: Json | null
          service?: string
          status?: string
          team_id?: string
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          excerpt?: string
          featured_image?: string
          id?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string
          id?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          bio?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          team_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          organization_id: string | null
          role_id: string | null
          team_id: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          organization_id?: string | null
          role_id?: string | null
          team_id?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          organization_id?: string | null
          role_id?: string | null
          team_id?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          metadata: Json | null
          role: string
          tokens_used: number | null
          tool_calls: Json | null
          updated_at: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          role: string
          tokens_used?: number | null
          tool_calls?: Json | null
          updated_at?: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          tokens_used?: number | null
          tool_calls?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          organization_id: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          organization_id?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          organization_id?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          auto_recharge_amount: number | null
          auto_recharge_enabled: boolean | null
          auto_recharge_threshold: number | null
          billing_email: string
          created_at: string | null
          credits_balance: number | null
          id: string
          is_subscribed: boolean | null
          name: string
          onboarding_data: Json | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_recharge_amount?: number | null
          auto_recharge_enabled?: boolean | null
          auto_recharge_threshold?: number | null
          billing_email: string
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_subscribed?: boolean | null
          name: string
          onboarding_data?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_recharge_amount?: number | null
          auto_recharge_enabled?: boolean | null
          auto_recharge_threshold?: number | null
          billing_email?: string
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_subscribed?: boolean | null
          name?: string
          onboarding_data?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          description: string | null
          id: string
          name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          role_id: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization: {
        Args: {
          p_name: string
          p_billing_email: string
          p_user_id: string
          p_team_name: string
          p_onboarding_role: Database["public"]["Enums"]["onboarding_role_type"]
          p_goals: Database["public"]["Enums"]["organization_goal"][]
          p_team_website?: string
          p_referral_source?: Database["public"]["Enums"]["organization_referral_source"]
        }
        Returns: Json
      }
      get_available_time_slots: {
        Args: {
          p_date: string
          p_team_id: string
        }
        Returns: {
          time_slot: string
        }[]
      }
      has_org_permission: {
        Args: {
          _org_id: string
          _permission_action: Database["public"]["Enums"]["permission_action"]
        }
        Returns: boolean
      }
      has_team_permission: {
        Args: {
          _team_id: string
          _permission_action: Database["public"]["Enums"]["permission_action"]
        }
        Returns: boolean
      }
      invite_org_member: {
        Args: {
          p_organization_id: string
          p_membership_type: Database["public"]["Enums"]["membership_type"]
          p_email: string
          p_role_id: string
          p_invited_by: string
          p_expires_at: string
          p_team_id?: string
        }
        Returns: string
      }
      is_org_member: {
        Args: {
          _org_id: string
        }
        Returns: boolean
      }
      process_invitation: {
        Args: {
          p_token: string
          p_user_id: string
        }
        Returns: boolean
      }
      reset_test_db: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revoke_invitation: {
        Args: {
          p_token: string
        }
        Returns: boolean
      }
      validate_invitation_token: {
        Args: {
          p_token: string
        }
        Returns: {
          id: string
          email: string
          organization_id: string
          role_id: string
          role_name: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          expires_at: string
          organizations: Json
        }[]
      }
    }
    Enums: {
      membership_type: "team" | "client"
      onboarding_role_type:
        | "support_team_member"
        | "support_team_manager"
        | "sales_representative"
        | "business_owner"
        | "developer"
        | "marketing_specialist"
        | "other"
      onboarding_role_type_old:
        | "freelance_marketer"
        | "marketing_agency_owner"
        | "marketing_agency_employee"
        | "in_house_marketer"
        | "small_business_owner"
        | "other"
      organization_goal:
        | "customer_support"
        | "sales_automation"
        | "lead_generation"
        | "personalized_responses"
        | "multilingual_support"
        | "reduce_response_time"
        | "knowledge_management"
        | "other"
      organization_goal_old:
        | "publish_multiple_platforms"
        | "manage_multiple_brands"
        | "implement_collaboration"
        | "approval_workflow"
        | "visual_planning"
        | "automate_content"
        | "other"
      organization_referral_source:
        | "google_search"
        | "friend_colleague"
        | "influencer"
        | "newsletter"
        | "ads"
        | "community"
        | "podcast"
        | "cant_remember"
      permission_action:
        | "view_comments_and_dms"
        | "manage_comments_and_dms"
        | "manage_email_inbox"
        | "manage_connected_pages"
        | "manage_integrations"
        | "create_posts"
        | "edit_posts"
        | "delete_posts"
        | "view_posts"
        | "schedule_posts"
        | "upload_media"
        | "manage_media_library"
        | "view_analytics"
        | "export_analytics"
        | "manage_team_members"
        | "assign_roles"
        | "manage_organization"
        | "manage_organization_members"
        | "manage_billing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

