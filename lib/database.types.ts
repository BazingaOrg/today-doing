export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          created_at: string;
          text: string;
          completed: boolean;
          user_id: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          text: string;
          completed?: boolean;
          user_id: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          text?: string;
          completed?: boolean;
          user_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
