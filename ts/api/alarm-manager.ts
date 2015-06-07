/// <reference path="../../typings/mozilla/navigator.d.ts" />

import DOMRequest from 'api/dom-request';

class StubAlarmsManager implements IAlarmsManager {
  private alarms: Map<number, IAlarm>;

  getAll() {
    return new DOMRequest<Array<IAlarm>>([...this.alarms.values()]);
  }

  add(date: Date, respectTimezone: string, data?: any) {
    var id = Date.now();

    this.alarms.set(id, {
      id: id,
      date: Date,
      respectTimezone: respectTimezone,
      data: data
    });

    return new DOMRequest<number>(id);
  }

  remove(id: number) {
    this.alarms.delete(id);
  }
}

export default navigator.mozAlarms || new StubAlarmsManager();