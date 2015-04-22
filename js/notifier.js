/* global AudioContext */

(function(exports) {
  'use strict';

  const PATTERN = [4, 1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1];
  const VOLUME = 0.3;

  function getAttentionCurveWave() {
    var result = [];
    var currentValue = VOLUME;

    PATTERN.forEach(duration => {
      for (var i = 0; i < duration; i++) {
        result.push(currentValue);
      }

      currentValue = VOLUME - currentValue;
    });

    return new Float32Array(result);
  }

  var Notifier = {
    notify: function(duration) {
      var audioChannel = 'notification';
      var audioCtx = new AudioContext(audioChannel);

      var oscillator = audioCtx.createOscillator();

      var time = audioCtx.currentTime;
      oscillator.type = 'square';
      oscillator.frequency.value = 900;
      oscillator.start();
      oscillator.stop(time + duration);

      var gain = audioCtx.createGain();
      gain.gain.setValueCurveAtTime(getAttentionCurveWave(), time, duration);

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
    }
  };

  exports.Notifier = Notifier;
}(this));
