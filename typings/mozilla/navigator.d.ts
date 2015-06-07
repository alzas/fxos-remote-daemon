/// <reference path="core.d.ts" />

interface IWifiConnectionInfo {
  ipAddress: string;
}

interface IWifiManager {
  connectionInformation: IWifiConnectionInfo;

  onenabled(): void;
  ondisabled(): void,
  onstatuschange(): void,
  onconnectioninfoupdate(): void,
  onstationinfoupdate(): void
}

interface ITcpSocket {

}

interface IBatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

interface IDOMRequest<T> {
  then<TResult>(onfulfilled?: (value: T) => TResult | Promise<TResult>, onrejected?: (reason: any) => TResult | Promise<TResult>): Promise<TResult>;
}

interface IDOMCursor<T> {
  continue: () => void;

  result: T;
  onsuccess: () => void;
  onerror: () => void;
}

interface IAlarm {
  id: number;
  date: DateConstructor;
  respectTimezone: string;
  data?: any;
}

interface IAlarmsManager {
  getAll: () => IDOMRequest<Array<IAlarm>>;
  add: (date: Date, respectTimezone: string, data?: any) => IDOMRequest<number>;
  remove: (id: number) => void;
}

interface ICameraSize {
  width: number;
  height: number;
}

interface ICameraConfiguration {
  mode: string;
  previewSize: ICameraSize;
  pictureSize: ICameraSize;
  recorderProfile: string;
}

interface ICameraPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
}

interface ICameraPictureOptions {
  pictureSize: ICameraSize;
  fileFormat: string;
  rotation: number;
  position: ICameraPosition;
  dateTime: number;
}

interface ICameraCapabilities {
  previewSizes: Array<ICameraSize>;
  pictureSizes: Array<ICameraSize>;
  thumbnailSizes: Array<ICameraSize>;
  videoSizes: Array<ICameraSize>;

  fileFormats: Array<string>;
  whiteBalanceModes: Array<string>;
  sceneModes: Array<string>;
  effects: Array<string>;
  flashModes: Array<string>;
  focusModes: Array<string>;

  zoomRatios: Array<number>;
  maxFocusAreas: number;
  maxMeteringAreas: number;
  maxDetectedFaces: number;
  minExposureCompensation: number;
  maxExposureCompensation: number;
  exposureCompensationStep: number;
  recorderProfiles: any;
  isoModes: Array<string>;
  meteringModes: Array<string>;
}

interface ICameraControl {
  flashMode: string;
  capabilities: ICameraCapabilities;

  onclose: () => void;

  takePicture: (options: ICameraPictureOptions) => Promise<Blob>;

  resumePreview: () => void;
  release: () => void;
}

interface ICameraDescription {
  camera?: ICameraControl;
  configuration: ICameraConfiguration;
}

interface ICameraManager {
  getListOfCamera: () => Array<string>;
  getCamera: (type: string, config?: ICameraConfiguration) => IDOMRequest<ICameraDescription>
}

interface IStorage {
  addNamed: (blob: Blob, name: string) => IDOMRequest<string>;
  delete: (name: string) => IDOMRequest<void>;
  enumerate: (path: string, options?: { since: Date }) => IDOMCursor<string>;
}

interface IPowerManager {
  powerOff: () => void;
  reboot: () => void;
  screenEnabled: boolean;
  keyLightEnabled: boolean;
  screenBrightness: number;
  cpuSleepAllowed: boolean;
}

interface IConstrainLongRange {
  min: number;
  max: number;
}

declare const enum FacingMode { User, Environment, Left, Right }

interface IMediaTrackConstraintSet {
  width: IConstrainLongRange;
  height: IConstrainLongRange;
  frameRate: IConstrainLongRange;
  // Camera, Screen, Application, Window, Browser
  facingMode: string;
  mediaSource: string;
  browserWindow: number;
  scrollWithPage: boolean;
}

interface IMediaTrackConstraints extends IMediaTrackConstraintSet {
  require: Array<string>;
  advanced: Array<IMediaTrackConstraintSet>;
  // mobile-only backwards-compatibility for facingMode
  mandatory?: { facingMode: string };
  _optional?: Array<{ facingMode: string }>;
}

interface IMediaStreamConstraints {
  audio: boolean | IMediaTrackConstraints;
  video: boolean | IMediaTrackConstraints;
  // Mozilla legacy
  picture: boolean;
  // For testing purpose. Generates frames of solid colors if video is enabled,
  // and sound of 1Khz sine wave if audio is enabled.
  fake: boolean;
  // For testing purpose, works only if fake is enabled. Enable fakeTracks
  // returns a stream with two extra empty video tracks and three extra empty
  // audio tracks.
  fakeTracks: boolean;
  peerIdentity?: string;
}

interface IMediaStreamError {

}

interface Navigator {
  mozWifiManager: IWifiManager,
  mozTcpSocket: ITcpSocket,
  mozAlarms: IAlarmsManager,
  mozSetMessageHandler: (name: string, handler: (any?) => void) => void,
  mozCameras: ICameraManager;
  mozPower: IPowerManager;

  getDeviceStorages: (type: string) => IDOMRequest<Array<IStorage>>;
  battery: IBatteryManager,

  mozGetUserMedia: (
    constraints: IMediaStreamConstraints,
    successCallback: (stream: IMediaStream) => void,
    errorCallback: (error: IMediaStreamError) => void
  ) => void;

  webkitGetUserMedia: (
    constraints: IMediaStreamConstraints,
    successCallback: (stream: IMediaStream) => void,
    errorCallback: (error: IMediaStreamError) => void
  ) => void;

  getUserMedia: (
    constraints: IMediaStreamConstraints,
    successCallback: (stream: IMediaStream) => void,
    errorCallback: (error: IMediaStreamError) => void
  ) => void;
}