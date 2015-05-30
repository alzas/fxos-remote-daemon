interface IWifiConnectionInfo {
  ipAddress: string;
}

interface IWifiManager {
  connectionInformation: IWifiConnectionInfo;

  onenabled(): void;
  ondisabled(): void,
  onstatuschange(): void,
  onconnectioninfoupdate(): void,
  onstationinfoupdate(): void
}

interface ITcpSocket {

}

interface Navigator {
  mozWifiManager: IWifiManager,
  mozTcpSocket: ITcpSocket
}