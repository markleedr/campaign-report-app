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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_proof_versions: {
        Row: {
          ad_data: Json
          ad_proof_id: string
          created_at: string
          id: string
          version_number: number
        }
        Insert: {
          ad_data: Json
          ad_proof_id: string
          created_at?: string
          id?: string
          version_number: number
        }
        Update: {
          ad_data?: Json
          ad_proof_id?: string
          created_at?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_proof_versions_ad_proof_id_fkey"
            columns: ["ad_proof_id"]
            isOneToOne: false
            referencedRelation: "ad_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_proofs: {
        Row: {
          ad_format: string
          campaign_id: string
          created_at: string
          current_version: number
          id: string
          name: string | null
          platform: string
          share_token: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_format: string
          campaign_id: string
          created_at?: string
          current_version?: number
          id?: string
          name?: string | null
          platform: string
          share_token: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_format?: string
          campaign_id?: string
          created_at?: string
          current_version?: number
          id?: string
          name?: string | null
          platform?: string
          share_token?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_proofs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          ad_proof_id: string
          approver_email: string | null
          approver_name: string
          comment: string
          created_at: string
          decision: string
          id: string
          version_number: number
        }
        Insert: {
          ad_proof_id: string
          approver_email?: string | null
          approver_name: string
          comment: string
          created_at?: string
          decision: string
          id?: string
          version_number: number
        }
        Update: {
          ad_proof_id?: string
          approver_email?: string | null
          approver_name?: string
          comment?: string
          created_at?: string
          decision?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approvals_ad_proof_id_fkey"
            columns: ["ad_proof_id"]
            isOneToOne: false
            referencedRelation: "ad_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_id: string
          created_at: string
          id: string
          name: string
          platform: string | null
          share_token: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          name: string
          platform?: string | null
          share_token?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          platform?: string | null
          share_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          ad_proof_id: string
          comment_text: string
          comment_type: string
          commenter_email: string | null
          commenter_name: string
          created_at: string
          field_name: string | null
          id: string
          version_number: number
        }
        Insert: {
          ad_proof_id: string
          comment_text: string
          comment_type: string
          commenter_email?: string | null
          commenter_name: string
          created_at?: string
          field_name?: string | null
          id?: string
          version_number: number
        }
        Update: {
          ad_proof_id?: string
          comment_text?: string
          comment_type?: string
          commenter_email?: string | null
          commenter_name?: string
          created_at?: string
          field_name?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "comments_ad_proof_id_fkey"
            columns: ["ad_proof_id"]
            isOneToOne: false
            referencedRelation: "ad_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_campaign_share_token: { Args: never; Returns: string }
      get_approvals_by_share_token: {
        Args: { p_share_token: string }
        Returns: {
          ad_proof_id: string
          approver_email: string | null
          approver_name: string
          comment: string
          created_at: string
          decision: string
          id: string
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "approvals"
          isOneToOne: false
          isSetofReturn: true
        }
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
    Enums: {},
  },
} as const
