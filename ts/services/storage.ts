/// <reference path="../../typings/mozilla/navigator.d.ts" />

import StorageManager from 'api/storage-manager';

import EventDispatcher from 'classes/event-dispatcher';
import ServicePacket from 'classes/service-packet';

import LoggerService from 'services/logger';

class StorageService extends EventDispatcher {
  constructor() {
    super(['packet']);
  }

  save(fileName: string, content: Blob) {
    var storage = StorageService.getStorage();
    return storage.addNamed(content, fileName).then((path) => {
      LoggerService.log(
          'File "%s" is successfully saved to the storage area', path
      );
      return path;
    }, function (e) {
      LoggerService.warn('Unable to write the file: %s', e);

      throw e;
    });
  }

  list(path: string): Promise<Array<File>> {
    return new Promise((resolve, reject) => {
      var files = [];
      var cursor = StorageService.getStorage().enumerate(path);

      cursor.onsuccess = function () {
        if (this.result) {
          files.push(this.result);
          this.continue();
        } else {
          resolve(files);
        }
      };

      cursor.onerror = reject;
    });
  }

  static remove(path) {
    return this.getStorage().delete(path);
  }

  process(packet: ServicePacket): Promise<ServicePacket> {
    if (packet.message.method === 'list') {
      return this.processList(packet.message.value);
    }

    if (packet.message.method === 'delete') {
      return StorageService.processDelete(packet.message.value);
    }

    return Promise.reject<ServicePacket>(new Error('Unsupported packet'));
  }

  private static getStorage() {
    return StorageManager.getStorages('sdcard')[0];
  }

  private processList(pageSize: number) {
    this.list('remote-daemon').then((files) => {
      var page = 0;
      while(files.length) {
        var filesForPage = files.splice(0, pageSize);

        var pageInfo = {
          names: filesForPage.map(function(file) {
            return file.name.substring(file.name.lastIndexOf('/') + 1);
          }),
          page: page++,
          pageSize: pageSize
        };

        this.emit(
          'packet',
           new ServicePacket('storage', 'list', pageInfo, filesForPage)
        );
      }
    });

    return Promise.resolve<ServicePacket>(null);
  }

  private static processDelete(filePath: string) {
    StorageService.remove('remote-daemon/' + filePath);

    return Promise.resolve<ServicePacket>(null);
  }
}

export default new StorageService();