"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var MeetingType_1 = require("./enum/MeetingType");
var connection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();
var meetingTable = document.getElementById('meetingTable');
var connectionStatusMessage = document.getElementById('connectionStatusMessage');
var roomNameTxt = document.getElementById('meetingTitleTxt');
var createRoomBtn = document.getElementById('createMeetingBtn');
var hasRoomJoined = false;
$(meetingTable).DataTable({
    columns: [
        { data: 'RoomId', "width": "30%" },
        { data: 'Name', "width": "40%" },
        { data: 'ConferenceType', "width": "15%" },
        { data: 'Button', "width": "15%" }
    ],
    "lengthChange": false,
    "searching": false,
    "language": {
        "emptyTable": "No meeting available"
    },
    "info": false
});
// Connect to the signaling server
connection.start().then(function () {
    connection.on('updateRoom', function (data) {
        try {
            var obj = JSON.parse(data);
            $(meetingTable).DataTable().clear().rows.add(obj).draw();
        }
        catch (err) { }
    });
    connection.on('created', function (roomId, clientInfoMsg) {
        try {
            console.log('Created room', roomId);
            connectionStatusMessage.innerText = 'You created Room ' + roomId + '. Waiting for participants...';
        }
        catch (err) { }
    });
    connection.on('error', function (message) {
        alert(message);
    });
    //Get room list.
    connection.invoke("GetRoomInfo").catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});
$(createRoomBtn).click(function () {
    var meetingTitle = roomNameTxt.value;
    createMeeting(meetingTitle);
});
$('#meetingTable tbody').on('click', 'button', function () {
    if (hasRoomJoined) {
        alert('You already joined the room. Please use a new tab or window.');
    }
    else {
        var rowdata = $(meetingTable).DataTable().row($(this).parents('tr')).data();
        var meetingId = parseInt(rowdata.RoomId);
        var meetingType = rowdata.ConferenceType;
        var userId = parseInt($(this).attr('id'));
        if (meetingId === NaN)
            return;
        if (meetingType == MeetingType_1.MeetingType.Open) {
            if (!userId)
                joinMeetingAsAnonymous(meetingId);
            else
                joinMeeting(meetingId, userId);
        }
        else if (meetingType == MeetingType_1.MeetingType.Closed) {
            if (userId !== NaN)
                joinMeeting(meetingId, userId);
        }
    }
});
function createMeeting(meetingTitle) {
    connection.invoke("CreateRoom", meetingTitle, "").catch(function (err) {
        return console.error(err.toString());
    });
}
function joinMeeting(meetingId, userId) {
    location.href = "/lobby/" + meetingId + "/" + userId;
}
function joinMeetingAsAnonymous(meetingId) {
    location.href = "/lobby/" + meetingId;
}
//# sourceMappingURL=meeting_list.js.map