/* global Camera,
          Logger,
          PeerConnection,
          Transport,
          FxOSWebSocket,
          Scheduler,
          Storage
*/

(function(exports) {
  'use strict';

  var getUserMedia = (
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.getUserMedia
  ).bind(navigator);

  var wifiManager = navigator.mozWifiManager;

  var connections = window.connections = {
    websocket: null,
    peer: null
  };

  function send(applicationMessage, blobs) {
    if (!connections.websocket) {
      return;
    }

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

    if (request.type === 'storage') {
      if (request.method === 'list') {
        Storage.list('remote-daemon').then(function(files) {
          var page = 0;
          while(files.length) {
            var filesForPage = files.splice(0, request.pageSize);
            send({
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
        return;
      }
      return;
    }
  }

  function closeWebSocketServer() {
    if (connections.websocket) {
      connections.websocket.offAll('message');
      connections.websocket.offAll('stop');

      connections.websocket.stop();

      connections.websocket = null;
    }
  }

  exports.addEventListener('load', function() {
    var schedulerControls = {
      schedule: document.getElementById('schedule'),
      stop: document.getElementById('stop'),
      intervalValue: document.getElementById('interval-value'),
      intervalType: document.getElementById('interval-type')
    };

    var remoteConnectionControls = {
      host: document.getElementById('remote-host-address'),
      enableConnection: document.getElementById('enable-remote-connection')
    };

    function toggleInputs(toggle) {
      schedulerControls.schedule.disabled = !toggle;
      schedulerControls.intervalValue.disabled = !toggle;
      schedulerControls.intervalType.disabled = !toggle;
      schedulerControls.stop.disabled = toggle;
    }

    function updateRemoteHost() {
      if (wifiManager.connectionInformation) {
        remoteConnectionControls.host.textContent =
          wifiManager.connectionInformation.ipAddress;
      } else {
        remoteConnectionControls.host.textContent = 'Turn Wi-Fi on';
      }
    }

    Scheduler.isScheduled('take-picture').then(function(isScheduled) {
      toggleInputs(!isScheduled);
    });

    schedulerControls.schedule.addEventListener('click', function() {
      var interval = Number.parseInt(schedulerControls.intervalValue.value, 10);
      var type = schedulerControls.intervalType.value;

      Scheduler.schedule('take-picture', interval, type).then(function() {
        toggleInputs(false);
      });

      Scheduler.on('take-picture-fired', function() {
        Camera.takePicture(Camera.Types.BACK).then(function(result) {
          send({
            type: 'camera',
            method: 'picture'
          }, [result.blob]);
        }, function(e) {
          Logger.error(e);
        });
      });
    });

    schedulerControls.stop.addEventListener('click', function() {
      Scheduler.stop('take-picture');
      Scheduler.offAll('take-picture-fired');

      toggleInputs(true);
    });

    remoteConnectionControls.enableConnection.addEventListener('change',
    function() {
      if (remoteConnectionControls.enableConnection.checked) {
        connections.websocket = new FxOSWebSocket.Server(8008);

        connections.websocket.on('message', onWebSocketMessage);
        connections.websocket.on('stop', function() {
          closeWebSocketServer();

          remoteConnectionControls.enableConnection.checked = false;
        });
      } else {
        closeWebSocketServer();
      }
    });

    updateRemoteHost();

    wifiManager.onenabled = wifiManager.ondisabled = updateRemoteHost;
    wifiManager.onstatuschange = updateRemoteHost;
    wifiManager.onconnectioninfoupdate = updateRemoteHost;
    wifiManager.onstationinfoupdate = updateRemoteHost;
  });
})(window);
