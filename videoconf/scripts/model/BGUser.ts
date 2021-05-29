"use strict";

import { JitsiParticipant } from "../jitsi/JitsiParticipant";

export class UserInfo {
    Id: string; //connectionId
    //BG_Id: string;
    Jitsi_Id: string; 
    Name: string;
    IsHost: boolean;
    IsAnonymous: boolean;
    useMedia: { useCamera: boolean, useMic: boolean }
    mediaMute: { audioMute: boolean, videoMute: boolean }
}