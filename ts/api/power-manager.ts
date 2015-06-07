/// <reference path="../../typings/mozilla/navigator.d.ts" />

class StubPowerManager implements IPowerManager {
  screenEnabled:boolean;
  keyLightEnabled:boolean;
  screenBrightness:number;
  cpuSleepAllowed:boolean;

  constructor() {
    this.screenEnabled = true;
    this.keyLightEnabled = false;
    this.screenBrightness = 1;
    this.cpuSleepAllowed = true;
  }

  powerOff() {}

  reboot() {}
}

export default navigator.mozPower || new StubPowerManager();