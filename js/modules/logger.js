/* global Logger */

(function(exports) {
  exports.LoggerModule = {
    process: function(request, responder) {
       ['log', 'warn', 'error'].forEach(function(type) {
        if (request.method === 'on') {
          Logger.on(type, function(args) {
            responder({ type: 'console', method: type, args: args });
          });
        } else {
          Logger.offAll(type);
        }
      });
    }
  };
})(window);
