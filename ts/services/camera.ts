/// <reference path="../../typings/mozilla/navigator.d.ts" />

import CameraManager from 'api/camera-manager';

import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';
import StorageService from 'services/storage';

const CONFIG = <ICameraConfiguration> {
  mode: 'picture',
  previewSize: null,
  pictureSize: null,
  recorderProfile: 'default'
};

class CameraService {
  private cameras: Map<string, ICameraDescription>;

  constructor() {
    this.cameras = new Map<string, ICameraDescription>();
  }

  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'take-picture') {
      return this.processTakePicture(packet.message.value);
    }

    if (packet.message.method === 'flash-mode') {
      return this.processFlashMode(packet.message.value);
    }

    if (packet.message.method === 'release') {
      return this.processRelease(packet.message.value);
    }

    if (packet.message.method === 'capabilities') {
      return this.processCapabilities(packet.message.value);
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  getCamera(type: string) {
    return this.requestCamera(type, CONFIG);
  }

  takePicture(type: string) {
    return this.getCamera(type).then((camera) => {
      var date = new Date();

      var dateString = date.getDate() + '-' + date.getMonth() + '-' +
          date.getFullYear() + '_' + date.getHours() + '-' +
          date.getMinutes() + '-' + date.getSeconds();

      return camera.takePicture({
        dateTime: date.getTime() / 1000,
        pictureSize: { width: 2592, height: 1944},
        fileFormat: 'jpeg',
        rotation: 0,
        position: null
      }).then((blob) => {
        return StorageService.save('remote-daemon/' + dateString + '.jpg', blob)
          .then((path) => {
            this.release(type);
            return { blob: blob, path: path };
          });
      });
    }, function(e) {
      LoggerService.error('Error while retrieving camera', e);
    });
  }

  release(type) {
    if (type) {
      var cameraToRelease = this.cameras.get(type);

      if (!cameraToRelease) {
        return;
      }

      try {
        cameraToRelease.camera.onclose = null;
        cameraToRelease.camera.release();
      } catch(e) {
        LoggerService.error('Camera failed to release %s', type);
      }

      this.cameras.delete(type);
    } else {
      this.cameras.forEach(function(cameraDescription) {
        try {
          cameraDescription.camera.onclose = null;
          cameraDescription.camera.release();
        } catch(e) {
          LoggerService.error('Camera failed to release');
        }
      });
      this.cameras.clear();
    }
  }

  setFlashMode(type: string, mode: string) {
    return this.getCamera(type).then((camera) => {
      camera.flashMode = mode;

      LoggerService.log('mozCamera.flashMode set to %s', mode);
    }, (e) => {
      LoggerService.error('Failed to change flash mode', e);
    });
  }

  private requestCamera(type: string, config: ICameraConfiguration) {
    return new Promise<ICameraControl>((resolve, reject) => {
      var attempts = 5;

      var tryToGetCamera = () => {
        if (this.cameras.has(type)) {
          resolve(this.cameras.get(type).camera);
          return;
        }

        CameraManager.getCamera(type, config).then((result) => {
          this.cameras.set(type, result);

          result.camera.onclose = () => this.release(type);

          setTimeout(function() {
            resolve(result.camera);
          }, 1000);
        }, function(e) {
          if (e === 'HardwareClosed' && attempts) {
            LoggerService.log('Requesting camera (attempts left %s)', attempts);
            setTimeout(function() {
              attempts--;
              tryToGetCamera();
            }, 1000);
            return;
          }

          reject(e);
        });
      };

      tryToGetCamera();
    });
  }

  private processTakePicture(cameraType) {
    return this.takePicture(cameraType).then((result) => {
      return new ServicePacket('camera', 'picture', null, [result.blob]);
    }, (e) => {
      LoggerService.error('Take picture failed', e);
    });
  }

  private processFlashMode(data: { cameraType: string, flashMode: string }) {
    return this.setFlashMode(data.cameraType, data.flashMode).then(() => {
      return null;
    });
  }

  private processCapabilities(cameraType: string) {
    return this.getCamera(cameraType).then((camera) => {
      return new ServicePacket('camera', 'capabilities', camera.capabilities);
    }, function(e) {
      LoggerService.error('mozCamera.capabilities request failed', e);
    });
  }

  private processRelease(cameraType: string) {
    return new Promise((resolve) => {
      this.release(cameraType);

      resolve();
    });
  }
}

export default new CameraService();