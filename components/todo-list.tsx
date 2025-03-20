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
import { StatsDisplay } from "@/components/stats-display";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  X,
  Plus,
  Wifi,
  Lightbulb,
} from "lucide-react";

type GroupedTodos = {
  [key: string]: Todo[];
};

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [openPopoverGroup, setOpenPopoverGroup] = useState<string | null>(null);
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
  const [timeProgress, setTimeProgress] = useState({
    yearProgress: 0,
    dayProgress: 0,
    dayOfYear: 0,
    currentYear: new Date().getFullYear(),
  });

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

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

      // 计算年进度
      const yearProgress =
        ((now.getTime() - startOfYear.getTime()) /
          (endOfYear.getTime() - startOfYear.getTime())) *
        100;

      // 计算日进度
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const dayProgress =
        ((now.getTime() - startOfDay.getTime()) / (24 * 60 * 60 * 1000)) * 100;

      // 计算年中的第几天
      const dayOfYear = Math.ceil(
        (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
      );

      setTimeProgress({
        yearProgress: Number(yearProgress.toFixed(6)),
        dayProgress: Number(dayProgress.toFixed(6)),
        dayOfYear,
        currentYear: now.getFullYear(),
      });
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 对每个分组内的待办事项进行排序
  const sortedGroupTodos = useMemo(() => {
    return sortedGroups.map(([group, groupTodos]) => ({
      group,
      todos: [...groupTodos].sort((a, b) => {
        // 首先按完成状态排序
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // 然后按创建时间排序
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }),
    }));
  }, [sortedGroups]);

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
            title: "添加成功",
            description: "新的待办事项已添加到列表中。",
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
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium leading-none tracking-tight">
              {timeProgress.currentYear}年的第{timeProgress.dayOfYear}天
            </h3>
            <p className="text-sm text-muted-foreground">
              If Not Now, Then When?
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-32 space-y-1">
              <p className="text-sm font-medium leading-none">今年进度</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                  {timeProgress.yearProgress.toFixed(3)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div className="w-32 space-y-1">
              <p className="text-sm font-medium leading-none text-right">
                今日进度
              </p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                  {timeProgress.dayProgress.toFixed(3)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 rounded-md flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          <p>当前处于离线模式，您的更改将在重新连接后自动同步。</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-md space-y-2">
          <p className="text-center">远程数据加载失败：{error}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-amber-500" />
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
          <StatsDisplay />

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
                        <X className="h-4 w-4" />
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
                    <Plus className="h-4 w-4" />
                  </motion.span>
                  新增待办
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Accordion
            type="single"
            collapsible
            defaultValue={sortedGroupTodos[0]?.group}
            className="space-y-4"
          >
            {sortedGroupTodos.map(
              ({ group, todos }) =>
                todos.length > 0 && (
                  <AccordionItem
                    key={group}
                    value={group}
                    className="mt-4 border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center gap-3"
                            onMouseEnter={() => setOpenPopoverGroup(group)}
                            onMouseLeave={() => setOpenPopoverGroup(null)}
                          >
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200 inline-block w-[4ch] text-right tabular-nums">
                              {Math.round(
                                (todos.filter((todo) => todo.completed).length /
                                  todos.length) *
                                  100
                              )}
                              %
                            </span>
                            <Popover open={openPopoverGroup === group}>
                              <PopoverTrigger asChild>
                                <div className="relative w-7 h-7">
                                  <svg className="w-7 h-7 transform -rotate-90">
                                    <circle
                                      className="text-muted/100 stroke-current"
                                      strokeWidth="3"
                                      fill="none"
                                      r="11"
                                      cx="14"
                                      cy="14"
                                    />
                                    <circle
                                      className="text-primary stroke-current transition-all duration-300 ease-in-out group-hover:opacity-100 opacity-70"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      fill="none"
                                      r="11"
                                      cx="14"
                                      cy="14"
                                      strokeDasharray={`${
                                        (todos.filter((todo) => todo.completed)
                                          .length /
                                          todos.length) *
                                        69.115
                                      } 69.115`}
                                    />
                                  </svg>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-2"
                                align="end"
                                onPointerDownOutside={(e) => e.preventDefault()}
                              >
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      总计：
                                    </span>
                                    <span className="font-medium">
                                      {todos.length}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      已办：
                                    </span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                      {
                                        todos.filter((todo) => todo.completed)
                                          .length
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      未办：
                                    </span>
                                    <span className="font-medium text-orange-600 dark:text-orange-400">
                                      {
                                        todos.filter((todo) => !todo.completed)
                                          .length
                                      }
                                    </span>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <span className="text-lg font-semibold">
                            {getGroupTitle(group)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {todos.map((todo: Todo) => (
                            <motion.div
                              key={todo.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                opacity: { duration: 0.2 },
                              }}
                            >
                              <TodoItem todo={todo} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
            )}
          </Accordion>
        </>
      )}
    </div>
  );
}
