"use client";

import React from "react";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("错误边界捕获到错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-4">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            哎呀！出了点问题{" "}
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-muted-foreground max-w-md">
            {this.state.error?.message ||
              "发生了一个错误，但我们正在努力修复它。"}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            重试
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
