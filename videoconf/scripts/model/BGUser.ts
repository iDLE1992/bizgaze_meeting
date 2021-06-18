"use strict";

import { JitsiParticipant } from "../jitsi/JitsiParticipant";
import { InputMediaPolicy } from "./InputDevicePolicy";

export class UserInfo {
    Id: string = ""; //connectionId
    //BG_Id: string;
    Jitsi_Id: string = ""; 
    Name: string = "";
    IsHost: boolean = false;
    IsAnonymous: boolean = false;
    mediaPolicy: InputMediaPolicy = { useCamera: false, useMic: false };
}
