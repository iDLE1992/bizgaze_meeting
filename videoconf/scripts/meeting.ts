"use strict";

import * as signalR from "@microsoft/signalr";
import { BizGazeConnection } from "./peerconnection";
import { BGC_Msg } from "./BGC_Msg"
import { MeetingUI } from "./meeting_ui";
import { UserInfo } from "./user"
import { JitsiTrack } from "./jitsi/JitsiTrack"
import { JitsiParticipant } from "./jitsi/JitsiParticipant"
import { MediaType } from "./jitsi/MediaType";
import { CommandParam } from "./jitsi/CommandParam"
import { UserProperty } from "./jitsi/UserProperty"
import { BGRoom } from "./Room";
import { TsToDateFormat } from "./TimeUtil"

declare global {
    interface Window {
        _roomId: number;
        _userId: number;
        meetingController: any;
        JitsiMeetJS: any;
    }
    interface MediaDevices {
        getDisplayMedia(constraints?: any): Promise<MediaStream>;
    }
    interface MediaRecorder {
        pause(): void;
        requestData(): void;
        resume(): void;
        start(timeslice?: number): void;
        stop(): void;
        ondataavailable (event:any): void;
        onstop(): void;
        addEventListener(event:string, callback:Function): void;
        onerror(): void;
    }
}

declare var MediaRecorder: {
    prototype: MediaRecorder;
    new(): MediaRecorder;
    new(stream: MediaStream, options: object): MediaRecorder;
};



/***********************************************************************************

                       Lifecycle of Bizgaze Meeting

    connectToBG -> joinBGConference -> connectToJitsi -> joinJitsiConference -> ...
    ... -> leaveFromJitsi -> leaveFromBG

************************************************************************************/

enum ControlMessageTypes {
    GRANT_HOST_ROLE= "grant-host",
    MUTE_AUDIO= "mute_audio",
    MUTE_VIDEO= "mute_video"
};

export class BizGazeMeeting
{
    connection: signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();
    connMap = new Map<string, BizGazeConnection>();

    joinedBGConference: boolean = false;
    joinedJitsiConference: boolean = false;

    m_UI: MeetingUI = new MeetingUI(this);

    roomInfo: BGRoom = new BGRoom();
    m_BGUserList = new Map<string, UserInfo>();
    localVideoElem: HTMLMediaElement = null;

    myJitsiUserInfo: any;
    myInfo: UserInfo
        = {
            Id: "",
            Jitsi_Id: "",
            Name: "",
            IsHost: false,
            hasMediaDevice: {
                hasCamera: false,
                hasMic: false
            },
            mediaMute: {
                audioMute: false,
                videoMute: false
            }
        };

    bizgazePeerLinkOffer = 'bizgazePeerLinkOffer';
    bizgazePeerLinkAnswer = 'bizgazePeerLinkAnswer';


    pcConfig: any = { "iceServers": [] };
    offerConstraints: any = { "optional": [], "mandatory": {} };
    mediaConstraints: any = { "audio": true, "video": { "mandatory": {}, "optional": [] } };
    sdpConstraints: any = { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } };
    

    JitsiMeetJS: any = window.JitsiMeetJS;
    jitsiRoom: any;/*JitsiConference*/
    jitsiConnection: any;

    localTracks: JitsiTrack[];

    screenSharing = false;
    recording = false;
    downloadRecordFile = false;

    localStartTimestamp: number;

    constructor() {
    }

    /**
     * **************************************************************************
     *              START ~ END
     *
     * **************************************************************************
     */

    async start() {
        if (!(window._roomId && window._roomId > 0)) {
            this.leaveBGConference();
            return;
        }

        //jitsi init
        const initOptions = {
            disableAudioLevels: true
        };
        this.JitsiMeetJS.setLogLevel(this.JitsiMeetJS.logLevels.ERROR);
        this.JitsiMeetJS.init(initOptions);

        //capture media devices
        await this.initMediaDevices();
        this.Log("Camera: " + this.myInfo.hasMediaDevice.hasCamera);
        this.Log("Mic: " + this.myInfo.hasMediaDevice.hasMic);

        //update device status
        this.m_UI.updateToolbar(this.myInfo, this.localTracks);

        //connect to bg server
        this.connectToBGServer(() => {
            this.Log("Connected to BizGaze SignalR Server");
            this.joinBGConference();
        });
    }

    stop() {
        if (this.joinedJitsiConference)
            this.leaveJitsiConference();
        else
            this.leaveBGConference();
    }

    forceStop() {
        this.leaveJitsiConference();
        this.leaveBGConference();
    }

    /**
     * **************************************************************************
     *              Local Camera/Microphone init
     *              
     * **************************************************************************
     */

    async initMediaDevices() {
        this.Log('Getting user media devices ...');

        await this.JitsiMeetJS.mediaDevices.enumerateDevices((devices: any) => {

            let audioInputDeviceExist: boolean = false;
            let videoInputDeviceExist: boolean = false;

            const videoInputDevices
                = devices.filter((d: any) =>
                    d.kind === 'videoinput');


            if (videoInputDevices.length >= 1) {
                this.Log("found one camera");
                videoInputDeviceExist = true;
                videoInputDevices.map(
                    (d: any) =>
                        this.Log(`${d.deviceId}  ---> ${d.label}`));
            }

            const audioInputDevices
                = devices.filter((d: any) => d.kind === 'audioinput');

            if (audioInputDevices.length >= 1) {
                audioInputDeviceExist = true;
                audioInputDevices.map(
                    (d: any) =>
                        this.Log(`${d.deviceId}  ---> ${d.label}`));
            }

            /*let createTrackOptions = [];
            if (audioInputDeviceExist) createTrackOptions.push(MediaType.AUDIO);
            if (videoInputDeviceExist) createTrackOptions.push(MediaType.VIDEO);*/
        });

        const audioTracks = await this.JitsiMeetJS.createLocalTracks({ devices: [MediaType.AUDIO] }).catch((err: any) => {
        });

        const videoTracks = await this.JitsiMeetJS.createLocalTracks({ devices: [MediaType.VIDEO] }).catch((err: any) => {
        });

        let tracks = [];
        if (audioTracks && audioTracks.length > 0) tracks.push(audioTracks[0]);
        if (videoTracks && videoTracks.length > 0) tracks.push(videoTracks[0]);

        this.onLocalTracks(tracks);
    }

    private onLocalTracks(tracks: any[]) {
        this.localTracks = tracks;

        for (let i = 0; i < this.localTracks.length; i++) {
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                (audioLevel: number) => console.log(`Audio Level local: ${audioLevel}`));
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => { console.log('local track muted') });
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('local track stoped'));
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                (deviceId: string) =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));

            if (this.localTracks[i].getType() === MediaType.VIDEO) {
                this.myInfo.hasMediaDevice.hasCamera = true;
            } else if (this.localTracks[i].getType() === MediaType.AUDIO) {
                this.myInfo.hasMediaDevice.hasMic = true;
            }
        }

        if (this.localVideoElem == null) {
            this.localVideoElem = this.m_UI.getEmptyVideoPanel();
        }

        this._updateMyPanel();

        for (let i = 0; i < this.localTracks.length; i++) {
            if (this.localTracks[i].getType() === MediaType.VIDEO) {
                this.localTracks[i].attach(this.localVideoElem);
                this.m_UI.setShotnameVisible(false, this.localVideoElem);
            }
        }
    }

    private stopAllMediaStreams() {
        if (this.localTracks && this.localTracks.length > 0) {
            const N = this.localTracks.length;
            for (let i = 0; i < N; i++) {
                this.localTracks[i].dispose();
            }
        }
    }

    /**
     * **************************************************************************
     *              Jitsi Server interaction
     *         Connect
     *         Enter/Leave Room
     *         Send/Receive Track
     *         UserInfo
     * **************************************************************************
     */

    connectToJitsiServer() {
        //const serverdomain = "idlests.com";
        const serverdomain = "unimail.in";

        const connConf = {
            hosts: {
                domain: serverdomain,
                muc: `conference.${serverdomain}`,
            },
            bosh: `//${serverdomain}/http-bind`,

            // The name of client node advertised in XEP-0115 'c' stanza
            clientNode: `//${serverdomain}/jitsimeet`
        };

        this.jitsiConnection = new this.JitsiMeetJS.JitsiConnection(null, null, connConf);

        this.jitsiConnection.addEventListener(
            this.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => { this.onJitsiConnectionSuccess(); });
        this.jitsiConnection.addEventListener(
            this.JitsiMeetJS.events.connection.CONNECTION_FAILED,
            () => { this.onJitsiConnectionFailed(); });
        this.jitsiConnection.addEventListener(
            this.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            () => { this.disconnectFromJitsiServer(); });

        this.jitsiConnection.connect();
    }

    onJitsiConnectionSuccess() {
        this.Log("Connected to Jitsi Server");
        this.joinJitsiConference();
    }

    onJitsiConnectionFailed() {
        this.Log("sorry, failed to connect jitsi server");
    }

    disconnectFromJitsiServer() {
        this.Log("disconnected from jitsi server");
    }

    private joinJitsiConference() {
        const confOptions = {
            openBridgeChannel: true
        };

        this.jitsiRoom = this.jitsiConnection.initJitsiConference(`${this.roomInfo.Id}`, confOptions);

        //remote track
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, (track: any) => {
            this.onAddedRemoteTrack(track);
        });
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, (track: any) => {
            this.onRemovedRemoteTrack(track);
        });

        //my join
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            async () => { await this.onJitsiConferenceJoined(); });

        //my left
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.CONFERENCE_LEFT,
            () => { this.onJitsiConferenceLeft(); }
        );

        //remote join
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.USER_JOINED, (id: string, user: JitsiParticipant) => {
            this.onJitsiUserJoined(id, user);
            //remoteTracks[id] = [];
        });

        //remote left
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.USER_LEFT,
            (id: string, user: any) => {
                this.onJitsiUserLeft(id, user);
            }
        );

        //track mute
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
            (track: any) => {
                this.onTrackMuteChanged(track);
            });

        //audio level change
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
            (userID: string, audioLevel: string) => {
                this.Log(`${userID} - ${audioLevel}`)
            });

        //chat
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
            (id: string, message: string, timestamp: string) => {
                this.onReceiveChatMessage(id, message, timestamp);
            }
        );

        //name change
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
            (userID: string, displayName: string) => {
                console.log(`${userID} - ${displayName}`)
            });

        //command
        this.jitsiRoom.addCommandListener(ControlMessageTypes.GRANT_HOST_ROLE, (param: CommandParam) => { this.onChangedModerator(param) });
        this.jitsiRoom.addCommandListener(ControlMessageTypes.MUTE_AUDIO, (param: CommandParam) => { this.onMutedAudio(param) });
        this.jitsiRoom.addCommandListener(ControlMessageTypes.MUTE_VIDEO, (param: CommandParam) => { this.onMutedVideo(param) });

        //set name
        this.jitsiRoom.setDisplayName(this.myInfo.Name);

        //joinJitsiConference
        this.jitsiRoom.join(); //callback -  onJitsiUserJoined
    }

    async leaveJitsiConference() {
        for (let i = 0; i < this.localTracks.length; i++) {
            await this.jitsiRoom.removeTrack(this.localTracks[i]);
        }
        await this.jitsiRoom.leave().then(() => {
            this.leaveBGConference();
        });
    }

    //my enter room
    async onJitsiConferenceJoined() {
        this.joinedJitsiConference = true;
        setTimeout(async ()=>{
            for (let i = 0; i < this.localTracks.length; i++) {
                this.Log("[ OUT ] my track - " + this.localTracks[i].getType());
                await this.jitsiRoom.addTrack(this.localTracks[i]).catch((error: any) => {
                    this.Log(error);
                });
            }
        }, 500);

        //set subject
        this.m_UI.showMeetingSubject(this.roomInfo.subject);

        //set time
        setInterval(() => {
            const delta = Date.now() - this.localStartTimestamp;
            const elapsed = this.roomInfo.elapsed + delta;
            this.m_UI.updateTime(TsToDateFormat(elapsed));
        }, 1000);
    }

    //my leave room
    onJitsiConferenceLeft() {
        this.joinedJitsiConference = false;
        this.leaveBGConference();
    }

    //remote enter room
    onJitsiUserJoined(id: string, user: JitsiParticipant) {
        this.Log(`joined user: ${user.getDisplayName()}`);

        setTimeout(() => {
            if (!user.getProperty(UserProperty.videoElem)) {
                const videoElem = this.m_UI.getEmptyVideoPanel();
                user.setProperty(UserProperty.videoElem, videoElem);
                this._updateUserPanel(user);
            }
        }, 3000);

        //notify him that i am moderator
        if (this.myInfo.IsHost)
            this.grantModeratorRole(this.jitsiRoom.myUserId());
    }

    //remote leave room
    onJitsiUserLeft(id: string, user: any) {
        this.Log(`left user: ${user.getDisplayName()}`);
        this.m_UI.freeVideoPanel(user.getProperty(UserProperty.videoElem));
    }

    //[ IN ] remote track
    onAddedRemoteTrack(track: JitsiTrack) {
        if (track.isLocal()) {
            return;
        }
        this.Log(`[ IN ] remote track - ${track.getType()}`);

        const id = track.getParticipantId();
        const user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            let videoElem = user.getProperty(UserProperty.videoElem) as HTMLMediaElement;
            if (!videoElem) {
                videoElem = this.m_UI.getEmptyVideoPanel();
                user.setProperty(UserProperty.videoElem, videoElem);
                this._updateUserPanel(user);
            }
            track.attach(videoElem);            
            this._updateUserPanel(user);
        }
    }

    private _updateUserPanel(user: JitsiParticipant) {
        if (user && user.getProperty(UserProperty.videoElem)) {
            const videoElem = user.getProperty(UserProperty.videoElem) as HTMLMediaElement;
            this.m_UI.updatePanelOnJitsiUser(videoElem, this.myInfo, user);
        }
    }

    private _updateMyPanel() {
        if (this.localVideoElem)
            this.m_UI.updatePanelOnMyBGUser(this.localVideoElem, this.myInfo, this.localTracks);
    }

    // [DEL] remote track
    onRemovedRemoteTrack(track: JitsiTrack) {
        this.Log("[ DEL ] remotetrack - " + track.getType());
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_VIDEOTYPE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.NO_DATA_FROM_SOURCE);
    }

    /**
     * **************************************************************************
     *              BizGaze SignalR Server interaction
     *              
     *          Connect
     *          Join/Leave
     *          Control Message
     * **************************************************************************
     */

    private connectToBGServer(callback: (value: void) => void) {
        // Connect to the signaling server
        this.connection.start().then(() => {
            this.registerBGServerCallbacks();
            callback();

        }).catch(function (err: any) {
            return console.error(err.toString());
        });
    }

    private joinBGConference() {
        this.connection.invoke("Join", window._roomId + "", window._userId+"").catch((err: any) => {
            return console.error("Join Meeting Failed.", err.toString());
        });
    }

    public leaveBGConference() {
        this.Log("leaving Meeting " + this.joinedBGConference);
        /*if (this.joinedBGConference) {
            this.connection.invoke("LeaveRoom").catch((err: any) => {
                return console.error("Leave Meeting Failed.", err.toString());
            });
        } else*/ {
            this.stopAllMediaStreams();
            $("form#return").submit();
        }
    }

    private onBGConferenceJoined(roomId: number, userInfo: UserInfo) {
        this.joinedBGConference = true;

        this.roomInfo.Id = `${roomId}`;

        this.myInfo.Id = userInfo.Id;
        this.myInfo.Name = userInfo.Name;
        this.myInfo.IsHost = userInfo.IsHost;

        //update name, moderator ...
        this._updateMyPanel();

        //connect to jitsi server and enter room
        this.connectToJitsiServer();
    }

    private onBGConferenceLeft() {
        this.joinedBGConference = false;

        this.stopAllMediaStreams();
        this.m_BGUserList.clear();
        this.connMap.clear();
        $("form#return").submit();
    }

    private onBGUserJoined(userInfo: UserInfo) {
        this.m_BGUserList.set(userInfo.Id, userInfo);
    }

    private onBGUserLeft(userId: string) {
        if (this.m_BGUserList.has(userId))
            this.Log(this.m_BGUserList.get(userId).Name + " has left");

        if (this.m_BGUserList.has(userId)) {
            let conn: BizGazeConnection = this.connMap.get(userId);
            if (conn != null)
                conn.closePeerConnection();

            this.m_BGUserList.delete(userId);
            this.connMap.delete(userId);
        }

        //self leave
        if (userId == this.myInfo.Id) {
            this.onBGConferenceLeft();
        }
    }



    private registerBGServerCallbacks() {
        this.connection.on(BGC_Msg.ROOM_JOINED, (roomId: number, strMyInfo: string) => {
            let info: any = JSON.parse(strMyInfo);
            this.onBGConferenceJoined(roomId, info);
        });

        this.connection.on(BGC_Msg.ROOM_USER_JOINED, (strUserInfo: string) => {
            let info: any = JSON.parse(strUserInfo);
            this.onBGUserJoined(info);
        });

        this.connection.on(BGC_Msg.ERROR, (message: string) => {
            alert(message);
            this.forceStop();
        });


        this.connection.on(BGC_Msg.ROOM_LEFT, (clientId: string) => {
            this.onBGUserLeft(clientId);
        });


        this.connection.on(BGC_Msg.SIGNALING, (sourceId: string, strMsg: string) => {
            /*console.log(' received signaling message:', strMsg);
            let msg = JSON.parse(strMsg);
            if (sourceId != this.myInfo.Id && this.connMap.has(sourceId)) {
                let peerConn: BizGazeConnection = this.connMap.get(sourceId);
                peerConn.onSignalingMessage(msg);
            }*/
        });

        this.connection.on(BGC_Msg.ROOM_INFO, (strInfo: string) => {
            let info = JSON.parse(strInfo);
            this.roomInfo.subject = info.subject;
            this.roomInfo.elapsed = info.elapsed;

            //update local ts
            this.localStartTimestamp = Date.now();
        });

    }

    private sendBGSignalingMessage(destId: string, msg: any) {
        this.connection.invoke(BGC_Msg.SIGNALING, this.myInfo.Id, destId, JSON.stringify(msg)).catch((err: any) => {
            return console.error(err.toString());
        });
    }

    /**
     * **************************************************************************
     *                Meeting Logic
     *        Moderator
     *        Mute/Unmute Audio/Video
     *        ScreenShare
     *        Recording
     *        Chatting
     *        
     * **************************************************************************
     */

    //moderator
    public grantModeratorRole(targetId: string) {
        let param = new CommandParam();
        param.value = targetId;
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.GRANT_HOST_ROLE, param);
    }

    private onChangedModerator(param: CommandParam) {
        const targetId = param.value;
        const user = this.jitsiRoom.getParticipantById(targetId);
        if (user && !user.getProperty(UserProperty.isModerator)) {
            user.setProperty(UserProperty.isModerator, true);
            this._updateUserPanel(user);
        } else if (targetId == this.jitsiRoom.myUserId() && !this.myInfo.IsHost) {
            this.myInfo.IsHost = true;
            this._updateMyPanel();
            this.jitsiRoom.getParticipants().forEach((user: JitsiParticipant) => {
                this._updateUserPanel(user);
            });
        }
    }

    //mute/unmute
    public muteMyAudio(mute: boolean) {
        this.localTracks.forEach(async track => {
            if (track.getType() === MediaType.AUDIO) {
                if (mute) await track.mute();
                else await track.unmute();
            }
        });

    }
    public muteMyVideo(mute: boolean) {
        this.localTracks.forEach(async track => {
            if (track.getType() === MediaType.VIDEO) {
                if (mute) await track.mute();
                else await track.unmute();
            }
        });
    }

    public muteUserAudio(targetId: string, mute: boolean) {
        let param = new CommandParam();
        param.value = targetId;
        param.attributes = { mute: mute };
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.MUTE_AUDIO, param);
    }

    public muteUserVideo(targetId: string, mute: boolean) {
        debugger;
        let param = new CommandParam();
        param.value = targetId;
        param.attributes = { mute: mute };
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.MUTE_VIDEO, param);
    }

    //these are called when user press bottom toolbar buttons
    public OnToggleMuteMyAudio() {
        if (this.myInfo.IsHost) {
            let audioMuted = false;
            this.localTracks.forEach(track => {
                if (track.getType() === MediaType.AUDIO && track.isMuted()) audioMuted = true;
            });
            this.muteMyAudio(!audioMuted);
        }
    }

    public OnToggleMuteMyVideo() {
        if (this.myInfo.IsHost) {
            let videoMuted = false;
            this.localTracks.forEach(track => {
                if (track.getType() === MediaType.VIDEO && track.isMuted()) videoMuted = true;
            });
            this.muteMyVideo(!videoMuted);
        }
    }

    private onMutedAudio(param: CommandParam) {
        const targetId = param.value;
        if (targetId == this.jitsiRoom.myUserId()) {
            //IMPORTANT! attributes comes with string 
            const mute = param.attributes.mute === "true";
            this.muteMyAudio(mute);
        }
    }

    private onMutedVideo(param: CommandParam) {
        const targetId = param.value;
        if (targetId == this.jitsiRoom.myUserId()) {
            const mute = param.attributes.mute === "true";
            this.muteMyVideo(mute);
        }
    }

    private onTrackMuteChanged(track: JitsiTrack) {
        //update ui
        const id = track.getParticipantId();
        const user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this._updateUserPanel(user);
        } else if (id === this.jitsiRoom.myUserId()) {
            this._updateMyPanel();
            this.m_UI.updateToolbar(this.myInfo, this.localTracks);
        }
    }

    //screenshare
    public async toggleScreenShare() {
        if (this.screenSharing)
            await this.turnOnCamera();
        else
            await this.turnOnScreenShare();

        this.m_UI.setScreenShare(this.screenSharing);
    }

    //turn on screen share
    async turnOnScreenShare() {
        await this.JitsiMeetJS.createLocalTracks({
            devices: ['desktop']
        })
        .then(async (tracks: JitsiTrack[]) => {
            if (tracks.length <= 0) {
                return;
            }

            const screenTrack: JitsiTrack = tracks[0];
            screenTrack.addEventListener(
                this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => this.Log('screen - mute chagned'));
            screenTrack.addEventListener(
                this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => {
                    this.Log('screen - stopped');
                    this.toggleScreenShare();
                });

            //remove camera track
            let i = 0;
            let oldTrack: JitsiTrack = null;
            while (i < this.localTracks.length) {
                if (this.localTracks[i].getType() === MediaType.VIDEO) {
                    oldTrack = this.localTracks[i];
                    break;
                } else {
                    ++i;
                }
            }

            await this.jitsiRoom.replaceTrack(oldTrack, screenTrack).then(() => {
                if (oldTrack) {
                    oldTrack.dispose();
                    this.localTracks.splice(i, 1);
                }
                this.localTracks.push(screenTrack);
                screenTrack.attach(this.localVideoElem);
                this.screenSharing = true;
            });
        })
        .catch((error: any) => {
            this.screenSharing = false;
        });
    }

    private async turnOnCamera() {
        await this.JitsiMeetJS.createLocalTracks({
            devices: [MediaType.VIDEO]
        })
            .then(async (tracks: JitsiTrack[]) => {
                if (tracks.length <= 0)
                    return;

                const videoTrack: JitsiTrack = tracks[0];
                this.localTracks.push(videoTrack);
                videoTrack.addEventListener(
                    this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    () => this.Log('local track muted'));
                videoTrack.addEventListener(
                    this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => this.Log('local track stoped'));

                //remove camera track
                let i = 0;
                let oldTrack: JitsiTrack = null;
                while (i < this.localTracks.length) {
                    if (this.localTracks[i].getType() === MediaType.VIDEO) {
                        oldTrack = this.localTracks[i];
                        break;
                    } else {
                        ++i;
                    }
                }

                await this.jitsiRoom.replaceTrack(oldTrack, videoTrack).then(() => {
                    if (oldTrack) {
                        oldTrack.dispose();
                        this.localTracks.splice(i, 1);
                    }
                    this.localTracks.push(videoTrack);
                    videoTrack.attach(this.localVideoElem);

                    this.screenSharing = false;
                });

            })
            .catch((error: any) => {
                this.screenSharing = true;
                console.log(error)
            });
    }    

    /*chat*/
    sendChatMessage(msg: string) {
        this.jitsiRoom.sendTextMessage(msg);
    }

    onReceiveChatMessage(id: string, msg: string, timestamp: string) {
        if (this.jitsiRoom.myUserId === id)
            return;

        const user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this.m_UI.receiveMessage(user.getDisplayName(), msg, timestamp);
        }
    }

    /* record */
    mediaRecorder: MediaRecorder;
    recorderStream: MediaStream;
    recordingData:any = [];

    public async toggleRecording() {
        if (this.recording)
            await this.stopRecording();
        else
            await this.startRecording();

        this.m_UI.setRecording(this.recording);
    }

    async startRecording()
    {
        let gumStream: MediaStream;
        let gdmStream: MediaStream;

        try {
            gumStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            gdmStream = await navigator.mediaDevices.getDisplayMedia(
                {
                    video: { displaySurface: "browser" },
                    audio: { channelCount: 2 }
                });


            gdmStream.addEventListener('inactive', (event) => {
                if (this.recording)
                    this.toggleRecording();
            });
        } catch (e) {
            console.error("capture failure", e);
            return;
        }

        this.recorderStream = gumStream ? this.mixer(gumStream, gdmStream) : gdmStream;
        this.mediaRecorder = new MediaRecorder(this.recorderStream, { mimeType: 'video/webm' });

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                this.recordingData.push(e.data);
                if (!this.recording && !this.downloadRecordFile) {
                    this.downloadRecordingFile();
                }
            }
        };

        this.mediaRecorder.onstop = () => {
            this.recorderStream.getTracks().forEach(track => track.stop());
            gumStream.getTracks().forEach(track => track.stop());
            gdmStream.getTracks().forEach(track => track.stop());    
        };

        this.recorderStream.addEventListener('inactive', () => {
            console.log('Capture stream inactive');
            this.stopRecording();
        });

        this.recordingData = [];
        this.mediaRecorder.start();

        this.recording = true;
        this.downloadRecordFile = false;
    }

    async stopRecording() {
        if (!this.recording)
            return;

        await this.mediaRecorder.stop();
        this.downloadRecordingFile();
        this.recording = false;
    }

    downloadRecordingFile() {
        if (this.downloadRecordFile || this.recordingData.length <= 0)
            return;

        const blob = new Blob(this.recordingData, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${this.getRecordingFilename()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 5000);

        this.downloadRecordFile = true;
    }

    getRecordingFilename(): string{
        const now = new Date();
        const timestamp = now.toISOString();
        return `${this.roomInfo.subject}_recording_${timestamp}`;
    }

    private mixer(stream1: MediaStream, stream2: MediaStream) : MediaStream {
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();

        if (stream1.getAudioTracks().length > 0)
            ctx.createMediaStreamSource(stream1).connect(dest);

        if (stream2.getAudioTracks().length > 0)
            ctx.createMediaStreamSource(stream2).connect(dest);

        let tracks = dest.stream.getTracks();
        tracks = tracks.concat(stream1.getVideoTracks()).concat(stream2.getVideoTracks());

        return new MediaStream(tracks);
    }

    /**
     * **************************************************************************
     *              Log
     * **************************************************************************
     */

    private Log(message: string) {
        console.log(message);
        if (this.m_UI != null)
            this.m_UI.Log(message);
    }
}

const meeting: BizGazeMeeting = new BizGazeMeeting();
meeting.start();