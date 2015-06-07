/// <reference path="../../../typings/angular2/angular2.d.ts" />

import {Component, View, NgFor} from 'angular2/angular2';

import CameraService from 'services/camera';

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

const FLASH_MODES = [{
  value: 'on',
  label: 'On'
}, {
  value: 'off',
  label: 'Off'
}, {
  value: 'torch',
  label: 'Torch'
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
  flashModes: Array<Object>;

  constructor() {
    this.isScheduled = false;

    this.intervals = INTERVALS;
    this.flashModes = FLASH_MODES;
  }

  schedule(interval:string, type:string) {
    this.isScheduled = true;
  }

  setFlashMode(mode: string) {
    CameraService.setFlashMode('back', mode);
  }

  releaseCamera() {
    CameraService.release('back');
  }

  stop() {
    this.isScheduled = false;
  }
}

export default CameraManagerComponent;