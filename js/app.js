/* global Camera,
          Logger,
          Transport,
          FxOSWebSocket,
          Scheduler,
          Storage,
          Notifier,
          BatteryModule,
          CameraModule,
          PowerModule,
          LoggerModule,
          StorageModule,
          PeerModule
*/

(function(exports) {
  'use strict';

  if (!window.EventDispatcher) {
    alert('Please run "bower install" before you install the app!');
    window.close();
  }

  var requestProcessors = new Map([
    ['battery', BatteryModule],
    ['camera', CameraModule],
    ['power', PowerModule],
    ['logger', LoggerModule],
    ['storage', StorageModule],
    ['peer', PeerModule]
  ]);

  var wifiManager = navigator.mozWifiManager;
  var websocketConnection = window.websocketConnection = null;

  function send(applicationMessage, blobs) {
    if (!websocketConnection) {
      return;
    }

    Transport.send(applicationMessage, blobs).then(function(dataToSend) {
      websocketConnection.send(dataToSend);
    });
  }

  function closeWebSocketServer() {
    if (websocketConnection) {
      websocketConnection.offAll();
      websocketConnection.stop();
      websocketConnection = null;
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
    CameraModule.on('tracking-scheduled', () => toggleInputs(false));
    CameraModule.on('tracking-stopped', () => toggleInputs(true));

    schedulerControls.schedule.addEventListener('click', function() {
      CameraModule.process({
        method: 'tracking-start',
        value: {
          interval: Number.parseInt(schedulerControls.intervalValue.value, 10),
          type: schedulerControls.intervalType.value
        }
      }, send);
    });

    schedulerControls.stop.addEventListener('click', function() {
      CameraModule.process({ method: 'tracking-stop' }, send);
    });

    remoteConnectionControls.enableConnection.addEventListener('change',
    function() {
      if (remoteConnectionControls.enableConnection.checked) {
        websocketConnection = new FxOSWebSocket.Server(8008);

        websocketConnection.on('message', function(e) {
          var request = Transport.receive(e).message;

          Logger.log('WebSocketMessage %s', JSON.stringify(request));

          var requestProcessor = requestProcessors.get(request.type);
          if (!requestProcessor) {
            return;
          }

          requestProcessor.process(request, send);
        });

        websocketConnection.on('stop', function() {
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

    navigator.battery.addEventListener('levelchange', function() {
      if (navigator.battery.level < 0.15) {
        Notifier.notify(15);
      }
    });
  });
})(window);
