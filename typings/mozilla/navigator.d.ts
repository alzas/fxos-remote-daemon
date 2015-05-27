interface WifiConnectionInfo {
  ipAddress: string;
}

interface WifiManager {
  connectionInformation: WifiConnectionInfo;

  onenabled(): void;
  ondisabled(): void,
  onstatuschange(): void,
  onconnectioninfoupdate(): void,
  onstationinfoupdate(): void
}

interface Navigator {
  mozWifiManager: WifiManager
}