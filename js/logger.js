/* global EventDispatcher */

(function(exports) {
  'use strict';

  var consoleMethods = ['log', 'warn', 'error'];

  exports.Logger = consoleMethods.reduce(function(logger, methodName) {
    logger[methodName] = function() {
      var args = Array.from(arguments);

      /*if (args.length > 1) {
        var i = 1;
        stringToLog = stringToLog.replace(/%s/g, function() {
          return i < args.length ? args[i++].toString() : '%s';
        });
      }
      */

      this.emit(methodName, args);

      console[methodName].apply(console, args);
    };

    return logger;
  }, EventDispatcher.mixin({}, consoleMethods));
})(window);
