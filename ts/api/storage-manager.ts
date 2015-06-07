/// <reference path="../../typings/mozilla/navigator.d.ts" />
import DOMRequest from 'api/dom-request';
import DOMCursor from 'api/dom-cursor';

class StubStorage implements IStorage {
  private files: Map<string, Blob>;

  constructor() {
    this.files = new Map<string, Blob>();
  }

  addNamed(content: Blob, name: string) {
    this.files.set(name, content);

    return new DOMRequest(name);
  }

  delete(name: string) {
    this.files.delete(name);

    return new DOMRequest<void>(undefined);
  }

  enumerate(path: string, options?: {since: Date}) {
    return new DOMCursor(this.files.keys());
  }
}

class StorageManager {
  private storages: Map<string, Array<IStorage>>;
  private retriever: (type: string) => IDOMRequest<Array<IStorage>>;

  constructor() {
    if (navigator.getDeviceStorages) {
      this.retriever = navigator.getDeviceStorages.bind(navigator);
    } else {
      this.storages = new Map<string, Array<IStorage>>([
        ['sdcard', [new StubStorage()]]
      ]);

      this.retriever = (type: string) => {
        return new DOMRequest(this.storages.get(type));
      }
    }
  }

  getStorages(type: string) {
    return this.retriever(type);
  }
}

export default new StorageManager();
