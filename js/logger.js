/* global EventDispatcher */

(function(exports) {
  'use strict';

  var consoleMethods = ['log', 'warn', 'error'];

  exports.Logger = consoleMethods.reduce(function(logger, methodName) {
    logger[methodName] = function() {
      var args = [...arguments];

      this.emit(methodName, args);

      console[methodName].apply(console, args);
    };

    return logger;
  }, EventDispatcher.mixin({}, consoleMethods));
})(window);
