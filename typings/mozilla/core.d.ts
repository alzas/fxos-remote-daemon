interface IMediaStreamTrack {
  kind: string;
  id: string;
  label: string;
  enabled: boolean;

  stop: () => void;
}

interface IAudioStreamTrack extends IMediaStreamTrack {
  // getSourceIds: () => Array<string>;
}

interface IVideoStreamTrack extends IMediaStreamTrack {
  // getSourceIds: () => Array<string>;
  // takePhoto: () => void;
}

interface IMediaStream {
  // id: string;
  currentTime: number;
  getAudioTracks: () => Array<IAudioStreamTrack>;
  getVideoTracks: () => Array<IVideoStreamTrack>;
  getTracks: () => Array<IMediaStreamTrack>;
  // getTrackById: (trackId: string) => IMediaStreamTrack;
  // addTrack: (track: IMediaStreamTrack) => void;
  // removeTrack: (track: IMediaStreamTrack) => void;
}

interface ILocalMediaStream extends IMediaStream {
  stop: () => void;
}