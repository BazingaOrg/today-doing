"use client";

import { useState, useRef, useEffect } from "react";
import { type Todo, useTodoStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toggleTodo, updateTodo, deleteTodo, todos } = useTodoStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    const trimmedText = editedText.trim();
    if (trimmedText !== "") {
      const isDuplicate = todos.some(
        (t) =>
          t.id !== todo.id && t.text.toLowerCase() === trimmedText.toLowerCase()
      );

      if (isDuplicate) {
        toast({
          title: "重复的待办事项",
          description: "此待办事项已存在于您的列表中。",
          variant: "destructive",
        });
        setEditedText(todo.text);
      } else {
        updateTodo(todo.id, trimmedText);
      }
    } else {
      setEditedText(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditedText(todo.text);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    setIsPopoverOpen(false);
  };

  const handleToggle = () => {
    toggleTodo(todo.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md shadow-sm transition-colors duration-300 ease-in-out relative",
        todo.completed
          ? "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 border border-gray-200 dark:border-gray-700"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        type="button"
        className="p-1 hover:bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shrink-0"
        onClick={handleToggle}
        whileHover={
          todo.completed
            ? {
                scale: 1.2,
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.3 },
              }
            : {
                scale: 1.2,
                rotate: 360,
                transition: { duration: 0.5 },
              }
        }
      >
        <span className="text-lg leading-none select-none">
          {todo.completed ? "✅" : "⭕️"}
        </span>
      </motion.button>
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`flex-grow cursor-pointer pr-[88px] ${
            todo.completed
              ? "line-through text-muted-foreground opacity-50"
              : ""
          }`}
        >
          {todo.text}
        </span>
      )}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex gap-1"
            >
              <motion.button
                className="p-2 rounded-md hover:bg-transparent focus:outline-none"
                onClick={() => setIsEditing(true)}
                whileHover={{
                  scale: 1.2,
                  rotate: -15,
                  transition: { duration: 0.2 },
                }}
              >
                <span className="text-base leading-none select-none">✏️</span>
              </motion.button>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <motion.button
                    className="p-2 rounded-md hover:bg-transparent focus:outline-none"
                    whileHover={{
                      scale: 1.2,
                      y: [0, -2, 2, -2, 0],
                      transition: { duration: 0.3 },
                    }}
                  >
                    <span className="text-base leading-none select-none">
                      🗑️
                    </span>
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="grid gap-4 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">
                        删除待办事项？
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        此操作无法撤消。
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPopoverOpen(false)}
                      >
                        取消
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
