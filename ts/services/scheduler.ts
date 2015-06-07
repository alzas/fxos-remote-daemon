import EventDispatcher from 'classes/event-dispatcher';
import AlarmManager from 'api/alarm-manager';
import SystemMessageManager from 'api/system-message-manager';
import LoggerService from 'services/logger';

class SchedulerService extends EventDispatcher {
  constructor() {
    super();

    SystemMessageManager.on('alarm', (alarm: IAlarm) => {
      this.emit(alarm.data.label + '-fired');

      this.schedule(alarm.data.label, alarm.data.interval, alarm.data.type);
    });
  }

  schedule(label: string, interval: number, type: string) {
    return this.removeAlarm(label).then(() => {
      var nextDate = SchedulerService.getNextDate(interval, type);

      return AlarmManager.add(
        nextDate,
        'honorTimezone',
        { label: label, interval: interval, type: type }
      ).then(() => {
        LoggerService.log('Scheduled new alarm at: %s', nextDate);
        return nextDate;
      });
    });
  }

  isScheduled(label) {
    return this.findAlarm(label).then((alarm) => !!alarm);
  }

  stop(label) {
    return this.removeAlarm(label);
  }

  private removeAlarm(label) {
    return this.findAlarm(label).then((alarm) => {
      if (alarm) {
        AlarmManager.remove(alarm.id);
      }
    });
  }

  private findAlarm(label: string) {
    return AlarmManager.getAll().then((alarms) => {
      for (var alarm of alarms) {
        if (alarm.data.label === label) {
          return alarm;
        }
      }

      return null;
    }, (e) => {
      LoggerService.log('Can not get alarm list: %s.', e.message || e.name, e);
      return Promise.reject<IAlarm>(e);
    });
  }

  private static getNextDate(value: number, type: string) {
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
}

export default new SchedulerService();
