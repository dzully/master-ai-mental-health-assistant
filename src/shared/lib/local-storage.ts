class LocalStorageService {
  private static instance: LocalStorageService;
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private checkAvailability(): boolean {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false;

    try {
      const serializedValue = JSON.stringify(value, (key, val) => {
        if (val instanceof Date) {
          return { __type: "Date", value: val.toISOString() };
        }
        return val;
      });
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error("Failed to set localStorage item:", error);
      return false;
    }
  }

  public getItem<T>(key: string): T | null {
    if (!this.isAvailable) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      return JSON.parse(item, (key, value) => {
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      });
    } catch (error) {
      console.error("Failed to get localStorage item:", error);
      return null;
    }
  }

  public removeItem(key: string): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove localStorage item:", error);
      return false;
    }
  }

  public clear(): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  }

  public getKeys(): string[] {
    if (!this.isAvailable) return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error("Failed to get localStorage keys:", error);
      return [];
    }
  }

  public isStorageAvailable(): boolean {
    return this.isAvailable;
  }
}

export const localStorageService = LocalStorageService.getInstance();
