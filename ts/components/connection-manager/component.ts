/// <reference path="../../../typings/angular2/angular2.d.ts" />
import {Component, View} from 'angular2/angular2';
import ConnectionService from 'services/connection';

@Component({
  selector: 'connection-manager'
})

@View({
  templateUrl: 'ts/components/connection-manager/component.html'
})

class ConnectionManagerComponent {
  isConnectionEnabled: boolean;
  address: string;

  private service: ConnectionService;

  constructor() {
    this.isConnectionEnabled = false;
    this.service = new ConnectionService();
  }

  toggleConnection(toggle:boolean) {
    if (toggle) {
      this.service.enable();
    } else {
      this.service.disable();
    }

    this.isConnectionEnabled = toggle;

    this.onAddressChanged();
  }

  private onAddressChanged() {
    this.address = this.isConnectionEnabled ?
      this.service.getAddress() || 'Turn Wi-Fi on' : '';
  }
}

export default ConnectionManagerComponent;