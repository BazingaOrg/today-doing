"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTodoStore, type Todo } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TodoItem } from "@/components/todo-item";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useNetworkStatus } from "@/hooks/use-network-status";

type GroupedTodos = {
  [key: string]: Todo[];
};

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const {
    todos,
    addTodo,
    searchQuery,
    filter,
    isLoading,
    error,
    fetchTodos,
    unsubscribeFromChanges,
    setIsOnline,
  } = useTodoStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    setIsOnline(isOnline);
  }, [isOnline, setIsOnline]);

  useEffect(() => {
    fetchTodos();
    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchTodos, unsubscribeFromChanges]);

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
      const todoDate = new Date(todo.created_at);
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

  const handleSubmit = async (e: React.FormEvent | React.FocusEvent) => {
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
        try {
          await addTodo(newTodo.trim());
          setNewTodo("");
          toast({
            title: "待办事项已添加",
            description: "您的新待办事项已添加到列表中。",
            variant: "success",
          });
        } catch (error) {
          toast({
            title: "添加失败",
            description: "添加待办事项时出现错误，请重试。",
            variant: "destructive",
          });
        }
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
      {!isOnline && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 rounded-md flex items-center gap-2">
          <span className="text-lg">📡</span>
          <p>当前处于离线模式，您的更改将在重新连接后自动同步。</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-md space-y-2">
          <p className="text-center">远程数据加载失败：{error}</p>
          <p className="text-sm text-muted-foreground">
            💡
            别担心！您仍可以继续添加和管理待办事项，所有数据将安全地存储在本地。当网络恢复正常并成功登录后，系统会智能地帮您处理数据合并。
          </p>
        </div>
      )}

      {isLoading && todos.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
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
                      <span className="text-base leading-none select-none">
                        ❌
                      </span>
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
        </>
      )}
    </div>
  );
}
