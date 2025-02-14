import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

type FilterType = "all" | "completed" | "pending";

interface TodoStore {
  todos: Todo[];
  filter: FilterType;
  searchQuery: string;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      filter: "all",
      searchQuery: "",
      addTodo: (text) =>
        set((state) => ({
          todos: [
            {
              id: Math.random().toString(36).substring(2),
              text,
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...state.todos,
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),
      updateTodo: (id, text) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, text } : todo
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: "todo-storage",
    }
  )
);
