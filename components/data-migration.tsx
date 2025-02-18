"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface LocalTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface DuplicateGroup {
  text: string;
  todos: Array<{ todo: LocalTodo; source: "local" | "remote" }>;
}

export function DataMigration() {
  const [localTodos, setLocalTodos] = useState<LocalTodo[]>([]);
  const [showMigration, setShowMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("todo-storage");
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.state && Array.isArray(data.state.todos)) {
          setLocalTodos(data.state.todos);
          setShowMigration(true);
        }
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  }, []);

  const findDuplicates = async (localTodos: LocalTodo[]) => {
    if (!user) return [];

    // 获取远程待办事项
    const { data: remoteTodos } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id);

    if (!remoteTodos) return [];

    // 按文本内容分组，找出重复项
    const groups = new Map<string, DuplicateGroup>();

    // 添加本地待办事项到分组
    localTodos.forEach((todo) => {
      const key = todo.text.toLowerCase().trim();
      if (!groups.has(key)) {
        groups.set(key, { text: todo.text, todos: [] });
      }
      groups.get(key)!.todos.push({ todo, source: "local" });
    });

    // 添加远程待办事项到分组
    remoteTodos.forEach((todo) => {
      const key = todo.text.toLowerCase().trim();
      if (!groups.has(key)) {
        groups.set(key, { text: todo.text, todos: [] });
      }
      groups.get(key)!.todos.push({
        todo: {
          id: todo.id,
          text: todo.text,
          completed: todo.completed,
          createdAt: todo.created_at,
        },
        source: "remote",
      });
    });

    // 只返回有重复的组
    return Array.from(groups.values()).filter(
      (group) => group.todos.length > 1
    );
  };

  const handleMigration = async () => {
    if (!user) return;

    setIsMigrating(true);
    try {
      // 检查重复项
      const duplicateGroups = await findDuplicates(localTodos);

      if (duplicateGroups.length > 0) {
        setDuplicates(duplicateGroups);
        toast({
          title: "⚠️ 发现重复待办事项",
          description: "请检查并选择如何处理重复的待办事项。",
          variant: "default",
        });
        return;
      }

      // 转换数据格式
      const migratedTodos = localTodos.map((todo) => ({
        text: todo.text,
        completed: todo.completed,
        user_id: user.id,
        created_at: todo.createdAt,
      }));

      // 批量插入数据
      const { error } = await supabase.from("todos").insert(migratedTodos);

      if (error) throw error;

      // 清除本地存储
      localStorage.removeItem("todo-storage");

      toast({
        title: "✨ 数据迁移成功",
        description: `✅ 已成功迁移 ${localTodos.length} 个待办事项。`,
        variant: "success",
      });

      // 刷新页面以显示新数据
      window.location.reload();
    } catch (error) {
      toast({
        title: "❌ 迁移失败",
        description: "数据迁移过程中出现错误，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
      setShowMigration(false);
    }
  };

  const handleDuplicateResolution = async (
    action: "keep-all" | "keep-local" | "keep-remote" | "merge"
  ) => {
    if (!user) return;

    setIsMigrating(true);
    try {
      let todosToMigrate = [...localTodos];

      switch (action) {
        case "keep-all":
          // 保留所有待办事项，不做处理
          break;
        case "keep-local":
          // 只保留本地的，删除远程的重复项
          for (const group of duplicates) {
            const remoteTodos = group.todos
              .filter((t) => t.source === "remote")
              .map((t) => t.todo.id);
            if (remoteTodos.length > 0) {
              await supabase.from("todos").delete().in("id", remoteTodos);
            }
          }
          break;
        case "keep-remote":
          // 只保留远程的，从本地列表中移除重复项
          todosToMigrate = localTodos.filter((localTodo) => {
            return !duplicates.some((group) =>
              group.todos.some(
                (t) =>
                  t.source === "remote" &&
                  t.todo.text.toLowerCase().trim() ===
                    localTodo.text.toLowerCase().trim()
              )
            );
          });
          break;
        case "merge":
          // 合并重复项，保留最早的创建时间和完成状态
          todosToMigrate = localTodos.filter((localTodo) => {
            const group = duplicates.find(
              (g) =>
                g.text.toLowerCase().trim() ===
                localTodo.text.toLowerCase().trim()
            );
            if (!group) return true;

            const allTodos = group.todos.map((t) => t.todo);
            const earliestTodo = allTodos.reduce((earliest, current) => {
              return new Date(current.createdAt) < new Date(earliest.createdAt)
                ? current
                : earliest;
            });

            // 如果本地待办事项不是最早的，则不迁移
            return localTodo.createdAt === earliestTodo.createdAt;
          });
          break;
      }

      // 迁移处理后的待办事项
      if (todosToMigrate.length > 0) {
        const migratedTodos = todosToMigrate.map((todo) => ({
          text: todo.text,
          completed: todo.completed,
          user_id: user.id,
          created_at: todo.createdAt,
        }));

        const { error } = await supabase.from("todos").insert(migratedTodos);
        if (error) throw error;
      }

      // 清除本地存储
      localStorage.removeItem("todo-storage");

      toast({
        title: "✨ 数据迁移成功",
        description: "✅ 已成功处理重复项并迁移数据。",
        variant: "success",
      });

      // 刷新页面以显示新数据
      window.location.reload();
    } catch (error) {
      toast({
        title: "❌ 迁移失败",
        description: "处理重复项时出现错误，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
      setShowMigration(false);
      setDuplicates([]);
    }
  };

  if (!showMigration || !user || localTodos.length === 0) {
    return null;
  }

  if (duplicates.length > 0) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>发现重复的待办事项</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                发现 {duplicates.length}{" "}
                个重复的待办事项。请选择如何处理这些重复项：
              </p>
              <div className="mt-4 space-y-2">
                {duplicates.map((group, index) => (
                  <div
                    key={index}
                    className="border rounded p-2 bg-muted/50 space-y-1"
                  >
                    <div className="font-medium">{group.text}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {group.todos.map((item, i) => (
                        <div key={i}>
                          {item.source === "local" ? "本地" : "远程"} -{" "}
                          {format(new Date(item.todo.createdAt), "PPP", {
                            locale: zhCN,
                          })}
                          {item.todo.completed ? " (已完成)" : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleDuplicateResolution("keep-all")}
              disabled={isMigrating}
            >
              保留所有
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDuplicateResolution("keep-local")}
              disabled={isMigrating}
            >
              保留本地
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDuplicateResolution("keep-remote")}
              disabled={isMigrating}
            >
              保留远程
            </Button>
            <Button
              variant="default"
              onClick={() => handleDuplicateResolution("merge")}
              disabled={isMigrating}
            >
              智能合并
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={showMigration} onOpenChange={setShowMigration}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>发现本地数据</AlertDialogTitle>
          <AlertDialogDescription>
            检测到您有 {localTodos.length} 个存储在本地的待办事项。
            是否要将它们迁移到云端？迁移后您可以在任何设备上访问这些数据。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>暂不迁移</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMigration}
            disabled={isMigrating}
            className="bg-primary"
          >
            {isMigrating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              "开始迁移"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
