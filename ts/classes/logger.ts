import EventDispatcher from 'classes/event-dispatcher';

class Logger extends EventDispatcher {
  constructor() {
    super(['log', 'warn', 'error']);
  }

  log(...args: any[]) {
    this.internalLog('log', args);
  }

  error(...args: any[]) {
    this.internalLog('log', args);
  }

  warn(...args: any[]) {
    this.internalLog('log', args);
  }

  private internalLog(method: string, parameters: any[]) {
    var args = Array.from(arguments);

    this.emit(method, args);

    console[method].apply(console, args);
  }
}

export default new Logger();