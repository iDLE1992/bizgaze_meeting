"use strict";

export class UserInfo {
    Id: string;
    Jitsi_Id: string; 
    Name: string;
    IsHost: boolean;
    hasMediaDevice: { hasCamera: boolean, hasMic: boolean }
    mediaMute: { audioMute: boolean, videoMute: boolean }
}