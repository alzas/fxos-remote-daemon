/* global Camera, Logger */

(function(exports) {
  exports.CameraModule = {
    process: function(request, responder) {
      if (request.method === 'take-picture') {
        Camera.takePicture(Camera.Types.BACK).then(function(result) {
          responder({
            type: 'camera',
            method: 'picture'
          }, [result.blob]);
        }, function(e) {
          Logger.error('Take picture failed', e);
        });
        return;
      }

      if (request.method === 'flash-mode') {
        Camera.getCamera(Camera.Types.BACK).then(function(camera) {
          camera.flashMode = request.value;
          Logger.log('mozCamera.flashMode set to %s', request.value);
        });
        return;
      }

      if (request.method === 'capabilities') {
        Camera.getCamera(Camera.Types.BACK).then(function(camera) {
          responder({
            type: 'camera',
            method: 'capabilities',
            value: camera.capabilities
          });
        }, function(e) {
          Logger.error('mozCamera.capabilities request failed', e);
        });
        return;
      }
    }
  };
})(window);
