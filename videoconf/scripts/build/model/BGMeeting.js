"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BGMeetingInfo = exports.BGMeeting = exports.BGMeetingParticipant = void 0;
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
var BGMeetingParticipant = /** @class */ (function () {
    function BGMeetingParticipant() {
    }
    return BGMeetingParticipant;
}());
exports.BGMeetingParticipant = BGMeetingParticipant;
//src/DbModels/Meeting.cs
//comes from api
var BGMeeting = /** @class */ (function () {
    function BGMeeting() {
    }
    return BGMeeting;
}());
exports.BGMeeting = BGMeeting;
//src/Model/LiveMeeting.cs/MeetingInfo
//comes from BGMeeting SignalR Server
var BGMeetingInfo = /** @class */ (function () {
    function BGMeetingInfo() {
    }
    return BGMeetingInfo;
}());
exports.BGMeetingInfo = BGMeetingInfo;
//# sourceMappingURL=BGMeeting.js.map