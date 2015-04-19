/* global Logger */

(function(exports) {
  'use strict';

  const CONFIG = {
    mode: 'picture'
    /*previewSize:{
      height: 480,
      width: 720
    },
    recorderProfile: '480p'*/
  };

  const cameras = new Map();

  function getCamera(type, config) {
    var attempts = 5;
    function requestCamera(resolve, reject) {
      if (cameras.has(type)) {
        resolve(cameras.get(type).camera);
        return;
      }

      navigator.mozCameras.getCamera(type, config).then(function(result) {
        // There is no any track on camera-media-stream
        cameras.set(type, result);

        result.camera.flashMode = 'on';

        setTimeout(function() {
          resolve(result.camera);
        }, 1000);
      }, function(e) {
        if (e === 'HardwareClosed' && attempts) {
          Logger.log('Requesting camera (attempts left %s)', attempts);
          setTimeout(function() {
            attempts--;
            requestCamera(resolve, reject);
          }, 1000);
          return;
        }

        reject(e);
      });
    }

    return new Promise(function(resolve, reject) {
      requestCamera(resolve, reject);
    });
  }

  function takePicture(camera) {
    return camera.takePicture({
      dateTime: Date.now() / 1000,
      pictureSize: { width: 2592, height: 1944},
      fileFormat: 'jpeg',
      rotation: 0
    }).then(function(blob) {
      return savePicture(blob).then(function(path) {
        camera.resumePreview();
        return { blob: blob, path: path };
      });
    });
  }

  function savePicture(blob) {
    var sdCard = navigator.getDeviceStorages('sdcard')[0];
    var fileName = 'remote-daemon/' + Date.now() + '.jpg';

    return sdCard.addNamed(blob, fileName).then(function(path) {
      Logger.log(
        'File "%s" successfully wrote on the sdCard storage area', path
      );
      return path;
    }, function(e) {
      Logger.warn('Unable to write the file: %s', e);

      throw e;
    });
  }

  exports.Camera = {
    Types: navigator.mozCameras.getListOfCameras().reduce(
      function(types, type) {
        console.log('Camera type available: %s', type);
        types[type.toUpperCase()] = type;
        return types;
      },
      {}
    ),

    getCamera: function(camera) {
      return getCamera(camera, CONFIG);
    },

    takePicture: function(camera) {
      return getCamera(camera, CONFIG).then(takePicture, function(e) {
        Logger.error('Error while retrieving camera', e);
      });
    },

    release: function(type) {
      if (type) {
        cameras.get(type).release();
        cameras.delete(type);
      } else {
        cameras.forEach(function(info) {
          info.camera.release();
        });
        cameras.clear();
      }
    }
  };
})(window);
