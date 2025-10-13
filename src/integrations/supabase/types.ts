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
      estimates: {
        Row: {
          created_at: string
          id: string
          labor_cost: number
          material_cost: number
          notes: string | null
          quantity: number
          tool_option_id: string
          total_cost: number
          wall_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          quantity?: number
          tool_option_id: string
          total_cost?: number
          wall_id: string
        }
        Update: {
          created_at?: string
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          quantity?: number
          tool_option_id?: string
          total_cost?: number
          wall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_tool_option_id_fkey"
            columns: ["tool_option_id"]
            isOneToOne: false
            referencedRelation: "tool_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_wall_id_fkey"
            columns: ["wall_id"]
            isOneToOne: false
            referencedRelation: "walls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          name: string
          object_type: Database["public"]["Enums"]["object_type"]
          total_rooms: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          name: string
          object_type: Database["public"]["Enums"]["object_type"]
          total_rooms?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          name?: string
          object_type?: Database["public"]["Enums"]["object_type"]
          total_rooms?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          index: number
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          index: number
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          index?: number
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_options: {
        Row: {
          calc_strategy: string
          category_id: Database["public"]["Enums"]["tool_category"]
          created_at: string
          default_colors: number | null
          default_labor_price: number
          default_material_price: number
          id: string
          is_active: boolean | null
          max_panel_height_m: number | null
          name: string
          origin: string | null
          roll_width_m: number | null
          size_label: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          calc_strategy?: string
          category_id: Database["public"]["Enums"]["tool_category"]
          created_at?: string
          default_colors?: number | null
          default_labor_price?: number
          default_material_price?: number
          id?: string
          is_active?: boolean | null
          max_panel_height_m?: number | null
          name: string
          origin?: string | null
          roll_width_m?: number | null
          size_label?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          calc_strategy?: string
          category_id?: Database["public"]["Enums"]["tool_category"]
          created_at?: string
          default_colors?: number | null
          default_labor_price?: number
          default_material_price?: number
          id?: string
          is_active?: boolean | null
          max_panel_height_m?: number | null
          name?: string
          origin?: string | null
          roll_width_m?: number | null
          size_label?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      walls: {
        Row: {
          area_m2: number
          canvas_data: Json | null
          created_at: string
          height_m: number
          id: string
          length_m: number
          name: string
          room_id: string
          updated_at: string
        }
        Insert: {
          area_m2?: number
          canvas_data?: Json | null
          created_at?: string
          height_m?: number
          id?: string
          length_m?: number
          name: string
          room_id: string
          updated_at?: string
        }
        Update: {
          area_m2?: number
          canvas_data?: Json | null
          created_at?: string
          height_m?: number
          id?: string
          length_m?: number
          name?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "walls_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
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
      object_type: "apartment" | "house" | "commercial"
      tool_category:
        | "profile"
        | "fabric"
        | "membrane"
        | "light"
        | "mounting_plate"
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
      object_type: ["apartment", "house", "commercial"],
      tool_category: [
        "profile",
        "fabric",
        "membrane",
        "light",
        "mounting_plate",
      ],
    },
  },
} as const
