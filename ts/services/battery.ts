/// <reference path="../../typings/mozilla/navigator.d.ts" />

import BatteryManager from 'api/battery-manager';

import ServicePacket from 'classes/service-packet';

class BatteryService {
  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'status') {
      return BatteryService.processStatus();
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  private static processStatus() {
    return Promise.resolve(
      new ServicePacket('battery', 'status', {
        charging: BatteryManager.charging,
        level: BatteryManager.level,
        chargingTime: BatteryManager.chargingTime,
        dischargingTime: BatteryManager.dischargingTime
      })
    );
  }
}

export default new BatteryService();