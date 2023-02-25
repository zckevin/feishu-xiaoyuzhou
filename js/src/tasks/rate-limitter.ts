export class RateLimitter {
  #history = new Map<string, number>()
  #cleanInterval: NodeJS.Timer

  constructor() {
    const CLEAN_INTERVAL = 60 * 1000 * 5;
    this.#cleanInterval = setInterval(() => {
      for (const [key, expiration] of this.#history) {
        if (expiration <= new Date().getTime()) {
          this.#history.delete(key);
        }
      }
    }, CLEAN_INTERVAL);
  }

  private exists(key: string): boolean {
    const expiration = this.#history.get(key);
    if (expiration && expiration > new Date().getTime()) {
      return true;
    }
    return false;
  }

  Close() {
    clearInterval(this.#cleanInterval);
  }

  AddKey(key: string, duration: number = 60 * 1000): boolean {
    if (this.exists(key)) {
      return false;
    }
    this.#history.set(key, new Date().getTime() + duration);
    return true;
  }
}