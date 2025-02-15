type QueueAction = {
  type: "ADD" | "UPDATE" | "DELETE" | "TOGGLE";
  payload: any;
  timestamp: number;
};

class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueueAction[] = [];
  private readonly QUEUE_KEY = "todo-offline-queue";

  private constructor() {
    this.loadQueue();
  }

  public static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private loadQueue() {
    try {
      const savedQueue = localStorage.getItem(this.QUEUE_KEY);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error("Error loading offline queue:", error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Error saving offline queue:", error);
    }
  }

  public addToQueue(action: Omit<QueueAction, "timestamp">) {
    this.queue.push({
      ...action,
      timestamp: Date.now(),
    });
    this.saveQueue();
  }

  public getQueue(): QueueAction[] {
    return [...this.queue];
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  public removeFromQueue(timestamp: number) {
    this.queue = this.queue.filter((item) => item.timestamp !== timestamp);
    this.saveQueue();
  }
}

export const offlineQueue = OfflineQueue.getInstance();
