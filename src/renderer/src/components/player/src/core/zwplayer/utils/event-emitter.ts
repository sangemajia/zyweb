class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.events[event]) return;

    const index = this.events[event].indexOf(callback);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;

    // 复制数组以避免在迭代过程中修改数组
    const callbacks = [...this.events[event]];
    for (const callback of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
  }

  once(event: string, callback: Function): void {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      callback(...args);
    };

    this.on(event, onceWrapper);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }
}

export { EventEmitter };
