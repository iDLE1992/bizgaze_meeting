
import { MediaType } from "../enum/MediaType";

export interface JitsiTrack {
    //"video" for the video tracks and "audio" for the audio tracks
    getType(): MediaType;
    //only for the local tracks.
    mute(): Promise<any>;
    //only for the local tracks.
    unmute(): Promise<any>;

    isMuted(): boolean;

    attach(container: HTMLElement): void;

    detach(container: HTMLElement): void;

    //disposes the track. If the track is added to a conference the track will be removed
    //only for the local tracks
    dispose(): void;

    //unique string for the track.
    getId(): string;

    //id(string) of the track owner
    //only for the remote tracks
    getParticipantId(): string;

    //sets new audio output device for track's DOM elements
    //video tracks are ignored
    setAudioOutput(audioOutputDeviceId: string): void;

    //returns device ID associated with track 
    //only for the local tracks
    getDeviceId(): string;

    //true if track is ended
    isEnded(): boolean;

    isLocal(): boolean;

    addEventListener(eventType: string, callback: Function): void;
    removeAllListeners(eventType: string): void;

    //effect by swapping out the existing MediaStream on the JitsiTrack with the new
    setEffect(effect: string): void;
    startEffect(): void;
    stopEffect(): void;
    isEnabled(): void;

}