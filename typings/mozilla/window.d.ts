interface ArrayConstructor {
  from<T>(any): Array<T>;
}

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
