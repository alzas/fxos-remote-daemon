export default class TransportPacket<T> {
  private internalMessage: T;
  private internalBlobs: Array<Blob>;

  constructor(message: T, blobs?: Array<Blob>) {
    this.internalMessage = message;
    this.internalBlobs = blobs;
  }

  get message(): T {
    return this.internalMessage;
  }

  get blobs() {
    return this.internalBlobs;
  }
}