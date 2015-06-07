/// <reference path="../../typings/mozilla/navigator.d.ts" />

import PowerManager from 'api/power-manager';

import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';

class PowerService {
  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'brightness') {
      PowerManager.screenBrightness = Number.parseFloat(packet.message.value);

      LoggerService.log(
        'ScreenBrightness set to %s',
        packet.message.value
      );

      return Promise.resolve<ServicePacket>(null);
    }

    if (packet.message.method === 'screen-enabled') {
      PowerManager.screenEnabled = packet.message.value === 'true';

      LoggerService.log('ScreenEnabled set to %s', packet.message.value);

      return Promise.resolve<ServicePacket>(null);
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }
}

export default new PowerService();
