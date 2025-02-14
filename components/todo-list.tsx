"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTodoStore, type Todo } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TodoItem } from "@/components/todo-item";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";

type GroupedTodos = {
  [key: string]: Todo[];
};

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const { todos, addTodo, searchQuery, filter } = useTodoStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputExpanded]);

  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((todo) => {
        if (filter === "all") return true;
        if (filter === "completed") return todo.completed;
        if (filter === "pending") return !todo.completed;
        return true;
      });
  }, [todos, searchQuery, filter]);

  const groupedTodos = useMemo(() => {
    return filteredTodos.reduce<GroupedTodos>((acc, todo) => {
      const todoDate = new Date(todo.createdAt);
      let groupKey: string;

      if (isToday(todoDate)) {
        groupKey = "today";
      } else if (isYesterday(todoDate)) {
        groupKey = "yesterday";
      } else {
        groupKey = format(todoDate, "yyyy年MM月dd日", { locale: zhCN });
      }

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(todo);
      return acc;
    }, {});
  }, [filteredTodos]);

  // 对分组进行排序
  const sortedGroups = useMemo(() => {
    return Object.entries(groupedTodos).sort(([dateA], [dateB]) => {
      if (dateA === "today") return -1;
      if (dateB === "today") return 1;
      if (dateA === "yesterday") return -1;
      if (dateB === "yesterday") return 1;

      const dateAObj = new Date(dateA.replace(/[年月日]/g, "/"));
      const dateBObj = new Date(dateB.replace(/[年月日]/g, "/"));
      return dateBObj.getTime() - dateAObj.getTime();
    });
  }, [groupedTodos]);

  const getGroupTitle = (group: string) => {
    switch (group) {
      case "today":
        return "今日待办";
      case "yesterday":
        return "昨日待办";
      default:
        return group;
    }
  };

  const handleSubmit = (e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const isDuplicate = todos.some(
        (todo) => todo.text.toLowerCase() === newTodo.trim().toLowerCase()
      );
      if (isDuplicate) {
        toast({
          title: "重复的待办事项",
          description: "此待办事项已存在于您的列表中。",
          variant: "destructive",
        });
        setNewTodo("");
      } else {
        addTodo(newTodo.trim());
        setNewTodo("");
        toast({
          title: "待办事项已添加",
          description: "您的新待办事项已添加到列表中。",
          variant: "success",
        });
      }
    }
    setIsInputExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setIsInputExpanded(false);
    }
  };

  const clearNewTodo = () => {
    setNewTodo("");
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <AnimatePresence>
        {isInputExpanded ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <div className="relative flex-grow">
              <Input
                ref={inputRef}
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                placeholder="新增待办..."
                className="pr-10"
              />
              {newTodo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                  onClick={clearNewTodo}
                >
                  <span className="text-base leading-none select-none">❌</span>
                </Button>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={() => setIsInputExpanded(true)}
              className="w-full"
              variant="outline"
            >
              <motion.span
                whileHover={{ scale: 1.2, rotate: 15 }}
                className="mr-2 inline-block"
              >
                ➕
              </motion.span>
              新增待办
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedGroups.map(
        ([group, todos]) =>
          todos.length > 0 && (
            <div key={group} className="mt-8">
              <h2 className="text-lg font-semibold mb-4">
                {getGroupTitle(group)}
              </h2>
              <div className="space-y-2">
                {todos.map((todo: Todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
