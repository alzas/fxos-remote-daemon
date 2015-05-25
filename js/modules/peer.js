/* global Camera, Logger, PeerConnection */

(function(exports) {
  var getUserMedia = (
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.getUserMedia
  ).bind(navigator);

  var connection = null;

  exports.PeerModule = {
    process: function(request, responder) {
      if (request.method === 'offer') {

        if (connection) {
          connection.close();
        }

        connection = PeerConnection.create();

        Camera.release();

        var mediaConstraints = {
          video: {
            /*width: { min: 720, max: 720 },
            height: { min: 480, max: 480 },*/
            mandatory: {
              facingMode: request.facingMode
            }
          },
          audio: true
        };

        getUserMedia(mediaConstraints, function(stream) {
          Logger.log(
            'Camera retrieved (tracks: %s)',
            stream.getVideoTracks().length
          );

          connection.on('ice-candidate', function(candidate) {
            if (candidate === null) {
              var answer = connection.getLocalDescription();

              responder({
                type: 'peer',
                method: 'answer',
                value: {
                  type: answer.type,
                  sdp: answer.sdp
                }
              });
            }
          });

          connection.addStream(stream);
          connection.acceptOffer(request.value);
        }, function(e) {
          Logger.error('getUserMedia failed', e);
        });

        return;
      }

      if (request.method === 'close') {
        if (connection) {
          connection.close();
          connection = null;
        }
      }
    }
  };
})(window);
