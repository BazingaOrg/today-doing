"use client";

import { Input } from "@/components/ui/input";
import { useTodoStore } from "@/lib/store";
import { UserNav } from "@/components/auth/user-nav";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, X } from "lucide-react";

const writingAnimation = `
  @keyframes writing {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }
  .animate-writing {
    animation: writing 2s ease-in-out infinite;
    display: inline-block;
  }
`;

export function TopNavBar() {
  const { setSearchQuery } = useTodoStore();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchQuery("");
  };

  return (
    <>
      <style jsx>{writingAnimation}</style>
      <nav className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 max-w-4xl">
          <div className="w-full max-w-[min(calc(100vw-2rem),896px)] mx-auto flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold shrink-0">
                <span className="animate-writing">
                  <FileText className="h-6 w-6" />
                </span>
              </h1>
              <div className="relative flex-grow">
                <Input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="搜索待办..."
                  className="pl-10 pr-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <motion.span
                    className="text-base leading-none select-none cursor-pointer text-muted-foreground"
                    whileHover={{
                      scale: 1.2,
                      rotate: [-10, 10, -10, 10, 0],
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.span>
                </div>
                <AnimatePresence>
                  {searchValue && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <motion.span
                        className="text-base leading-none select-none cursor-pointer text-muted-foreground"
                        onClick={clearSearch}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{
                          scale: 1.2,
                          rotate: 90,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <X className="h-4 w-4" />
                      </motion.span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
