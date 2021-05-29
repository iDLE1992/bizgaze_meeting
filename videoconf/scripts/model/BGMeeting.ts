import { MeetingType } from "../enum/MeetingType"
import { ChannelType } from "../enum/ChannelType"
import { ParticipantType } from "../enum/ParticipantType";


/*
callbackUrl: "http://"
conferenceId: 1234
conferenceName: "Building A Bitcoin Crypto application "
conferenceType: "Open|Closed"
channelType : : "Both |  AudioOnly | VideoOnly"
description: "c# application that works on dotnet framework, and bouncy castle crypto libraries"
duration: "2021-05-18T09:19:57.654Z"
endDateTime: "2021-05-18T09:19:57.654Z"
participants: (2) [{…}, {…}]
refGuid: "30251003"
startDateTime: "2021-05-18T09:19:57.654Z"
*/

//src/DbModels/Participants.cs
export class BGMeetingParticipant {
    ParticipantId: number;
    ParticipantName: string;
    Code: string;
    ParticipantType: ParticipantType;
}

//src/DbModels/Meeting.cs
//comes from api
export class BGMeeting {
    ConferenceId: number;
    ConferenceName: string;
    ConferenceType: MeetingType;
    ChannelType: ChannelType;
    Description: string;
    StartDateTime: string;
    EndDateTime: string;
    Duration: string;
    Participants: BGMeetingParticipant[];
    RefGuid: string;
    CallbackUrl: string;
}

//src/Model/LiveMeeting.cs/MeetingInfo
//comes from BGMeeting SignalR Server
export class BGMeetingInfo {
    Id: string;
    IsWebinar: boolean;
    channelType: string;
    conferenceName: string;
    hostName: string;
    elapsed: number; //timestamp in milliseconds when join meeting
}