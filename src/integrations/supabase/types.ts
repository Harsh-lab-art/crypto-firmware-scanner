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
      detected_functions: {
        Row: {
          address: string
          analysis_id: string
          basic_blocks: number | null
          cfg_complexity: number | null
          classification: Database["public"]["Enums"]["crypto_type"]
          confidence: number
          created_at: string
          function_name: string
          id: string
          instruction_count: number | null
          is_crypto: boolean
          similar_library: string | null
          similarity_score: number | null
        }
        Insert: {
          address: string
          analysis_id: string
          basic_blocks?: number | null
          cfg_complexity?: number | null
          classification: Database["public"]["Enums"]["crypto_type"]
          confidence: number
          created_at?: string
          function_name: string
          id?: string
          instruction_count?: number | null
          is_crypto?: boolean
          similar_library?: string | null
          similarity_score?: number | null
        }
        Update: {
          address?: string
          analysis_id?: string
          basic_blocks?: number | null
          cfg_complexity?: number | null
          classification?: Database["public"]["Enums"]["crypto_type"]
          confidence?: number
          created_at?: string
          function_name?: string
          id?: string
          instruction_count?: number | null
          is_crypto?: boolean
          similar_library?: string | null
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detected_functions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "firmware_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      firmware_analyses: {
        Row: {
          analysis_duration: number | null
          analysis_status: string
          blockchain_block_number: number | null
          blockchain_logged_at: string | null
          blockchain_tx_hash: string | null
          created_at: string
          crypto_functions: number | null
          file_size: number
          filename: string
          id: string
          isa: Database["public"]["Enums"]["isa_type"]
          total_functions: number | null
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          analysis_duration?: number | null
          analysis_status?: string
          blockchain_block_number?: number | null
          blockchain_logged_at?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          crypto_functions?: number | null
          file_size: number
          filename: string
          id?: string
          isa?: Database["public"]["Enums"]["isa_type"]
          total_functions?: number | null
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          analysis_duration?: number | null
          analysis_status?: string
          blockchain_block_number?: number | null
          blockchain_logged_at?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          crypto_functions?: number | null
          file_size?: number
          filename?: string
          id?: string
          isa?: Database["public"]["Enums"]["isa_type"]
          total_functions?: number | null
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      protocol_flows: {
        Row: {
          analysis_id: string
          authentication_method: string | null
          confidence: number
          created_at: string
          description: string
          encryption_algorithm: string | null
          functions: string[]
          handshake_method: string | null
          id: string
          is_crypto: boolean | null
          key_exchange: string | null
          protocol_type: string | null
          security_level: string | null
          step_name: string
          step_number: number
        }
        Insert: {
          analysis_id: string
          authentication_method?: string | null
          confidence: number
          created_at?: string
          description: string
          encryption_algorithm?: string | null
          functions: string[]
          handshake_method?: string | null
          id?: string
          is_crypto?: boolean | null
          key_exchange?: string | null
          protocol_type?: string | null
          security_level?: string | null
          step_name: string
          step_number: number
        }
        Update: {
          analysis_id?: string
          authentication_method?: string | null
          confidence?: number
          created_at?: string
          description?: string
          encryption_algorithm?: string | null
          functions?: string[]
          handshake_method?: string | null
          id?: string
          is_crypto?: boolean | null
          key_exchange?: string | null
          protocol_type?: string | null
          security_level?: string | null
          step_name?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "protocol_flows_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "firmware_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      crypto_type:
        | "aes"
        | "rsa"
        | "ecc"
        | "sha"
        | "md5"
        | "hmac"
        | "prng"
        | "xor"
        | "des"
        | "rc4"
        | "non_crypto"
        | "unknown"
      isa_type:
        | "arm"
        | "arm64"
        | "x86"
        | "x86_64"
        | "mips"
        | "riscv"
        | "avr"
        | "unknown"
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
      crypto_type: [
        "aes",
        "rsa",
        "ecc",
        "sha",
        "md5",
        "hmac",
        "prng",
        "xor",
        "des",
        "rc4",
        "non_crypto",
        "unknown",
      ],
      isa_type: [
        "arm",
        "arm64",
        "x86",
        "x86_64",
        "mips",
        "riscv",
        "avr",
        "unknown",
      ],
    },
  },
} as const
