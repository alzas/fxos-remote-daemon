/// <reference path="../../typings/mozilla/window.d.ts" />

interface IEventDispatcher {
  on(eventName: string, handler: () => void): void;
  off(eventName: string, handler: () => void): void;
  offAll(eventName?: string): void;
  emit(eventName: string, parameters?: any): void;
}

// Implements publish/subscribe behaviour that can be applied to any object,
// so that object can be listened for custom events. "this" context is the
// object with Map "listeners" property used to store handlers.
export default class EvenDispatcher implements IEventDispatcher {
  private listeners: Map<string, Set<(parameters?: any) => void>>;
  private allowedEvents: Array<string>;

  constructor(allowedEvents?: Array<string>) {
    if (typeof allowedEvents !== 'undefined' && !Array.isArray(allowedEvents)) {
      throw new Error('Allowed events should be a valid array of strings!');
    }

    this.allowedEvents = allowedEvents || null;

    this.listeners = new Map<string, Set<() => void>>();
  }

  /**
   * Registers listener function to be executed once event occurs.
   * @param {string} eventName Name of the event to listen for.
   * @param {function} handler Handler to be executed once event occurs.
   */
  on(eventName: string, handler: () => void) {
    EvenDispatcher.ensureValidEventName(eventName);
    this.ensureAllowedEventName(eventName);
    EvenDispatcher.ensureValidHandler(handler);

    var handlers = this.listeners.get(eventName);

    if (!handlers) {
      handlers = new Set<() => void>();
      this.listeners.set(eventName, handlers);
    }

    // Set.add ignores handler if it has been already registered
    handlers.add(handler);
  }

  /**
   * Removes registered listener for the specified event.
   * @param {string} eventName Name of the event to remove listener for.
   * @param {function} handler Handler to remove, so it won't be executed
   * next time event occurs.
   */
  off(eventName: string, handler: () => void) {
    EvenDispatcher.ensureValidEventName(eventName);
    this.ensureAllowedEventName(eventName);
    EvenDispatcher.ensureValidHandler(handler);

    var handlers = this.listeners.get(eventName);

    if (!handlers) {
      return;
    }

    handlers.delete(handler);

    if (!handlers.size) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * Removes all registered listeners for the specified event.
   * @param {string} eventName Name of the event to remove all listeners for.
   */
  offAll(eventName?: string) {
    if (typeof eventName === 'undefined') {
      this.listeners.clear();
      return;
    }

    EvenDispatcher.ensureValidEventName(eventName);
    this.ensureAllowedEventName(eventName);

    var handlers = this.listeners.get(eventName);

    if (!handlers) {
      return;
    }

    handlers.clear();

    this.listeners.delete(eventName);
  }

  /**
   * Emits specified event so that all registered handlers will be called
   * with the specified parameters.
   * @param {string} eventName Name of the event to call handlers for.
   * @param {Object} parameters Optional parameters that will be passed to
   * every registered handler.
   */
  emit(eventName: string, parameters?: any) {
    EvenDispatcher.ensureValidEventName(eventName);
    this.ensureAllowedEventName(eventName);

    var handlers = this.listeners.get(eventName);

    if (!handlers) {
      return;
    }

    handlers.forEach(function(handler) {
      try {
        handler(parameters);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private static ensureValidEventName(eventName: string) {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Event name should be a valid non-empty string!');
    }
  }

  private static ensureValidHandler(handler: () => void) {
    if (typeof handler !== 'function') {
      throw new Error('Handler should be a function!');
    }
  }

  private ensureAllowedEventName(eventName: string) {
    if (this.allowedEvents && this.allowedEvents.indexOf(eventName) < 0) {
      throw new Error('Event "' + eventName + '" is not allowed!');
    }
  }
}
