"use strict";
import * as signalR from "@microsoft/signalr";
const connection: signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();

const meetingTable = document.getElementById('meetingTable');
const connectionStatusMessage = document.getElementById('connectionStatusMessage');
const roomNameTxt = document.getElementById('meetingTitleTxt') as HTMLInputElement;
const createRoomBtn = document.getElementById('createMeetingBtn') as HTMLInputElement;

let hasRoomJoined: boolean = false;

$(meetingTable).DataTable({
    columns: [
        { data: 'RoomId', "width": "30%" },
        { data: 'Name', "width": "50%" },
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
        let data: any = $(meetingTable).DataTable().row($(this).parents('tr')).data();
        let meetingId = parseInt(data.RoomId);
        if (meetingId != NaN && meetingId > 0)
            joinMeeting(meetingId);
    }
});

function createMeeting(meetingTitle: string) {
    connection.invoke("CreateRoom", meetingTitle, "").catch(function (err: any) {
        return console.error(err.toString());
    });
}

function joinMeeting(meetingId: number) {
    $("input#meetingId").val(meetingId);
    $("#gotoMeeting").submit()
}