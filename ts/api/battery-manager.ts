/// <reference path="../../typings/mozilla/navigator.d.ts" />

class StubBatteryManager implements IBatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;

  constructor(level: number) {
    this.charging = false;
    this.chargingTime = 0;
    this.dischargingTime = 0;
    this.level = level;
  }

  removeEventListener(type: string, listener: EventListener) {}

  addEventListener(type: string, listener: EventListener) {}

  dispatchEvent(evt: Event) {
    return false;
  }
}

export default navigator.battery || new StubBatteryManager(100);