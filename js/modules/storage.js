/* global Storage */

(function(exports) {
  exports.StorageModule = {
    process: function(request, responder) {
      if (request.method === 'list') {
        Storage.list('remote-daemon').then(function(files) {
          var page = 0;
          while(files.length) {
            var filesForPage = files.splice(0, request.pageSize);
            responder({
              type: 'storage',
              method: 'list',
              value: {
                names: filesForPage.map(function(file) {
                  return file.name.substring(file.name.lastIndexOf('/') + 1);
                }),
                page: page++,
                pageSize: request.pageSize
              }
            }, filesForPage);
          }
        });
        return;
      }

      if (request.method === 'delete') {
        Storage.delete('remote-daemon/' + request.value);
      }
    }
  };
})(window);
