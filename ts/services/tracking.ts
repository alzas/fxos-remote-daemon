/// <reference path="../../typings/mozilla/navigator.d.ts" />

import EventDispatcher from 'classes/event-dispatcher';
import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';
import SchedulerService from 'services/scheduler';
import CameraService from 'services/camera';

class TrackingService extends EventDispatcher {
  constructor() {
    super(['started', 'stopped', 'packet']);
  }

  static isTracking() {
    return SchedulerService.isScheduled('take-picture');
  }

  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'start') {
      return this.processTrackingStart(packet.message.value);
    }

    if (packet.message.method === 'stop') {
      return this.processTrackingStop();
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  private processTrackingStart(data) {
    return new Promise<ServicePacket>((resolve) => {
      SchedulerService.schedule('take-picture', data.interval, data.type).then(
        () => {
          this.emit('started');
          resolve();
        }
      );

      SchedulerService.on('take-picture-fired', () => {
        CameraService.takePicture(data.cameraType).then((result) => {
          this.emit(
            'packet',
             new ServicePacket('camera', 'picture', null, [result.blob])
          );
        }, function (e) {
          LoggerService.error(e);
        });
      });
    });
  }

  private processTrackingStop() {
    SchedulerService.stop('take-picture');
    SchedulerService.offAll('take-picture-fired');

    this.emit('stopped');

    return Promise.resolve<ServicePacket>(null);
  }
}

export default new TrackingService();