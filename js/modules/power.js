/* global Logger */

(function(exports) {
  var powerManager = navigator.mozPower;

  exports.PowerModule = {
    process: function(request) {
      if (request.method === 'brightness') {
        powerManager.screenBrightness = Number.parseFloat(request.value);
        Logger.log('mozPower.screenBrightness set to %s', request.value);
        return;
      }

      if (request.method === 'screen-enabled') {
        powerManager.screenEnabled = request.value === 'true';
        Logger.log('mozPower.screenEnabled set to %s', request.value);
      }
    }
  };
})(window);
