/// <reference path="core.d.ts" />

declare module "fxos-websocket/server.es6" {
  var Server: {
    new (port: number);
    prototype: {
      on(eventName: string, handler: () => void): void;
    }
  };

  var Utils: {
    stringToArray: (input: string) => Uint8Array;
    writeUInt16: (array: Uint8Array, value: number, offset: number) => void;
  };

  export default {
    Server: Server,
    Utils: Utils
  };
}

interface IRTCIceCandidate {
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

interface IRTCDataChannel {

}

interface IRTCDataChannelInit {
  // Default: true;
  ordered: boolean;
  maxRetransmitTime?: number;
  maxRetransmits?: number;
  protocol: string;
  // Default: false, spec currently says 'true'; we disagree
  negotiated: boolean;
  id?: number;
}

interface IDeprecatedRTCOfferOptionsSet {

}

interface IRTCOfferOptions {
  // Number of streams to receive
  offerToReceiveVideo: number;
  offerToReceiveAudio: number;
  mozDontOfferDataChannel: boolean;
  mozBundleOnly: boolean;
  // TODO: Remove old constraint-like RTCOptions support soon (Bug 1064223).
  mandatory: IDeprecatedRTCOfferOptionsSet;
  _optional?: Array<IDeprecatedRTCOfferOptionsSet>;
}

interface IRTCPeerConnectionIceEvent extends Event {
  candidate: IRTCIceCandidate
}

interface IMediaStreamEvent extends Event {
  stream?: IMediaStream
}

interface IRTCIceServer {
  // v2.2 doesn't support this.
  urls: string | Array<string>;
  // Deprecated!!!
  url: string;
  credential?: string;
  username?: string;
}

interface IRTCConfiguration {
  iceServers: Array<IRTCIceServer>;
  peerIdentity?: string;
}

interface IRTCPeerConnection extends EventTarget {
  new(config: IRTCConfiguration);

  localDescription: IRTCSessionDescription;

  addStream: (stream: IMediaStream) => void;
  createDataChannel: (name: string, config?: IRTCDataChannelInit) => IRTCDataChannel;

  // Gecko returns promise now.
  createOffer: (
    successCallback: (sdp: IRTCSessionDescription) => void,
    failCallback: (error: DOMError) => void,
    options?: IRTCOfferOptions
  ) => void;

  createAnswer: (
    successCallback: (sdp: IRTCSessionDescription) => void,
    failCallback: (error: DOMError) => void
  ) => void;

  setLocalDescription: (
    description: IRTCSessionDescription,
    successCallback: () => void,
    failCallback: (error: DOMError) => void
  ) => void;

  setRemoteDescription: (
      description: IRTCSessionDescription,
      successCallback: () => void,
      failCallback: (error: DOMError) => void
  ) => void;

  getLocalStreams: () => Array<IMediaStream>
  getRemoteStreams: () => Array<IMediaStream>,

  close: () => void;
}

interface IRTCSessionDescriptionInit {
  // "offer", "pranswer", "answer"
  type?: string;
  sdp?: string;
}

interface IRTCSessionDescription extends IRTCSessionDescriptionInit {
  new(description?: IRTCSessionDescriptionInit);
}

interface Window {
  RTCPeerConnection: IRTCPeerConnection;
  mozRTCPeerConnection: IRTCPeerConnection;
  webkitRTCPeerConnection: IRTCPeerConnection;

  RTCSessionDescription: IRTCSessionDescription;
  mozRTCSessionDescription: IRTCSessionDescription;
  webkitRTCSessionDescription: IRTCSessionDescription;
}
