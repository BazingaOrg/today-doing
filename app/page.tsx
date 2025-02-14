import { TodoList } from "@/components/todo-list"
import { TopNavBar } from "@/components/top-nav-bar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <TodoList />
      </main>
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 To - Do List Application. Powered by v0.
        </div>
        
      </footer>
    </div>
  )
}

