/// <reference path="../../../typings/angular2/angular2.d.ts" />

import {Component, View} from 'angular2/angular2';

import ServicePacket from 'classes/service-packet';

import ConnectionService from 'services/connection';
import BatteryService from 'services/battery';
import CameraService from 'services/camera';
import PowerService from 'services/power';
import LoggerService from 'services/logger';
import StorageService from 'services/storage';
import TrackingService from 'services/tracking';
import PeerService from 'services/peer';

const PacketProcessors = new Map<string, any>([
  ['logger', LoggerService],
  ['battery', BatteryService],
  ['power', PowerService],
  ['storage', StorageService],
  ['camera', CameraService],
  ['tracking', TrackingService],
  ['peer', PeerService]
]);

@Component({
  selector: 'connection-manager'
})

@View({
  templateUrl: 'ts/components/connection-manager/component.html'
})

class ConnectionManagerComponent {
  isConnectionEnabled: boolean;
  address: string;

  constructor() {
    this.isConnectionEnabled = false;

    ConnectionService.on('address-updated', this.onAddressChanged.bind(this));

    ConnectionService.on('listen', () => {
      this.isConnectionEnabled = true;
    });

    ConnectionService.on('close', () => {
      this.isConnectionEnabled = false;
    });

    ConnectionService.on('packet', (packet: ServicePacket) => {
      var processor = PacketProcessors.get(packet.message.type);

      if (processor) {
        processor.process(packet).then((packet) => {
          if (packet) {
            ConnectionService.send(packet);
          }
        }, (e) => {
          LoggerService.error(
            'Unknown processing error: %s', e.message || e.name, e
          );
        });
      } else {
        LoggerService.error('Unsupported packet type: %s', packet.message.type);
      }
    });

    LoggerService.on('packet', (packet: ServicePacket) => {
      ConnectionService.send(packet);
    });

    StorageService.on('packet', (packet: ServicePacket) => {
      ConnectionService.send(packet);
    });

    TrackingService.on('packet', (packet: ServicePacket) => {
      ConnectionService.send(packet);
    });
  }

  toggleConnection(toggle: boolean) {
    if (toggle) {
      ConnectionService.listen();
    } else {
      ConnectionService.stopListening();
    }

    this.onAddressChanged();
  }

  private onAddressChanged() {
    this.address = this.isConnectionEnabled ?
    ConnectionService.getAddress() || 'Turn Wi-Fi on' : '';
  }
}

export default ConnectionManagerComponent;