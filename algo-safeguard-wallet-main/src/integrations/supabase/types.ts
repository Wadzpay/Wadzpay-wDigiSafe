export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          password?: string
          username?: string
        }
        Relationships: []
      }
      balance_change_log: {
        Row: {
          change_value: number
          created_at: string
          customer_id: string | null
          id: string
          new_balance: number
          previous_balance: number
          trigger_source: string
          updated_time: string
          wallet_address: string
        }
        Insert: {
          change_value: number
          created_at?: string
          customer_id?: string | null
          id?: string
          new_balance: number
          previous_balance: number
          trigger_source: string
          updated_time?: string
          wallet_address: string
        }
        Update: {
          change_value?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          new_balance?: number
          previous_balance?: number
          trigger_source?: string
          updated_time?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_change_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          confirmations: number
          created_at: string
          customer_id: string | null
          fee: number
          from: string
          id: string
          note: string | null
          timestamp: string
          to: string
          tx_hash: string
          type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          confirmations?: number
          created_at?: string
          customer_id?: string | null
          fee?: number
          from: string
          id?: string
          note?: string | null
          timestamp: string
          to: string
          tx_hash: string
          type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          confirmations?: number
          created_at?: string
          customer_id?: string | null
          fee?: number
          from?: string
          id?: string
          note?: string | null
          timestamp?: string
          to?: string
          tx_hash?: string
          type?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          created_at: string
          customer_id: string | null
          id: string
          private_key: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_id?: string | null
          id?: string
          private_key: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          private_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: {
          admin_username: string
          admin_password: string
        }
        Returns: Json
      }
      create_wallet: {
        Args: {
          wallet_address: string
          wallet_private_key: string
          customer_uuid: string
        }
        Returns: undefined
      }
      get_wallet_by_customer_id: {
        Args: {
          customer_uuid: string
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
