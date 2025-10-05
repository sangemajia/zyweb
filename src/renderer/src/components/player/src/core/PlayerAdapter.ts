abstract class PlayerAdapter {
  player: any = null;
  options: { [key: string]: any } = {};
  publicListener: { [key: string]: any } = {
    timeUpdate: () => {},
    sendDanmu: () => {},
    playrateUpdate: () => {},
    volumeUpdate: () => {},
    mutedUpdate: () => {},
  };

  abstract barrage(comments: any, url: string, id: string): void;
  abstract create(options: any): any;
  abstract currentTime(): number;
  abstract destroy(): void;
  abstract duration(): number;
  abstract pause(): void;
  abstract play(): void;
  abstract playNext(options: any): void;
  abstract seek(time: number): void;
  abstract time(): { currentTime: number; duration: number };
  abstract onTimeUpdate(callback: any): void;
  abstract offBarrage(): void;
  abstract offTimeUpdate(): void;
  abstract speed(speed: number): void;
  abstract toggle(): void;
  abstract volume(volume: number): void;
}

export default PlayerAdapter;