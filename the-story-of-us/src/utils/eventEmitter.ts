// Simple event emitter for cross-component communication
class EventEmitter {
  private events: { [key: string]: Array<(...args: any[]) => void> } = {};

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(l => l !== listener);
    };
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  off(event: string, listener: (...args: any[]) => void) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
}

export const appEventEmitter = new EventEmitter();

// Event types
export const APP_EVENTS = {
  MEMORY_ADDED: 'memory_added',
  MILESTONE_UPDATED: 'milestone_updated',
  TIMELINE_REFRESH_NEEDED: 'timeline_refresh_needed',
} as const;