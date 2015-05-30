import WifiManager from 'api/wifi-manager';
import EventDispatcher from 'classes/event-dispatcher';
import FxOSWebSocket from 'fxos-websocket/server.es6';
import Transport from 'classes/transport';
import Logger from 'classes/logger';

class ConnectionService extends EventDispatcher {
  private address: string;
  private connection: any;

  constructor() {
    super(['address-updated', 'request', 'listen', 'close']);

    WifiManager.onenabled = this.updateAddress.bind(this);
    WifiManager.ondisabled = this.updateAddress.bind(this);
    WifiManager.onstatuschange = this.updateAddress.bind(this);
    WifiManager.onstationinfoupdate = this.updateAddress.bind(this);
    WifiManager.onconnectioninfoupdate = this.updateAddress.bind(this);

    this.updateAddress();
  }

  public getAddress() {
    return this.address;
  }

  public listen() {
    if (!this.address) {
      throw new Error('WiFi Connection is not established!');
    }

    if (this.connection) {
      return;
    }

    this.connection = new FxOSWebSocket.Server(8008);

    this.connection.on('message', (e) => {
      var request = Transport.receive(e).message;

      Logger.log('Fx-Message-Received: %s', JSON.stringify(request));

      this.emit('request', request);
    });

    this.connection.on('stop', () => {
      Logger.log('Fx-Connection-Closed');
      this.close();
    });

    this.emit('listen');
  }

  public close() {
    if (!this.connection) {
      return;
    }

    this.connection.offAll();
    this.connection.stop();
    this.connection = null;

    this.emit('close');
  }

  private updateAddress() {
    if (WifiManager.connectionInformation) {
      this.address = WifiManager.connectionInformation.ipAddress;
    } else {
      this.address = '';
    }

    this.emit('address-updated', this.address);
  }
}

export default ConnectionService;