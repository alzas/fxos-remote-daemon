/// <reference path="../../typings/mozilla/navigator.d.ts" />

import DOMRequest from 'api/dom-request';

class StubCameraManager implements ICameraManager{
  private cameras: Array<string>;

  constructor(cameras: Array<string>) {
    this.cameras = cameras;
  }

  getListOfCamera() {
    return [...this.cameras];
  }

  getCamera(type:string, config:ICameraConfiguration) {
    return new DOMRequest<ICameraDescription>({
      camera: null,
      configuration: config
    });
  }
}

export default navigator.mozCameras || new StubCameraManager([
  'front', 'back'
]);
