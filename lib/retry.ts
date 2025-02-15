import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    "Failed to fetch",
    "NetworkError",
    "timeout",
    "network request failed",
    "socket hang up",
    "Database connection error",
  ],
};

export class RetryError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public attempts: number
  ) {
    super(message);
    this.name = "RetryError";
  }
}

export async function withRetry<
  T extends PostgrestResponse<any> | PostgrestSingleResponse<any>
>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = lastError.message.toLowerCase();

      // 检查是否是可重试的错误
      const isRetryable = config.retryableErrors.some((retryableError) =>
        errorMessage.includes(retryableError.toLowerCase())
      );

      if (!isRetryable || attempt === config.maxAttempts) {
        throw new RetryError(
          `操作失败，已重试 ${attempt} 次`,
          lastError,
          attempt
        );
      }

      // 计算下一次重试的延迟时间
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);
    }
  }

  // 这行代码理论上永远不会执行，但 TypeScript 需要它
  throw lastError;
}
