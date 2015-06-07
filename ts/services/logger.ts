import EventDispatcher from 'classes/event-dispatcher';

import ServicePacket from 'classes/service-packet';

class LoggerService extends EventDispatcher {
  private broadcastEnabled: boolean;

  constructor() {
    super(['packet']);

    this.broadcastEnabled = false;
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

  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'on') {
      this.broadcastEnabled = true;

      return Promise.resolve<ServicePacket>(null);
    }

    if (packet.message.method === 'off') {
      this.broadcastEnabled = false;

      return Promise.resolve<ServicePacket>(null);
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  private internalLog(method: string, parameters: any[]) {
    if (this.broadcastEnabled) {
      this.emit(
        'packet',
         new ServicePacket(
           'logger', 'log', { method: method, args: parameters }
         )
      );
    }

    console[method].apply(console, parameters);
  }
}

export default new LoggerService();