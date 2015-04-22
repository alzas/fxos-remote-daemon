/* global Logger */
(function(exports) {
  function getDeviceStorage() {
    return navigator.getDeviceStorages('sdcard')[0];
  }

  var Storage = {
    save: function (fileName, content) {
      var storage = getDeviceStorage();

      return storage.addNamed(content, fileName).then(function (path) {
        Logger.log(
          'File "%s" is successfully saved to the storage area', path
        );
        return path;
      }, function (e) {
        Logger.warn('Unable to write the file: %s', e);

        throw e;
      });
    },

    list: function (path) {
      return new Promise(function (resolve, reject) {
        var files = [];
        var cursor = getDeviceStorage().enumerate(path);

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
    },

    delete: function(path) {
      return getDeviceStorage().delete(path);
    }
  };

  exports.Storage = Storage;
})(window);
