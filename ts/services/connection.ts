import FxOSWebSocket from 'fxos-websocket/server.es6';

import WifiManager from 'api/wifi-manager';

import EventDispatcher from 'classes/event-dispatcher';
import Transport from 'classes/transport';
import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';

class ConnectionService extends EventDispatcher {
  private address: string;
  private connection: any;

  constructor() {
    super(['address-updated', 'packet', 'listen', 'close']);

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

    this.connection.on('message', (websocketMessage) => {
      var packet = Transport.receive(websocketMessage);

      LoggerService.log(
        'Fx-Message-Received: %s', JSON.stringify(packet.message)
      );

      this.emit('packet', packet);
    });

    this.connection.on('stop', () => {
      LoggerService.log('Fx-Connection-Closed');
      this.stopListening();
    });

    this.emit('listen');
  }

  public stopListening() {
    if (!this.connection) {
      return;
    }

    this.connection.offAll();
    this.connection.stop();
    this.connection = null;

    this.emit('close');
  }

  public send(packet: ServicePacket) {
    if (!this.connection) {
      throw new Error('Connection is not established!');
    }

    Transport.send(packet).then((websocketMessage) => {
      this.connection.send(websocketMessage);
    });
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

export default new ConnectionService();