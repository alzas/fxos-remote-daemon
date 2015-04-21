/* global
    EventDispatcher,
    Logger
*/

(function(exports) {
  'use strict';

  var alarmManager = navigator.mozAlarms;

  function findAlarm(label) {
    return alarmManager.getAll().then(function(alarms) {
      for (var i = 0; i < alarms.length; i++) {
        if (alarms[i].data.label === label) {
          return alarms[i];
        }
      }

      return null;
    }).catch(function(e) {
      Logger.log('Can not get alarm list: %s.', e.message || e.name, e);
      throw e;
    });
  }

  function removeAlarm(label) {
    return findAlarm(label).then(function(alarm) {
      if (alarm) {
        alarmManager.remove(alarm.id);
      }
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

  var Scheduler = EventDispatcher.mixin({
    schedule: function(label, interval, type) {
      return removeAlarm(label).then(function() {
        var nextDate = getNextDate(interval, type);
        return alarmManager.add(
          nextDate,
          'honorTimezone',
          { label: label, interval: interval, type: type }
        ).then(function() {
          Logger.log('Scheduled new alarm at: %s', nextDate);
          return nextDate;
        });
      });
    },

    isScheduled: function(label) {
      return findAlarm(label).then(function(alarm) {
        return !!alarm;
      });
    },

    stop: function(label) {
      return removeAlarm(label);
    }
  });

  navigator.mozSetMessageHandler('alarm', function (alarm) {
    Scheduler.emit(alarm.data.label + '-fired');

    Scheduler.schedule(alarm.data.label, alarm.data.interval, alarm.data.type);
  });

  exports.Scheduler = Scheduler;
})(window);
