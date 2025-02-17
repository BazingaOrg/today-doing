import { TodoList } from "@/components/todo-list";
import { TopNavBar } from "@/components/top-nav-bar";
import { DataMigration } from "@/components/data-migration";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <DataMigration />
        <TodoList />
      </main>
      <footer className="bg-muted py-4 space-y-4">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Today Doing Application. Powered by v0.
        </div>
      </footer>
    </div>
  );
}
