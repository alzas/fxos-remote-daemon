/// <reference path="../../../typings/angular2/angular2.d.ts" />
import {Component, View, NgFor} from 'angular2/angular2';

const INTERVALS = [{
  value: 'sec',
  label: 'second'
}, {
  value: 'min',
  label: 'minute'
}, {
  value: 'hour',
  label: 'hour'
}];

@Component({
  selector: 'camera-manager'
})

@View({
  templateUrl: 'ts/components/camera-manager/component.html',
  directives: [NgFor]
})

class CameraManagerComponent {
  isScheduled: boolean;
  intervals: Array<Object>;

  constructor() {
    this.isScheduled = false;

    this.intervals = INTERVALS;
  }

  schedule(interval:string, type:string) {
    this.isScheduled = true;
  }

  stop() {
    this.isScheduled = false;
  }
}

export default CameraManagerComponent;