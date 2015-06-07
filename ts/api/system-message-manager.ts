/// <reference path="../../typings/mozilla/navigator.d.ts" />

import EventDispatcher from 'classes/event-dispatcher';

class SystemMessageManager extends EventDispatcher {
  constructor() {
    super(['alarm']);

    if (navigator.mozSetMessageHandler) {
      navigator.mozSetMessageHandler('alarm', (alarm) => {
        this.emit('alarm', alarm);
      });
    }
  }
}

export default new SystemMessageManager();