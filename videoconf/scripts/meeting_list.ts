"use strict";
import * as signalR from "@microsoft/signalr";
import { MeetingType } from "./enum/MeetingType";
const connection: signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();

const meetingTable = document.getElementById('meetingTable');
const connectionStatusMessage = document.getElementById('connectionStatusMessage');
const roomNameTxt = document.getElementById('meetingTitleTxt') as HTMLInputElement;
const createRoomBtn = document.getElementById('createMeetingBtn') as HTMLInputElement;

let hasRoomJoined: boolean = false;

$(meetingTable).DataTable({
    columns: [
        { data: 'RoomId', "width": "30%" },
        { data: 'Name', "width": "30%" },
        { data: 'IsControlAllowed', "width": "5%" },
        { data: 'IsRecordingRequired', "width": "5%" },
        { data: 'IsMultipleSharingAllowed', "width": "5%" },
        { data: 'IsScreenShareRequired', "width": "5%" },
        { data: 'IsOpened', "width": "5%" },
        { data: 'Button', "width": "15%" }
    ],
    "lengthChange": false,
    "searching": false,
    "language": {
        "emptyTable": "No meeting available"
    },
    "info":false
});

// Connect to the signaling server
connection.start().then(function () {

    connection.on('updateRoom', function (data: string) {
        try {
            var obj = JSON.parse(data);
            $(meetingTable).DataTable().clear().rows.add(obj).draw();
        } catch (err) { }        
    });

    connection.on('created', function (roomId: number, clientInfoMsg: string) {
        try {
            console.log('Created room', roomId);
            connectionStatusMessage.innerText = 'You created Room ' + roomId + '. Waiting for participants...';
        } catch (err) { }
    });

    connection.on('error', function (message: string) {
        alert(message);
    });

    //Get room list.
    connection.invoke("GetRoomInfo").catch(function (err: any) {
        return console.error(err.toString());
    });

}).catch(function (err: any) {
    return console.error(err.toString());
});


$(createRoomBtn).click(function () {
    let meetingTitle:string = roomNameTxt.value;
    createMeeting(meetingTitle);
});

$('#meetingTable tbody').on('click', 'button', function () {
    if (hasRoomJoined) {
        alert('You already joined the room. Please use a new tab or window.');
    } else {
        const rowdata: any = $(meetingTable).DataTable().row($(this).parents('tr')).data();
        const meetingId = parseInt(rowdata.RoomId);
        const isOpened = rowdata.IsOpened;
        const userId = parseInt($(this).attr('id'));

        if (meetingId === NaN) return;

        if (isOpened == true) {
            if (!userId) joinMeetingAsAnonymous(meetingId);
            else joinMeeting(meetingId, userId);
        } else if (isOpened == false) {
            if (userId !== NaN) joinMeeting(meetingId, userId);
        }
    }
});

function createMeeting(meetingTitle: string) {
    connection.invoke("CreateRoom", meetingTitle, "").catch(function (err: any) {
        return console.error(err.toString());
    });
}

function joinMeeting(meetingId: number, userId: number) {
    location.href = `/lobby/${meetingId}/${userId}`;
}

function joinMeetingAsAnonymous(meetingId: number) {
    location.href = `/lobby/${meetingId}`;
}