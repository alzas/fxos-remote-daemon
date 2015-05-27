/// <reference path="../../typings/mozilla/navigator.d.ts" />

class StubWifiManager implements WifiManager {
  connectionInformation: WifiConnectionInfo;

  constructor(address: string) {
    this.connectionInformation = {
      ipAddress: address
    };
  }

  onenabled() {}
  ondisabled() {}
  onstatuschange() {}
  onconnectioninfoupdate() {}
  onstationinfoupdate() {}
}

class ConnectionService {
  private manager: WifiManager;
  private address: string;

  constructor() {
    this.manager = navigator.mozWifiManager || new StubWifiManager('192.168');

    this.manager.onenabled = this.updateAddress.bind(this);
    this.manager.ondisabled = this.updateAddress.bind(this);
    this.manager.onstatuschange = this.updateAddress.bind(this);
    this.manager.onstationinfoupdate = this.updateAddress.bind(this);
    this.manager.onconnectioninfoupdate = this.updateAddress.bind(this);

    this.updateAddress();
  }

  public getAddress() {
    return this.address;
  }

  public enable() {}

  public disable() {}

  private updateAddress() {
    this.address = this.manager.connectionInformation.ipAddress;
  }
}

export default ConnectionService;