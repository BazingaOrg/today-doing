import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  todos: {
    Row: {
      id: string;
      user_id: string;
      text: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<Tables["todos"]["Row"], "id" | "created_at" | "updated_at">;
    Update: Partial<Omit<Tables["todos"]["Row"], "id">>;
  };
};
