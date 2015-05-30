/// <reference path="../../typings/mozilla/navigator.d.ts" />

class StubWifiManager implements IWifiManager {
  connectionInformation: IWifiConnectionInfo;

  constructor(address: string) {
    this.connectionInformation = {
      ipAddress: address
    };

    /*setInterval(() => {
     this.connectionInformation.ipAddress =
     this.connectionInformation.ipAddress + Date.now();
     if (this.onconnectioninfoupdate) {
     this.onconnectioninfoupdate();
     }
     }, 2000);*/
  }

  onenabled() {}
  ondisabled() {}
  onstatuschange() {}
  onconnectioninfoupdate() {}
  onstationinfoupdate() {}
}

export default navigator.mozWifiManager || new StubWifiManager('192.168.1.1');