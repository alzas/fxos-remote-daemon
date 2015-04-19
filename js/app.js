/* global Camera,
          Logger,
          PeerConnection,
          Transport,
          FxOSWebSocket
*/

(function(exports) {
  'use strict';

  var stopAlarms = false;

  var getUserMedia = (
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.getUserMedia
  ).bind(navigator);

  var connections = window.connections = {
    websocket: null,
    peer: null
  };

  function send(applicationMessage, blobs) {
    Transport.send(applicationMessage, blobs).then(function(dataToSend) {
      connections.websocket.send(dataToSend);
    });
  }

  function onWebSocketMessage(e) {
    var data = Transport.receive(e);
    var request = data.message;

    Logger.log('WebSocketMessage %s', JSON.stringify(data.message));

    if (request.type === 'logger') {
      ['log', 'warn', 'error'].forEach(function(type) {
        if (request.method === 'on') {
          Logger.on(type, function(args) {
            send({ type: 'console', method: type, args: args });
          });
        } else {
          Logger.offAll(type);
        }
      });
      return;
    }

    if (request.type === 'power') {
      if (request.method === 'brightness') {
        navigator.mozPower.screenBrightness = Number.parseFloat(
          request.value
        );
        Logger.log('mozPower.screenBrightness set to %s', request.value);
        return;
      }

      if (request.method === 'screen-enabled') {
        navigator.mozPower.screenEnabled = request.value === 'true';
        Logger.log('mozPower.screenEnabled set to %s', request.value);
        return;
      }

      return;
    }

    if (request.type === 'battery-status') {
      send({
        type: 'battery-status',
        value: {
          charging: navigator.battery.charging,
          level: navigator.battery.level,
          chargingTime: navigator.battery.chargingTime,
          dischargingTime: navigator.battery.dischargingTime
        }
      });
      return;
    }

    if (request.type === 'camera') {
      if (request.method === 'take-picture') {
        Camera.takePicture(Camera.Types.BACK).then(function(result) {
          send({
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
          send({
            type: 'camera',
            method: 'capabilities',
            value: camera.capabilities
          });
        }, function(e) {
          Logger.error('mozCamera.capabilities request failed', e);
        });
        return;
      }

      return;
    }

    if (request.type === 'peer') {
      if (request.method === 'offer') {

        if (connections.peer) {
          connections.peer.close();
        }

        connections.peer = PeerConnection.create();

        Camera.release();

        /*Camera.getCamera(Camera.Types.BACK).then(function(stream) {
          Logger.log(
            'Camera retrieved (tracks: %s)',
            stream.getVideoTracks().length
          );

          connections.peer.on('ice-candidate', function(candidate) {
            if (candidate === null) {
              var answer = connections.peer.getLocalDescription();

              send({
                type: 'peer',
                method: 'answer',
                value: {
                  type: answer.type,
                  sdp: answer.sdp
                }
              });
            }
          });

         /!* previewVideo.mozSrcObject = stream;
          previewVideo.play();*!/

          setTimeout(function() {
            try {
              connections.peer.addStream(stream);
            } catch(e) {
              Logger.error('Failed to add camera stream to peer connection', e);
            }

           /!* try {
              connections.peer.addTrack(stream.getVideoTracks()[1], stream);
            } catch(e) {
              Logger.error(
                'Failed to add 2 camera stream to peer connection', e
              );
            }*!/

            connections.peer.acceptOffer(request.value);
          }, 3000);
        }, function(e) {
          Logger.error('mozCameras.getCamera failed', e);
        });*/

        var mediaConstraints = {
          video: {
            /*width: { min: 720, max: 720 },
            height: { min: 480, max: 480 },*/
            mandatory: {
              facingMode: request.facingMode
            }
          }
        };

        getUserMedia(mediaConstraints, function(stream) {
          Logger.log(
            'Camera retrieved (tracks: %s)',
            stream.getVideoTracks().length
          );

          connections.peer.on('ice-candidate', function(candidate) {
            if (candidate === null) {
              var answer = connections.peer.getLocalDescription();

              send({
                type: 'peer',
                method: 'answer',
                value: {
                  type: answer.type,
                  sdp: answer.sdp
                }
              });
            }
          });


         /* var previewVideo = document.querySelector('.photo-preview');
          previewVideo.mozSrcObject = stream;
          previewVideo.play();*/

          connections.peer.addStream(stream);
          connections.peer.acceptOffer(request.value);
        }, function(e) {
          Logger.error('getUserMedia failed', e);
        });

        return;
      }

      if (request.method === 'close') {
        if (connections.peer) {
          connections.peer.close();
          connections.peer = null;
        }

        return;
      }

      return;
    }
  }

  function addAlarm(interval, type) {
    return new Promise(function(resolve, reject) {
      var nextDate = getNextDate(interval, type);

      var request = navigator.mozAlarms.add(
        nextDate, 'honorTimezone', { interval: interval, type: type }
      );

      request.onsuccess = function() {
        Logger.log('Scheduled new alarm at: %s', nextDate);

        resolve({
          id: this.result,
          date: nextDate
        });
      };

      request.onerror = function() {
        Logger.error('Schedule failed', this.error);

        reject(this.error);
      };
    });
  }

  function getNextDate(value, type) {
    var now = new Date();

    switch(type) {
      case 'sec':
        now.setSeconds(now.getSeconds() + value);
        break;
      case 'min':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 'hour':
        now.setHours(now.getHours() + value);
        break;
      default:
        throw new Error('Unknown interval type ' + type);
    }

    return now;
  }

  exports.addEventListener('load', function() {
    var scheduleBtn = document.getElementById('schedule');
    var stopBtn = document.getElementById('stop');

    var intervalValueInput = document.getElementById('interval-value');
    var intervalTypeSelect = document.getElementById('interval-type');

    function toggleInputs(toggle) {
      scheduleBtn.disabled = !toggle;
      intervalValueInput.disabled = !toggle;
      intervalTypeSelect.disabled = !toggle;
      stopBtn.disabled = toggle;
    }

    navigator.mozSetMessageHandler('alarm', function (alarm) {
      if (stopAlarms) {
        return;
      }

      Camera.takePicture(Camera.Types.BACK).catch(function(e) {
        Logger.error(e);
      }).then(function() {
        addAlarm(alarm.data.interval, alarm.data.type);
      });
    });

    scheduleBtn.addEventListener('click', function() {
      var interval = Number.parseInt(intervalValueInput.value, 10);
      var type = intervalTypeSelect.value;

      stopAlarms = false;

      addAlarm(interval, type).then(function() {
        toggleInputs(false);
      }, function(e) {
        alert(e);
      });
    });

    stopBtn.addEventListener('click', function() {
      stopAlarms = true;

      toggleInputs(true);
    });

    /*document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        previewVideo.pause();
      } else {
        previewVideo.play();
      }
    });*/

    connections.websocket = new FxOSWebSocket.Server(8008);
    connections.websocket.on('message', onWebSocketMessage);
  });
})(window);
