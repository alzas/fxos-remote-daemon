(function(exports) {
  var batteryManager = navigator.battery;

  exports.BatteryModule = {
    process: function(request, responder) {
      if (request.method === 'status') {
        responder({
          type: 'battery',
          method: 'status',
          value: {
            charging: batteryManager.charging,
            level: batteryManager.level,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime
          }
        });
      }
    }
  };
})(window);
