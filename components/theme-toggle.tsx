"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full p-1">
      {["light", "system", "dark"].map((t) => (
        <div key={t} className="relative">
          <motion.button
            onClick={() => setTheme(t)}
            className={cn(
              "relative z-10 p-1.5 rounded-full transition-colors flex items-center justify-center",
              theme === t &&
                "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
            )}
          >
            {t === "light" && <Sun className="h-3.5 w-3.5" />}
            {t === "system" && <Monitor className="h-3.5 w-3.5" />}
            {t === "dark" && <Moon className="h-3.5 w-3.5" />}
          </motion.button>
          <AnimatePresence>
            {theme === t && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {theme === t && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-green-100 dark:bg-green-800 rounded-full"
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
