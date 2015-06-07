/// <reference path="../../typings/mozilla/window.d.ts" />

import EventDispatcher from 'classes/event-dispatcher';

var RTCPeerConnection = window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;

var RTCSessionDescription = window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription;

export default class PeerConnection extends EventDispatcher {
  private connection: IRTCPeerConnection;

  constructor() {
    super(['add-stream', 'ice-candidate', 'signaling-state-change']);

    this.connection = new RTCPeerConnection({
      iceServers: [{
        url: 'stun:stun.l.google.com:19302',
        urls: 'stun:stun.l.google.com:19302'
      }]
    });

    this.connection.addEventListener(
      'icecandidate',
      (e: IRTCPeerConnectionIceEvent) => {
        this.emit('ice-candidate', e.candidate);
      }
    );

    this.connection.addEventListener(
      'addstream',
      (e: IMediaStreamEvent) => {
        this.emit('add-stream', e.stream);
      }
    );

    this.connection.addEventListener(
      'signalingstatechange',
      (e) => {
        this.emit('signaling-state-change', e);
      }
    );
  }

  public getLocalDescription() {
    return this.connection.localDescription;
  }

  public addStream(stream: IMediaStream) {
    this.connection.addStream(stream);
  }

  public createOffer(options: IRTCOfferOptions) {
    return new Promise((resolve, reject) => {
      this.connection.createDataChannel('data-channel');

      this.connection.createOffer((localDescription) => {
        this.connection.setLocalDescription(localDescription, () => {
          resolve(localDescription);
        }, reject);
      }, reject, options);
    });
  }

  public acceptOffer(offer: IRTCSessionDescriptionInit) {
    return new Promise((resolve, reject) => {
      var remoteDescription = new RTCSessionDescription(offer);

      this.connection.setRemoteDescription(remoteDescription, () => {
        this.connection.createAnswer((localDescription) => {
          this.connection.setLocalDescription(localDescription, () => {
            resolve(localDescription);
          }, reject);
        }, reject);
      }, reject);
    });
  }

  public acceptAnswer(answer: IRTCSessionDescriptionInit) {
    return new Promise((resolve, reject) => {
      this.connection.setRemoteDescription(
        new RTCSessionDescription(answer), () => resolve, reject
      );
    });
  }

  public close() {
    this.connection.getLocalStreams().forEach((stream: ILocalMediaStream) => {
      // Looks like only LocalMediaStream has "stop" method
      if (typeof stream.stop === 'function') {
        stream.stop();
      }
    });

    this.connection.close();
  }
}
