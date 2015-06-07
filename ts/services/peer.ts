/// <reference path="../../typings/mozilla/navigator.d.ts" />

import BatteryManager from 'api/battery-manager';

import PeerConnection from 'classes/peer-connection';
import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';
import CameraService from 'services/camera';

var getUserMedia = (
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.getUserMedia
).bind(navigator);

function facingModeToCameraType(facingMode: string) {
  switch(facingMode) {
    case 'environment':
      return 'back';
    case 'user':
      return 'front';
    default:
      return facingMode;
  }
}

class PeerService {
  connection: PeerConnection;

  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'offer') {
      return this.processOffer(packet.message.value);
    }

    if (packet.message.method === 'close') {
      return this.processClose();
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  private processOffer(
    data: { facingMode: string, offer: IRTCSessionDescriptionInit}
  ) {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        this.connection.close();
      }

      this.connection = new PeerConnection();

      CameraService.release(facingModeToCameraType(data.facingMode));

      var mediaConstraints = {
        video: {
          /*width: { min: 720, max: 720 },
           height: { min: 480, max: 480 },*/
          mandatory: {
            facingMode: data.facingMode
          }
        },
        audio: true
      };

      getUserMedia(mediaConstraints, (stream) => {
        LoggerService.log(
          'Camera retrieved (tracks: %s)',
          stream.getVideoTracks().length
        );

        this.connection.on('ice-candidate', (candidate) => {
          if (candidate === null) {
            var answer = this.connection.getLocalDescription();

            resolve(
              new ServicePacket(
                'peer', 'answer', { type: answer.type, sdp: answer.sdp }
              )
            );
          }
        });

        this.connection.addStream(stream);
        this.connection.acceptOffer(data.offer);
      }, function(e) {
        LoggerService.error('getUserMedia failed', e);
        reject(e);
      });
    });
  }

  private processClose() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    return Promise.resolve<ServicePacket>(null);
  }
}

export default new PeerService();
