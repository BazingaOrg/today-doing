"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthButton } from "./auth-button";

export function UserNav() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>;
  }

  if (!user) {
    return <AuthButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative w-9 h-9 rounded-full p-0 overflow-hidden"
        >
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
            className="w-full h-full object-cover"
            style={{ aspectRatio: "1/1" }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem className="flex flex-col items-start">
          <div className="font-medium">{user.user_metadata.full_name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 dark:text-red-400 cursor-pointer"
          onClick={signOut}
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
