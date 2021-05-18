"use strict";

import * as signalR from "@microsoft/signalr";
import { BizGazeConnection } from "./peerconnection";
import { MeetingUI } from "./meeting_ui";

declare global {
    interface Window { _roomId: number; }
}

class BizGazeMeeting
{
    connection: signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();
    meetingUI: MeetingUI = new MeetingUI();
    connectedToServer: boolean = false;

    connMap = new Map();
    clientMap = new Map();

    localVideoElem: HTMLMediaElement = null;
    localStream: MediaStream;

    hasRoomJoined: boolean = false;
    myRoomId: number;
    myInfo: { Id: string, Name: string };

    connectionStatusMessage = document.getElementById('connectionStatusMessage');
    videoContainerClass: string = "videoArea";
    videoClass: string = "video-card";

    /*var pcConfig: any = {
        "iceServers": [{
            'urls': 'stun:stun.l.google.com:19302'
        }] };*/
    pcConfig: any = { "iceServers": [] };
    offerConstraints: any = { "optional": [], "mandatory": {} };
    mediaConstraints: any = { "audio": true, "video": { "mandatory": {}, "optional": [] } };
    sdpConstraints: any = { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } };

    constructor() {
        this.registerUICallbacks();
    }

    start() {
        if (!(window._roomId && window._roomId > 0)) {
            this.leaveMeeting();
            return;
        }

        this.initMediaDevices(() => {
            this.connectToServer(() => {
                this.joinMeeting();
            });
        });
    }

    initMediaDevices(callback: (value: void) => void) {
        console.log('Getting user media (video) ...');

        /*return navigator.mediaDevices.getUserMedia({
            video: true,//hasCamera,
            audio: true//hasMic
        })
            .then(gotStream)
            .catch(function (e) {
                return alert('getUserMedia() error: ' + e.name);
            });*/


        let hasCamera: boolean = false;
        let hasMic: boolean = false;
        return navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                hasCamera ||= devices.some(function (d) { return d.kind == "videoinput"; });
                hasMic ||= devices.some(function (d) { return d.kind == "audioinput"; });
            })
            .then(() => {
                navigator.mediaDevices.getUserMedia({
                    video: hasCamera,
                    audio: hasMic
                })
                    .then((stream) => {
                        this.onGetStream(stream);
                    })
                    .then(callback)
                    .catch((e) => {
                        alert('getUserMedia() error: ' + e.name);
                        callback();
                    });
            });
    }

    onGetStream(stream: MediaStream) {
        console.log('getUserMedia video stream URL:', stream);
        this.localStream = stream;
        if (this.localVideoElem == null)
            this.localVideoElem = this.meetingUI.getMainVideoPanel();
        this.localVideoElem.srcObject = stream;
    }

    connectToServer(callback: (value: void) => void) {
        // Connect to the signaling server
        this.connection.start().then(() => {
            this.registerServerCallbacks();
            callback();

        }).catch(function (err: any) {
            return console.error(err.toString());
        });
    }

    joinMeeting() {
        this.connection.invoke("Join", window._roomId + "", "").catch((err: any) => {
            return console.error("Join Meeting Failed.", err.toString());
        });
    }

    leaveMeeting() {
        if (this.connectedToServer) {
            this.connection.invoke("LeaveRoom").catch((err: any) => {
                return console.error("Leave Meeting Failed.", err.toString());
            });
        } else {
            $("form#return").submit();
        }
    }

    registerUICallbacks() {
        window.addEventListener('unload', () => {
            this.leaveMeeting();
        });
        this.meetingUI.leaveMeetingCallback = this.leaveMeeting;
    }

    registerServerCallbacks() {
        this.connection.on('joined', (roomId: number, clientInfoMsg: string) => {
            try {
                this.myRoomId = roomId;
                this.myInfo = JSON.parse(clientInfoMsg);

                this.hasRoomJoined = true;
                console.log('This peer has joined room', roomId);
            } catch (err) { }

        });

        this.connection.on('error', (message: string) => {
            alert(message);
        });

        this.connection.on('roomUserList', (msg: string) => {
            try {
                let clients: any[] = JSON.parse(msg);
                for (let i = 0; i < clients.length; i++) {
                    let client = clients[i];
                    if (client.Id == this.myInfo.Id) continue;
                    this.clientMap.set(client.Id, client);
                    this.connMap.set(client.Id, new BizGazeConnection(this.connection,
                        this.pcConfig, this.offerConstraints, this.mediaConstraints, this.sdpConstraints,
                        this.myInfo.Id, client.Id, true, false, this.localStream,
                        this.videoContainerClass, this.videoClass));
                }
            } catch (err) { }
        });

        this.connection.on('joinNew', (clientMsg: string) => {
            try {
                let client = JSON.parse(clientMsg);
                if (client.Id != this.myInfo.Id) {
                    this.clientMap.set(client.Id, client);
                    this.connMap.set(client.Id, new BizGazeConnection(this.connection,
                        this.pcConfig, this.offerConstraints, this.mediaConstraints, this.sdpConstraints,
                        this.myInfo.Id, client.Id, false, false,
                        this.localStream, this.videoContainerClass, this.videoClass));
                }
            } catch (err) { }
        });

        this.connection.on('leave', (clientId: string) => {
            if (this.clientMap.has(clientId)) {
                let conn: BizGazeConnection = this.connMap.get(clientId);
                if (conn != null)
                    conn.closePeerConnection();

                this.clientMap.delete(clientId);
                this.connMap.delete(clientId);
            }

            //self leave
            if (clientId == this.myInfo.Id) {
                this.clientMap.clear();
                this.connMap.clear();
                $("form#return").submit();
            }
        });

        this.connection.on('SignalingMessage', (sourceId: string, msg: any) => {
            console.log('Client received message:', msg);
            if (sourceId != this.myInfo.Id && this.connMap.has(sourceId)) {
                let peerConn: BizGazeConnection = this.connMap.get(sourceId);
                peerConn.onSignalingMessage(msg);
            }
        });

        this.connection.on('bye', () => {
            console.log(`Peer leaving room.`);
            // If peer did not create the room, re-enter to be creator.
            this.connectionStatusMessage.innerText = `Other peer left room ${this.myRoomId}.`;
        });
    }
}

const meeting: BizGazeMeeting = new BizGazeMeeting();
meeting.start();