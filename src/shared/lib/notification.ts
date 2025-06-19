export interface NotificationOptions {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, NotificationOptions> = new Map();
  private listeners: Set<(notifications: NotificationOptions[]) => void> =
    new Set();

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public show(options: NotificationOptions): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.notifications.set(id, options);
    this.notifyListeners();

    if (options.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, options.duration || 5000);
    }

    return id;
  }

  public remove(id: string): void {
    if (this.notifications.delete(id)) {
      this.notifyListeners();
    }
  }

  public clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  public subscribe(
    listener: (notifications: NotificationOptions[]) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const notifications = Array.from(this.notifications.values());
    this.listeners.forEach((listener) => listener(notifications));
  }

  public success(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: "success", duration });
  }

  public error(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: "error", duration });
  }

  public info(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: "info", duration });
  }

  public warning(title: string, message: string, duration?: number): string {
    return this.show({ title, message, type: "warning", duration });
  }
}

export const notificationService = NotificationService.getInstance();
