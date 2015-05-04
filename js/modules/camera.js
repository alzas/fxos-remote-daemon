/* global Camera, Logger, EventDispatcher, Scheduler */

(function(exports) {
  exports.CameraModule = EventDispatcher.mixin({
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

      if (request.method === 'tracking-start') {
        Scheduler.schedule(
          'take-picture', request.value.interval, request.value.type
        ).then(() => this.emit('tracking-scheduled'));

        Scheduler.on('take-picture-fired', function() {
          Camera.takePicture(Camera.Types.BACK).then(function(result) {
            responder({
              type: 'camera',
              method: 'picture'
            }, [result.blob]);
          }, function (e) {
            Logger.error(e);
          });
        });

        return;
      }

      if (request.method === 'tracking-stop') {
        Scheduler.stop('take-picture');
        Scheduler.offAll('take-picture-fired');

        this.emit('tracking-stopped');

        return;
      }
    }
  });
})(window);
