import TransportPacket from 'classes/transport-packet';

interface IServiceMessage {
  type: string;
  method: string;
  value?: any;
}

export default class ServicePacket extends TransportPacket<IServiceMessage> {
  constructor(type: string, method: string, value?: any, blobs?: any) {
    super({
      type: type,
      method: method,
      value: value
    }, blobs);
  }
}