import { create } from "zustand";
import { supabase } from "./supabase";
import type { Tables } from "./supabase";
import type {
  RealtimeChannel,
  PostgrestResponse,
  PostgrestSingleResponse,
  PostgrestError,
} from "@supabase/supabase-js";
import { offlineQueue } from "./offline-queue";
import { withRetry } from "./retry";
import { handleError, AppError } from "./error-handler";

export type Todo = Tables["todos"]["Row"];
type FilterType = "all" | "completed" | "pending";

interface TodoStore {
  todos: Todo[];
  filter: FilterType;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  syncOfflineActions: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, text: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
  fetchTodos: () => Promise<void>;
  subscribeToChanges: () => Promise<void>;
  unsubscribeFromChanges: () => void;
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  filter: "all",
  searchQuery: "",
  isLoading: false,
  error: null,
  subscription: null,
  isOnline: true,

  setIsOnline: (status: boolean) => {
    set({ isOnline: status });
    if (status) {
      // 重新上线时，同步离线操作
      get().syncOfflineActions();
    }
  },

  syncOfflineActions: async () => {
    const actions = offlineQueue.getQueue();
    if (actions.length === 0) return;

    set({ isLoading: true });

    for (const action of actions) {
      try {
        switch (action.type) {
          case "ADD": {
            const { text } = action.payload;
            await withRetry(() => get().addTodo(text));
            break;
          }
          case "UPDATE": {
            const { id, text } = action.payload;
            await withRetry(() => get().updateTodo(id, text));
            break;
          }
          case "DELETE": {
            const { id } = action.payload;
            await withRetry(() => get().deleteTodo(id));
            break;
          }
          case "TOGGLE": {
            const { id } = action.payload;
            await withRetry(() => get().toggleTodo(id));
            break;
          }
        }
        offlineQueue.removeFromQueue(action.timestamp);
      } catch (error) {
        const appError = handleError(error);
        set({ error: appError.message });
        console.error("同步失败:", appError);
      }
    }

    set({ isLoading: false });
    await get().fetchTodos();
  },

  subscribeToChanges: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const subscription = supabase
      .channel("todos_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${session.user.id}`,
        },
        async (payload) => {
          const { eventType } = payload;
          const store = get();

          switch (eventType) {
            case "INSERT": {
              const newTodo = payload.new as Todo;
              set({ todos: [newTodo, ...store.todos] });
              break;
            }
            case "UPDATE": {
              const updatedTodo = payload.new as Todo;
              set({
                todos: store.todos.map((t) =>
                  t.id === updatedTodo.id ? updatedTodo : t
                ),
              });
              break;
            }
            case "DELETE": {
              const deletedTodo = payload.old as Todo;
              set({
                todos: store.todos.filter((t) => t.id !== deletedTodo.id),
              });
              break;
            }
          }
        }
      )
      .subscribe();

    set({ subscription });
  },

  unsubscribeFromChanges: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  fetchTodos: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      set({ todos: [], error: "请先登录" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from("todos")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
      );

      if (error) throw error;
      set({ todos: data || [] });

      await get().subscribeToChanges();
    } catch (error) {
      const appError = handleError(error);
      set({ error: appError.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (text: string) => {
    const { isOnline } = get();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new AppError("请先登录", "AUTH_REQUIRED");
    }

    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      const tempTodo: Todo = {
        id: tempId,
        text,
        completed: false,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      offlineQueue.addToQueue({
        type: "ADD",
        payload: { text },
      });

      set((state) => ({ todos: [tempTodo, ...state.todos] }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from("todos")
          .insert([{ text, completed: false, user_id: session.user.id }])
          .select()
          .single()
      );

      if (error) throw error;
      if (data) {
        set((state) => ({ todos: [data, ...state.todos] }));
      }
    } catch (error) {
      const appError = handleError(error);
      set({ error: appError.message });
      throw appError;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleTodo: async (id: string) => {
    const { isOnline, todos } = get();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new AppError("请先登录", "AUTH_REQUIRED");
    }

    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      throw new AppError("待办事项不存在", "NOT_FOUND");
    }

    if (!isOnline) {
      offlineQueue.addToQueue({
        type: "TOGGLE",
        payload: { id },
      });

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await withRetry(() =>
        supabase
          .from("todos")
          .update({ completed: !todo.completed })
          .eq("id", id)
          .eq("user_id", session.user.id)
      );

      if (error) throw error;
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      }));
    } catch (error) {
      const appError = handleError(error);
      set({ error: appError.message });
      throw appError;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTodo: async (id: string, text: string) => {
    const { isOnline } = get();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new AppError("请先登录", "AUTH_REQUIRED");
    }

    if (!isOnline) {
      offlineQueue.addToQueue({
        type: "UPDATE",
        payload: { id, text },
      });

      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? { ...t, text } : t)),
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await withRetry(() =>
        supabase
          .from("todos")
          .update({ text })
          .eq("id", id)
          .eq("user_id", session.user.id)
      );

      if (error) throw error;
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? { ...t, text } : t)),
      }));
    } catch (error) {
      const appError = handleError(error);
      set({ error: appError.message });
      throw appError;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTodo: async (id: string) => {
    const { isOnline } = get();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new AppError("请先登录", "AUTH_REQUIRED");
    }

    if (!isOnline) {
      offlineQueue.addToQueue({
        type: "DELETE",
        payload: { id },
      });

      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await withRetry(() =>
        supabase
          .from("todos")
          .delete()
          .eq("id", id)
          .eq("user_id", session.user.id)
      );

      if (error) throw error;
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      }));
    } catch (error) {
      const appError = handleError(error);
      set({ error: appError.message });
      throw appError;
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilter: (filter: FilterType) => set({ filter }),
}));
