import { useTodoStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function StatsDisplay() {
  const todos = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-center space-x-4 mb-4"
    >
      <Badge
        variant="outline"
        className={`group px-3 py-1 cursor-pointer ${
          filter === "all"
            ? "bg-primary/10 dark:bg-primary/20"
            : "hover:bg-muted"
        }`}
        onClick={() => setFilter("all")}
      >
        <span className="inline-block group-hover:scale-125 transition-transform mr-2">
          📊
        </span>
        <span className="font-medium">{totalTodos}</span>
      </Badge>
      <Badge
        variant="outline"
        className={`group px-3 py-1 cursor-pointer ${
          filter === "completed"
            ? "bg-primary/10 dark:bg-primary/20"
            : "hover:bg-muted"
        }`}
        onClick={() => setFilter("completed")}
      >
        <span className="inline-block group-hover:rotate-[15deg] transition-transform mr-2">
          ✅
        </span>
        <span className="font-medium">{completedTodos}</span>
      </Badge>
      <Badge
        variant="outline"
        className={`group px-3 py-1 cursor-pointer ${
          filter === "pending"
            ? "bg-primary/10 dark:bg-primary/20"
            : "hover:bg-muted"
        }`}
        onClick={() => setFilter("pending")}
      >
        <span className="inline-block group-hover:rotate-[360deg] transition-transform duration-500 mr-2">
          ⭕️
        </span>
        <span className="font-medium">{pendingTodos}</span>
      </Badge>
    </motion.div>
  );
}
