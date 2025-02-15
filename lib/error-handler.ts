import type { PostgrestError } from "@supabase/supabase-js";
import { RetryError } from "./retry";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof RetryError) {
    return new AppError(
      `操作失败，请稍后重试 (${error.attempts}/3)`,
      "RETRY_FAILED",
      error
    );
  }

  // Supabase 错误处理
  if (isPostgrestError(error)) {
    return handleSupabaseError(error);
  }

  // 网络错误处理
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new AppError("网络连接失败，请检查网络设置", "NETWORK_ERROR", error);
  }

  // 默认错误处理
  return new AppError(
    "发生未知错误，请稍后重试",
    "UNKNOWN_ERROR",
    error as Error
  );
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}

function handleSupabaseError(error: PostgrestError): AppError {
  switch (error.code) {
    case "23505": // 唯一约束冲突
      return new AppError(
        "该记录已存在，请勿重复添加",
        "DUPLICATE_ERROR",
        error
      );
    case "23503": // 外键约束冲突
      return new AppError(
        "无法执行此操作，相关数据不存在",
        "FOREIGN_KEY_ERROR",
        error
      );
    case "42P01": // 表不存在
      return new AppError(
        "系统配置错误，请联系管理员",
        "TABLE_NOT_FOUND",
        error
      );
    case "42501": // 权限不足
      return new AppError("您没有执行此操作的权限", "PERMISSION_DENIED", error);
    case "PGRST116": // 无效的 JWT
      return new AppError("登录已过期，请重新登录", "AUTH_ERROR", error);
    default:
      return new AppError(
        `数据库操作失败: ${error.message}`,
        "DATABASE_ERROR",
        error
      );
  }
}
