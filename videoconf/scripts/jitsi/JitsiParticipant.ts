import { JitsiTrack } from "./JitsiTrack";
import { MediaType } from "./MediaType";

export interface JitsiParticipant {
    getConference(): any; //JitsiConference
    getProperty(name: string): object;
    setProperty(name: string, value: any): void;
    hasAnyVideoTrackWebRTCMuted(): boolean;
    _setConnectionStatus(status: string): void;
    getConnectionStatus(): string;
    getTracks(): Array<JitsiTrack>;
    getTracksByMediaType(mediaType: MediaType): Array<JitsiTrack>;
    getId(): string; // example:                                   "e86bb76e"
    getJid(): string; //example : "224456141@conference.idlests.com/e86bb76e"
    getDisplayName(): string;
    getStatsID(): string;
    getStatus(): string;
    isModerator(): boolean;
    isHidden(): boolean;
    isAudioMuted(): boolean;
    isVideoMuted(): boolean;
    _isMediaTypeMuted(mediaType: MediaType): boolean;
    getRole(): string;
    setRole(role: string): void;
    supportsDTMF(): boolean;
    getFeatures(): Promise<Set<String>>;
    hasFeature(feature: string): boolean;
    setFeatures(features: Set<String>): void;
    getBotType(): string;
    setBotType(newBotType: string): void;
}