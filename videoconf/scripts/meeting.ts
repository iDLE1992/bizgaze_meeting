"use strict";

import * as signalR from "@microsoft/signalr";
import { BGtoUser } from "./protocol/bg"
import { MeetingUI } from "./meeting_ui";
import { UserInfo } from "./model/BGUser"
import { BGMeetingInfo } from "./model/BGMeeting";
import { JitsiTrack } from "./jitsi/JitsiTrack"
import { JitsiParticipant } from "./jitsi/JitsiParticipant"
import { MediaType } from "./enum/MediaType";
import { JitsiCommandParam } from "./jitsi/JitsiCommandParam"
import { UserProperty } from "./enum/UserProperty"
import { TsToDateFormat } from "./util/TimeUtil"
import { ActiveDevices } from "./model/ActiveDevices"
import { InputMediaPolicy } from "./model/InputDevicePolicy";
import { ChannelType } from "./enum/ChannelType";
import { JitsiCommand, JitsiPrivateCommand } from "./protocol/jitsi";
import { NotificationType } from "./enum/NotificationType";
import { JitsiCommandQueue, JitsiPrivateCommandQueue } from "./jitsi/JitsiCommandQueue";
import { FileMeta } from "./file/FileMeta";
import { VideoPanel } from "./components/VideoPanel";

declare global {
    interface Window {
        _roomId: number;
        _userId: string;
        _anonymousUserName: string; //
        _camId: string;
        _micId: string;
        _speakerId: string;
        _videoMute: string;
        _audioMute: string;

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
        ondataavailable(event: any): void;
        onstop(): void;
        addEventListener(event: string, callback: Function): void;
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



class MeetingConfig {
    resetMuteOnDeviceChange: boolean = true;
    hideToolbarOnMouseOut: boolean = false;
}

export class BizGazeMeeting {
    connection: signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();

    joinedBGConference: boolean = false;

    ui: MeetingUI = new MeetingUI(this);

    roomInfo: BGMeetingInfo = new BGMeetingInfo();
    m_BGUserList = new Map<string, UserInfo>();

    localVideoPanel: VideoPanel = null;

    myInfo: UserInfo = new UserInfo();

    JitsiMeetJS: any = window.JitsiMeetJS;
    jitsiRoom: any;/*JitsiConference*/
    jitsiConnection: any;


    //JitsiServerDomain = "idlests.com";
    JitsiServerDomain = "unimail.in";

    localTracks: JitsiTrack[] = [];

    screenSharing = false;
    recording = false;
    downloadRecordFile = false;

    localStartTimestamp: number;

    //default devices
    activeCameraId: string = window._camId;
    activeMicId: string = window._micId;
    activeSpeakerId: string = window._speakerId;

    config = new MeetingConfig();

    commandQueue = new JitsiCommandQueue();
    privateCommandQueue = new JitsiPrivateCommandQueue();

    constructor() {
    }

    /**
     * **************************************************************************
     *              START ~ END
     *
     * **************************************************************************
     */

    start() {
        if (!window._roomId) {
            this.leaveBGConference();
            return;
        }

        //jitsi init
        const initOptions = {
            disableAudioLevels: true
        };
        this.JitsiMeetJS.setLogLevel(this.JitsiMeetJS.logLevels.ERROR);
        this.JitsiMeetJS.init(initOptions);

        //device log
        this.JitsiMeetJS.mediaDevices.enumerateDevices((devices: any[]) => {
            devices.forEach(d => {
                if (this.activeCameraId.length > 0 && d.deviceId === this.activeCameraId) {
                    this.Log("Camera: " + d.label);
                }
                if (this.activeMicId.length > 0 && d.deviceId === this.activeMicId && d.kind === 'audioinput') {
                    this.Log("Microphone: " + d.label);
                }
            })
        });

        //connect to bg server
        this.connectToBGServer(() => {
            this.Log("Connected to BizGaze SignalR Server");
            this.joinBGConference(); // => onBGConferenceJoined
        });
    }

    stop() {
        //todo 
        //if it was recording, save it before stop

        if (this.jitsiRoomJoined()) {
            this.stopAllMediaStreams();
            this.jitsiRoom.leave().then(() => {
                this.leaveBGConference();
            }).catch((error: any) => {
                this.leaveBGConference();
            });
        } else {
            this.leaveBGConference();
        }
    }

    forceStop() {
        this.stop();
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
        this.connection.invoke(
            "Join",
            `${window._roomId}`,
            `${window._userId}`,
            `${window._anonymousUserName}`,
        ).catch((err: any) => {
            return console.error("Join Meeting Failed.", err.toString());
        });
    }

    //this is the entry point where we can decide webinar/group chatting
    //                        where we can decide i am host or not
    private onBGConferenceJoined(roomInfo: BGMeetingInfo, userInfo: UserInfo) {
        this.joinedBGConference = true;
        this.localStartTimestamp = Date.now();

        this.roomInfo = roomInfo;
        this.Log("Meeting Type: " + (roomInfo.IsWebinar ? "Webinar" : "Group Chatting"));

        this.myInfo.Id = userInfo.Id;
        this.myInfo.Name = userInfo.Name;
        this.myInfo.IsHost = userInfo.IsHost;

        const deviceUsePolicy = this.getInitMediaPolicy();
        this.myInfo.mediaPolicy.useCamera = deviceUsePolicy.useCamera;
        this.myInfo.mediaPolicy.useMic = deviceUsePolicy.useMic;

        this.ui.updateByRole(this.myInfo.IsHost);
        this.ui.toolbar.updateByRole(this.myInfo.IsHost);
        this.ui.updateJoiningInfo();

        this.initMediaDevices()
            .then(_ => {
                //connect to jitsi server and enter room
                this.connectToJitsiServer();
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

    private onBGConferenceLeft() {
        this.joinedBGConference = false;

        this.stopAllMediaStreams();
        this.m_BGUserList.clear();
        $("form#return").submit();
    }

    private onBGUserJoined(userInfo: UserInfo) {
        this.m_BGUserList.set(userInfo.Id, userInfo);
    }

    private onBGUserLeft(userId: string) {
        //self leave
        if (userId == this.myInfo.Id) {
            this.onBGConferenceLeft();
        }
        // participant left
        else {
            if (this.m_BGUserList.has(userId)) {
                const bizUser = this.m_BGUserList.get(userId);
                if (bizUser.Jitsi_Id && this.jitsiRoomJoined()) {
                    const jitsiUser = this.jitsiRoom.getParticipantById(bizUser.Jitsi_Id) as JitsiParticipant;
                    if (jitsiUser)
                        this.onJitsiUserLeft(bizUser.Jitsi_Id, jitsiUser);
                }
                this.Log(this.m_BGUserList.get(userId).Name + " has left");
                this.m_BGUserList.delete(userId);
            }
        }
    }

    private registerBGServerCallbacks() {
        this.connection.on(BGtoUser.ROOM_JOINED, (strRoomInfo: string, strMyInfo: string) => {
            const roomInfo: BGMeetingInfo = JSON.parse(strRoomInfo);
            const myInfo: UserInfo = JSON.parse(strMyInfo);
            this.onBGConferenceJoined(roomInfo, myInfo);
        });

        this.connection.on(BGtoUser.ROOM_USER_JOINED, (strUserInfo: string) => {
            let info: any = JSON.parse(strUserInfo);
            this.onBGUserJoined(info);
        });

        this.connection.on(BGtoUser.ERROR, (message: string) => {
            alert(message);
            this.forceStop();
        });


        this.connection.on(BGtoUser.ROOM_LEFT, (clientId: string) => {
            this.onBGUserLeft(clientId);
        });


        this.connection.on(BGtoUser.SIGNALING, (sourceId: string, strMsg: string) => {
            /*console.log(' received signaling message:', strMsg);
            let msg = JSON.parse(strMsg);
            if (sourceId != this.myInfo.Id && this.connMap.has(sourceId)) {
                let peerConn: BizGazeConnection = this.connMap.get(sourceId);
                peerConn.onSignalingMessage(msg);
            }*/
        });

    }

    private sendBGSignalingMessage(destId: string, msg: any) {
        this.connection.invoke(BGtoUser.SIGNALING, this.myInfo.Id, destId, JSON.stringify(msg)).catch((err: any) => {
            return console.error(err.toString());
        });
    }




    /**
     * **************************************************************************
     *              Local Camera/Microphone init
     *              
     * **************************************************************************
     */

    initMediaDevices(): Promise<any> {
        this.Log('Getting user media devices ...');

        //set speaker
        if (this.activeSpeakerId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerId);
        };

        //set input devices
        const cameraId = this.activeCameraId;
        const micId = this.activeMicId;

        return this.createLocalTracks(cameraId, micId)
            .then((tracks: JitsiTrack[]) => {
                if (tracks.length <= 0) {
                    throw new Error("no tracks");
                }

                tracks.forEach((track: JitsiTrack, index: number) => {
                    if (track.getType() === MediaType.VIDEO) {
                        if (!this.myInfo.mediaPolicy.useCamera) track.mute();
                        else track.unmute();
                    }
                    else if (track.getType() === MediaType.AUDIO) {
                        if (!this.myInfo.mediaPolicy.useMic) track.mute();
                        else track.unmute();
                    }
                });

                this.onLocalTrackAdded(tracks);
                return Promise.resolve();
            }).catch((error: any) => {
                this.ui.toolbar.update(this.myInfo, this.getLocalTracks());
                if (!this.roomInfo.IsWebinar || this.myInfo.IsHost)
                    this._updateMyPanel();

                return Promise.resolve();
            });
    }

    createVideoTrack(cameraDeviceId: string): Promise<JitsiTrack[]> {

        return this.JitsiMeetJS.createLocalTracks({
            devices: ['video'],
            cameraDeviceId,
            micDeviceId: null
        })
            .catch((error: any) => {
                this.Log(error);
                return Promise.resolve([]);
            });
    }

    createAudioTrack(micDeviceId: string): Promise<JitsiTrack[]> {
        return (
            this.JitsiMeetJS.createLocalTracks({
                devices: ['audio'],
                cameraDeviceId: null,
                micDeviceId
            })
                .catch((error: any) => {
                    this.Log(error);
                    return Promise.resolve([]);
                }));
    }

    createLocalTracks(cameraDeviceId: string, micDeviceId: string): Promise<JitsiTrack[]> {

        if (cameraDeviceId != null && micDeviceId != null) {
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['audio', 'video'],
                cameraDeviceId,
                micDeviceId
            }).catch(() => Promise.all([
                this.createAudioTrack(micDeviceId).then(([stream]) => stream),
                this.createVideoTrack(cameraDeviceId).then(([stream]) => stream)
            ])).then((tracks: JitsiTrack[]) => {
                return tracks.filter(t => typeof t !== 'undefined');
            });
        } else if (cameraDeviceId != null) {
            return this.createVideoTrack(cameraDeviceId);
        } else if (micDeviceId != null) {
            return this.createAudioTrack(micDeviceId);
        }

        return Promise.resolve([]);
    }

    private async onLocalTrackAdded(tracks: JitsiTrack[]) {
        if (tracks.length <= 0)
            return;

        for (let i = 0; i < tracks.length; i++) {
            tracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                (audioLevel: number) => console.log(`Audio Level local: ${audioLevel}`));
            tracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                (track: JitsiTrack) => { this.updateUiOnLocalTrackChange(); });
            tracks[i].addEventListener(
                this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                (track: JitsiTrack) => { this.updateUiOnLocalTrackChange(); });
            tracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                (deviceId: string) =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));

            if (this.jitsiRoomJoined())
                this.Log("[ OUT ] my track - " + tracks[i].getType());
            await this.replaceLocalTrack(tracks[i], tracks[i].getType());
        }

        //toolbar
        this.ui.toolbar.update(this.myInfo, this.getLocalTracks());

        //my video panel
        this._updateMyPanel();
        const localVideoTrack = this.getLocalTrackByType(MediaType.VIDEO);
        if (localVideoTrack && this.localVideoPanel) {
            localVideoTrack.attach(this.localVideoPanel.videoElem);
            this.localVideoPanel.videoElem.play();
            this.localVideoPanel.setShotnameVisible(false);
        }
    }

    private stopAllMediaStreams() {
        const localTracks = [...this.getLocalTracks()];
        localTracks.forEach((track: JitsiTrack) => {
            this.removeLocalTrack(track).then(_ => {
                track.dispose();
            });
        });
    }

    public onDeviceChange(newDevices: ActiveDevices) {

        const videoDeviceChanged = this.activeCameraId !== newDevices.cameraId;
        const audioDeviceChanged = this.activeMicId !== newDevices.micId;

        //create new tracks with new devices
        this.createLocalTracks(videoDeviceChanged ? newDevices.cameraId : null,
            audioDeviceChanged ? newDevices.micId : null)
            .then((tracks: JitsiTrack[]) => {
                this.onLocalTrackAdded(tracks);
            });


        this.activeCameraId = newDevices.cameraId;
        this.activeMicId = newDevices.micId;
        this.activeSpeakerId = newDevices.speakerId;
    }

    public getActiveDevices(): ActiveDevices {
        let activeDevices = new ActiveDevices();
        activeDevices.cameraId = this.activeCameraId;
        activeDevices.micId = this.activeMicId;
        activeDevices.speakerId = this.activeSpeakerId;

        return activeDevices;
    }

    private getInitMediaPolicy(): InputMediaPolicy {
        let useCamera = true;
        let useMic = true;

        if (this.roomInfo.IsWebinar) {
            if (!this.myInfo.IsHost) {
                useCamera = false;
                useMic = false;
            }
        }

        if (this.roomInfo.channelType === ChannelType.AudioOnly)
            useCamera = false;

        if (this.roomInfo.channelType === ChannelType.VideoOnly)
            useMic = false;

        if (window._videoMute !== "true")
            useCamera = false;

        if (window._audioMute !== "true")
            useMic = false;

        const policy = new InputMediaPolicy();
        policy.useCamera = useCamera;
        policy.useMic = useMic;

        this.Log("useCamera " + useCamera);
        this.Log("useMic " + useMic);

        return policy;
    }



    /**
     * **************************************************************************
     *              Local Track Access
     *              
     * **************************************************************************
     */
    jitsiRoomJoined(): boolean {
        return this.jitsiRoom && this.jitsiRoom.isJoined();
    }

    getLocalTracks(): JitsiTrack[] {
        if (this.jitsiRoomJoined())
            return this.jitsiRoom.getLocalTracks();
        else
            return this.localTracks;
    }

    private getLocalTrackByType(type: MediaType): JitsiTrack {
        if (this.jitsiRoomJoined()) {
            const tracks = this.jitsiRoom.getLocalTracks(type);
            if (tracks.length > 0) return tracks[0];
            return null;
        } else {
            const track = this.localTracks.find((t: JitsiTrack) => t.getType() === type);
            return track;
        }
    }

    private removeLocalTrack(track: JitsiTrack): Promise<any> {
        if (this.jitsiRoomJoined()) {
            return this.jitsiRoom.removeTrack(track);
        } else {
            const index = this.localTracks.indexOf(track);
            if (index >= 0) this.localTracks.splice(index, 1);
            return Promise.resolve();
        }
    }

    //type is neccessray when newTrack is null
    private async replaceLocalTrack(newTrack: JitsiTrack, type: MediaType): Promise<any> {
        const oldTrack = this.getLocalTrackByType(type);
        if (oldTrack === newTrack) return Promise.reject();
        if (!oldTrack && !newTrack) return Promise.reject();

        if (this.jitsiRoomJoined()) {
            return this.jitsiRoom.replaceTrack(oldTrack, newTrack).then((_: any) => {
                if (oldTrack) oldTrack.dispose();
                this.updateUiOnLocalTrackChange();
                return Promise.resolve();
            });
        } else {
            return this.removeLocalTrack(oldTrack).then(_ => {
                if (oldTrack) oldTrack.dispose();
                if (newTrack) this.localTracks.push(newTrack);
                this.updateUiOnLocalTrackChange();
                return Promise.resolve();
            });
        }
    }


    private updateUiOnLocalTrackChange() {
        if (this.localVideoPanel)
            this._updateMyPanel();
        this.ui.toolbar.update(this.myInfo, this.getLocalTracks());
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
        const serverdomain = this.JitsiServerDomain;

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
        this.Log("Connected to Jitsi Server - " + this.JitsiServerDomain);
        this.joinJitsiConference();
    }

    onJitsiConnectionFailed() {
        this.Log("Failed to connect Jitsi Server - " + this.JitsiServerDomain);
        this.stop();
    }

    disconnectFromJitsiServer() {
        this.Log("Disconnected from Jitsi Server - " + this.JitsiServerDomain);
        this.stop();
    }

    private joinJitsiConference() {
        const confOptions = {
            openBridgeChannel: true
        };

        this.jitsiRoom = this.jitsiConnection.initJitsiConference(`${this.roomInfo.Id}`, confOptions);

        //remote track
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, (track: any) => {
            this.onRemoteTrackAdded(track);
        });
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, (track: any) => {
            this.onRemovedRemoteTrack(track);
        });

        //my join
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            () => { this.onJitsiConferenceJoined(); });

        //my left
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.CONFERENCE_LEFT,
            async () => { this.onJitsiConferenceLeft(); }
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
            (track: JitsiTrack) => {
                if (track.isLocal())
                    this.onLocalTrackMuteChanged(track);
                else 
                    this.onRemoteTrackMuteChanged(track);
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

        //private message object
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED,
            (peer: any, message: any) => {
                if (message && message.type === "biz_private") {
                    this.onPrivateCommand(message.senderId, message.subtype, message.message);
                }
            }
        );

        //dominant speaker
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED,
            (id: string, previousSpeakers: []) => {
                this.onDominantSpeakerChanged(id);
            }
        );

        //name change
        this.jitsiRoom.on(
            this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
            (userID: string, displayName: string) => {
                console.log(`${userID} - ${displayName}`)
            });

        //command
        this.jitsiRoom.addCommandListener(JitsiCommand.GRANT_HOST_ROLE, (param: JitsiCommandParam) => {
            this.onChangedModerator(param)
        });
        this.jitsiRoom.addCommandListener(JitsiCommand.MUTE_AUDIO, (param: JitsiCommandParam) => {
            this.onMutedAudio(param)
        });
        this.jitsiRoom.addCommandListener(JitsiCommand.MUTE_VIDEO, (param: JitsiCommandParam) => {
            this.onMutedVideo(param)
        });
        /*this.jitsiRoom.addCommandListener(JitsiCommand.ALLOW_CAMERA, (param: JitsiCommandParam) => {
            this.onAllowCameraCommand(param)
        });
        this.jitsiRoom.addCommandListener(JitsiCommand.ALLOW_MIC, (param: JitsiCommandParam) => {
            this.onAllowMicCommand(param)
        });*/
        this.jitsiRoom.addCommandListener(JitsiCommand.INIT_MEDIA_POLICY, (param: JitsiCommandParam) => {
            this.onInitMediaPolicy(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.BIZ_ID, (param: JitsiCommandParam) => {
            this.onBizId(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.ASK_RECORDING, (param: JitsiCommandParam) => {
            this.onAskRecording(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.ASK_SCREENSHARE, (param: JitsiCommandParam) => {
            this.onAskScreenShare(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.ASK_HANDRAISE, (param: JitsiCommandParam) => {
            this.onAskHandRaise(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.FILE_META, (param: JitsiCommandParam) => {
            this.onFileMeta(param);
        })
        this.jitsiRoom.addCommandListener(JitsiCommand.FILE_SLICE, (param: JitsiCommandParam) => {
            this.onFileData(param);
        })

        //set name
        this.jitsiRoom.setDisplayName(this.myInfo.Name);

        for (let i = 0; i < this.localTracks.length; i++) {
            this.Log("[ OUT ] my track - " + this.localTracks[i].getType());
            this.jitsiRoom.addTrack(this.localTracks[i]).catch((error: any) => {
                this.Log(error);
            });
        }

        //joinJitsiConference
        this.jitsiRoom.join(); //callback -  onJitsiUserJoined
    }

    leaveJitsiConference() {

    }

    //my enter room
    onJitsiConferenceJoined() {
        this.myInfo.Jitsi_Id = this.jitsiRoom.myUserId();
        this.Log(`Jitsi_Id : ${this.myInfo.Jitsi_Id}`);

        //set subject
        this.ui.meetingDescWidget.setSubject(this.roomInfo.conferenceName, this.roomInfo.hostName);

        let audioMute = true;
        let videoMute = true;
        this.getLocalTracks().forEach((track) => {
            if (track.getType() === MediaType.VIDEO && !track.isMuted()) videoMute = false;
            if (track.getType() === MediaType.AUDIO && !track.isMuted()) audioMute = false;
        });
        //add list
        //if (this.myInfo.IsHost) 
        {
            this.ui.addParticipant(
                this.jitsiRoom.myUserId(),
                this.myInfo.Name,
                true,
                videoMute,
                audioMute);
        }

        //set time
        setInterval(() => {
            const delta = Date.now() - this.localStartTimestamp;
            const elapsed = this.roomInfo.elapsed + delta;
            this.ui.meetingDescWidget.updateTime(TsToDateFormat(elapsed));
        }, 1000);

        //send media policy
        this.sendJitsiBroadcastCommand(
            JitsiCommand.INIT_MEDIA_POLICY,
            this.myInfo.Jitsi_Id,
            this.myInfo.mediaPolicy);

        //send bizgaze id
        this.sendJitsiBroadcastCommand(
            JitsiCommand.BIZ_ID,
            this.myInfo.Id,
        );
    }

    //my leave room
    onJitsiConferenceLeft() {
        this.myInfo.Jitsi_Id = null;
        this.leaveBGConference();
    }

    //remote-user enter room
    onJitsiUserJoined(jitsiId: string, user: JitsiParticipant) {
        this.Log(`joined user: ${user.getDisplayName()}`);

        this.ui.notification(user.getDisplayName(),
            "New Participant joined", NotificationType.User);

        //if track doesn't arrive for certain time
        //generate new panel for that user
        if (!this.roomInfo.IsWebinar) {
            setTimeout(() => {
                if (!user.getProperty(UserProperty.videoPanel)) {
                    const videoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
                    user.setProperty(UserProperty.videoPanel, videoPanel);
                    this._updateUserPanel(user);
                }
            }, 1000);
        }


        let audioMute = true;
        let videoMute = true;
        user.getTracks().forEach((track) => {
            if (track.getType() === MediaType.VIDEO && !track.isMuted()) videoMute = false;
            if (track.getType() === MediaType.AUDIO && !track.isMuted()) videoMute = false;
        });
        
        //add list
        //if (this.myInfo.IsHost) 
        {
            this.ui.addParticipant(
                jitsiId,
                user.getDisplayName(),
                false, //me?
                videoMute, //use camera?
                audioMute  //use mic?
            );
        }

        //notify him that i am moderator
        if (this.myInfo.IsHost)
            this.grantModeratorRole(this.jitsiRoom.myUserId());

        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.MEDIA_POLICY, this.myInfo.mediaPolicy);

        this.commandQueue.executeQueuedCommands(jitsiId);
        this.privateCommandQueue.executeQueuedCommands(jitsiId);
    }

    //remote leave room
    onJitsiUserLeft(jitsiId: string, user: any) {
        this.ui.notification_warning(user.getDisplayName(),
            "Participant left", NotificationType.User);
        this.Log(`left user: ${user.getDisplayName()}`);

        const videoPanel = user.getProperty(UserProperty.videoPanel);
        if (videoPanel) {
            this.ui.videoPanelGrid.freeVideoPanel(videoPanel.Id);
            user.setProperty(UserProperty.videoPanel, null);
        }
            

        //remove list
        this.ui.removeParticipant(jitsiId);

        //remove from list
        this.m_BGUserList.forEach((bzUser, bizId) => {
            if (bzUser.Jitsi_Id == jitsiId) {
                this.m_BGUserList.delete(bizId);
            }
        })
    }

    onBizId(param: JitsiCommandParam) {
        const senderJitsiId = param.attributes.senderId;
        if (senderJitsiId === this.myInfo.Jitsi_Id)
            return;

        const user = this.jitsiRoom.getParticipantById(senderJitsiId) as JitsiParticipant;
        if (user) {
            const bizId = param.value;
            const bizUser = this.m_BGUserList.get(bizId);
            if (bizUser)
                bizUser.Jitsi_Id = senderJitsiId;
        } else {
            this.commandQueue.queueCommand(
                senderJitsiId,
                JitsiCommand.BIZ_ID,
                param,
                this.onBizId.bind(this));
        }
    }

    //[ IN ] remote track
    onRemoteTrackAdded(track: JitsiTrack) {
        if (track.isLocal()) {
            return;
        }
        this.Log(`[ IN ] remote track - ${track.getType()}`);

        if (this.roomInfo.IsWebinar && track.isMuted())
            return;

        //add to ui
        const id = track.getParticipantId();
        const user = this.jitsiRoom.getParticipantById(id) as JitsiParticipant;
        if (!user) {
            this.Log(`${user.getDisplayName()} not yet added`);
            return;
        }

        let videoPanel = user.getProperty(UserProperty.videoPanel) as VideoPanel;
        if (!videoPanel) {
            videoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
            user.setProperty(UserProperty.videoPanel, videoPanel);
        }

        if (track.getType() === MediaType.VIDEO) {
            const videoElem = videoPanel.videoElem as HTMLMediaElement;
            track.attach(videoElem);
            videoElem.play();
        }
        else if (track.getType() === MediaType.AUDIO) {
            const audioElem = videoPanel.audioElem as HTMLMediaElement;
            track.attach(audioElem);
            audioElem.play();
        }

        this._updateUserPanel(user);
    }


    // [DEL] remote track
    onRemovedRemoteTrack(track: JitsiTrack) {
        if (track.isLocal()) {
            this.Log("[ DEL ] localtrack - " + track.getType());
        } else {
            this.Log("[ DEL ] remotetrack - " + track.getType());
        }

        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_VIDEOTYPE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.NO_DATA_FROM_SOURCE);

        if (!track.isLocal()) {
            const jitsiId = track.getParticipantId();
            const user = this.jitsiRoom.getParticipantById(jitsiId) as JitsiParticipant;
            if (this.roomInfo.IsWebinar) {
                const IsHost = user.getProperty(UserProperty.IsHost);
                const userVideoPanel = user.getProperty(UserProperty.videoPanel) as VideoPanel;
                if (!IsHost && user.getTracks().length <= 0 && userVideoPanel) {
                    this.ui.videoPanelGrid.freeVideoPanel(userVideoPanel.Id);
                    user.setProperty(UserProperty.videoPanel, null);
                }
            }

            this._updateUserPanel(user);
        } else {
            this.updateUiOnLocalTrackChange();
        }
    }

    private _updateUserPanel(user: JitsiParticipant) {
        if (user && user.getProperty(UserProperty.videoPanel)) {
            const videoPanel = user.getProperty(UserProperty.videoPanel) as VideoPanel;
            videoPanel.updatePanelOnJitsiUser(this.myInfo, user);
        }
    }

    private _updateMyPanel() {
        if (this.localVideoPanel == null) {
            if (this.roomInfo.IsWebinar && !this.myInfo.IsHost) {
                let isAllMuted = true;
                this.getLocalTracks().forEach((track) => {
                    if (!track.isMuted()) isAllMuted = false;
                });
                if (!isAllMuted)
                    this.localVideoPanel = this.ui.videoPanelGrid.getNewVideoPanel();

            } else {
                this.localVideoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
            }
        }

        if (this.localVideoPanel)
            this.localVideoPanel.updatePanelOnMyBGUser(this.myInfo, this.getLocalTracks());
    }

    /**
     * **************************************************************************
     *                Messaging between Jitsi participants
     *        Broadcast
     *        Private
     *
     * **************************************************************************
     */

    //ATTENTION! attributes = {key1: not object, key2: not object, ...}
    //send as primitive type like boolean, string, number...
    //and decode when use value1, vaule2
    sendJitsiBroadcastCommand(type: JitsiCommand, value: any, attributes: any = null) {
        let param = new JitsiCommandParam();
        param.value = value;
        if (!!attributes && typeof attributes === "object" && attributes.constructor.name === "Object")
            param.attributes = { ...attributes };
        param.attributes.senderId = this.myInfo.Jitsi_Id;
        param.attributes.senderName = this.myInfo.Name;
        this.jitsiRoom.sendCommandOnce(type, param);
    }

    sendJitsiPrivateCommand(targetId: string, type: JitsiPrivateCommand, message: any) {
        let payload = {
            type: "biz_private",
            subtype: type,
            senderId: this.myInfo.Jitsi_Id,
            message: message
        };

        this.jitsiRoom.sendMessage(payload, targetId);
    }

    onPrivateCommand(senderId: string, type: JitsiPrivateCommand, message: any) {
        const user = this.jitsiRoom.getParticipantById(senderId) as JitsiParticipant;
        if (!user) {
            this.privateCommandQueue.queueCommand(senderId, type, message, this.onPrivateCommand.bind(this));
            return;
        }

        if (type === JitsiPrivateCommand.MEDIA_POLICY) {
            const policy = message as InputMediaPolicy;
            this.onUserMediaPolicy(senderId, policy);
        } else if (type === JitsiPrivateCommand.ALLOW_RECORDING) {
            const allow = message.allow;
            this.onAllowRecording(senderId, allow);
        } else if (type === JitsiPrivateCommand.ALLOW_SCREENSHARE) {
            const allow = message.allow;
            this.onAllowScreenshare(senderId, allow);
        } else if (type === JitsiPrivateCommand.ALLOW_HANDRAISE) {
            const allow = message.allow;
            this.onAllowHandRaise(senderId, allow);
        } else if (type === JitsiPrivateCommand.PRIVATE_CAHT) {
            this.onReceivePrivateChatMessage(senderId, message);
        }
    }

    /**
     * **************************************************************************
     *                Meeting Logic
     *        Moderator
     *        Mute/Unmute Audio/Video
     *        ScreenShare
     *        Recording
     *        Chatting
     *        File Sharing
     *        
     * **************************************************************************
     */

    //moderator
    grantModeratorRole(targetId: string) {
        this.Log("Sending grant host");
        this.sendJitsiBroadcastCommand(JitsiCommand.GRANT_HOST_ROLE, targetId);
    }

    onChangedModerator(param: JitsiCommandParam) {
        this.Log("received grant host");
        const targetId = param.value;
        const senderName = param.attributes.senderName;
        const senderId = param.attributes.senderId;

        if (targetId === this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                this.ui.notification_warning(senderName, "You're granted co-host permission", NotificationType.GrantHost);

                this.myInfo.IsHost = true;
                this._updateMyPanel();
                this.jitsiRoom.getParticipants().forEach((user: JitsiParticipant) => {
                    this._updateUserPanel(user);
                });
                this.ui.updateByRole(this.myInfo.IsHost);
            }
        } else {
            const user = this.jitsiRoom.getParticipantById(targetId);
            if (user) {
                user.setProperty(UserProperty.IsHost, true);
                this._updateUserPanel(user);
            } else {
                this.commandQueue.queueCommand(
                    targetId,
                    JitsiCommand.GRANT_HOST_ROLE,
                    param,
                    this.onChangedModerator.bind(this)
                );
            }
        }
    }

    onInitMediaPolicy(param: JitsiCommandParam) {
        const sourceId = param.value;
        if (sourceId === this.myInfo.Jitsi_Id)
            return;

        this.Log("received initMediaPolicy from " + sourceId);
        const user = this.jitsiRoom.getParticipantById(sourceId) as JitsiParticipant;
        if (user) {
            const useCamera = param.attributes.useCamera === "true";
            const useMic = param.attributes.useMic === "true";
            this.ui.participantsListWidget.setMuteCamera(sourceId, !useCamera);
            this.ui.participantsListWidget.setMuteMic(sourceId, !useMic);
        } else {
            this.Log("delaying initMediaPolicy callback");
            this.commandQueue.queueCommand(
                sourceId,
                JitsiCommand.INIT_MEDIA_POLICY,
                param,
                this.onInitMediaPolicy.bind(this));
        }
    }

    onUserMediaPolicy(senderId: string, policy: InputMediaPolicy) {
        this.ui.participantsListWidget.setMuteCamera(senderId, !policy.useCamera);
        this.ui.participantsListWidget.setMuteMic(senderId, !policy.useMic);
    }

    //mute myself
    //called when user click toolbar buttons
    public OnToggleMuteMyAudio() {
        if (this.roomInfo.IsControlAllowed && !this.myInfo.IsHost)
            return;

        let audioMuted = false;
        this.getLocalTracks().forEach(track => {
            if (track.getType() === MediaType.AUDIO && track.isMuted()) audioMuted = true;
        });
        this.muteMyAudio(!audioMuted);
    }

    public OnToggleMuteMyVideo() {
        if (this.roomInfo.IsControlAllowed && !this.myInfo.IsHost)
            return;

        let videoMuted = false;
        this.getLocalTracks().forEach(track => {
            if (track.getType() === MediaType.VIDEO && track.isMuted()) videoMuted = true;
        });
        this.muteMyVideo(!videoMuted);
    }

    public muteMyAudio(mute: boolean) {
        this.getLocalTracks().forEach(track => {
            if (track.getType() === MediaType.AUDIO) {
                if (mute) track.mute();
                else track.unmute();
            }
        });
    }
    public muteMyVideo(mute: boolean) {
        this.getLocalTracks().forEach(track => {
            if (track.getType() === MediaType.VIDEO) {
                if (mute) track.mute();
                else track.unmute();
            }
        });
    }

    //mute others
    public muteUserAudio(targetId: string, mute: boolean) {
        if (targetId === this.myInfo.Jitsi_Id)
            this.muteMyAudio(mute);
        else 
            this.sendJitsiBroadcastCommand(JitsiCommand.MUTE_AUDIO, targetId, { mute: mute });
    }

    public muteUserVideo(targetId: string, mute: boolean) {
        if (targetId === this.myInfo.Jitsi_Id)
            this.muteMyVideo(mute);
        else
            this.sendJitsiBroadcastCommand(JitsiCommand.MUTE_VIDEO, targetId, { mute: mute });
    }

    private onMutedAudio(param: JitsiCommandParam) {
        const targetId = param.value;
        const senderId = param.attributes.senderId;
        const senderName = param.attributes.senderName;
        const mute = param.attributes.mute === "true";

        if (targetId == this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                if (mute) {
                    this.ui.askDialog(
                        senderName,
                        "Requested to mute your microphone",
                        NotificationType.AudioMute,
                        this.muteMyAudio.bind(this),
                        null,
                        mute);
                }
                else {
                    this.ui.askDialog(
                        senderName,
                        "Requested to unmute your microphone",
                        NotificationType.Audio,
                        this.muteMyAudio.bind(this),
                        null,
                        mute);
                }
            } else {
                this.muteMyAudio(mute);
            }
        }
    }

    private onMutedVideo(param: JitsiCommandParam) {
        const targetId = param.value;
        const senderId = param.attributes.senderId;
        const senderName = param.attributes.senderName;
        const mute = param.attributes.mute === "true";

        if (targetId == this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                if (mute) {
                    this.ui.askDialog(
                        senderName,
                        "Requested to mute your camera",
                        NotificationType.VideoMute,
                        this.muteMyVideo.bind(this),
                        null,
                        mute);
                }
                else {
                    this.ui.askDialog(
                        senderName,
                        "Requested to unmute your camera",
                        NotificationType.Video,
                        this.muteMyVideo.bind(this),
                        null,
                        mute);
                }
            } else {
                this.muteMyVideo(mute);
            }
        }
    }


    private onLocalTrackMuteChanged(track: JitsiTrack) {
        const id = track.getParticipantId();

        if (this.roomInfo.IsWebinar && !this.myInfo.IsHost) {
            let isAllMuted = true;
            this.getLocalTracks().forEach((t) => {
                if (!t.isMuted()) isAllMuted = false;
            });
            
            if (isAllMuted) {
                if (this.localVideoPanel) {//remote it
                    this.ui.videoPanelGrid.freeVideoPanel(this.localVideoPanel.Id);
                    this.localVideoPanel = null;
                }
            } else {
                if (!this.localVideoPanel) {
                    this.localVideoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
                }

                if (track.getType() === MediaType.VIDEO) {
                    const videoElem = this.localVideoPanel.videoElem as HTMLMediaElement;
                    track.attach(videoElem);
                    videoElem.play();
                }
                else if (track.getType() === MediaType.AUDIO) {
                    const audioElem = this.localVideoPanel.audioElem as HTMLMediaElement;
                    track.attach(audioElem);
                    audioElem.play();
                }
            }
        }

        this.updateUiOnLocalTrackChange();

        //update list
        if (track.getType() === MediaType.VIDEO)
            this.ui.participantsListWidget.setMuteCamera(id, track.isMuted());
        else if (track.getType() === MediaType.AUDIO)
            this.ui.participantsListWidget.setMuteMic(id, track.isMuted());
    }

    private onRemoteTrackMuteChanged(track: JitsiTrack) {
        const id = track.getParticipantId();
        const user = this.jitsiRoom.getParticipantById(id) as JitsiParticipant;
        if (!user) return;

        if (this.roomInfo.IsWebinar) {
            let isAllMuted = true;
            user.getTracks().forEach((t) => {
                if (!t.isMuted()) isAllMuted = false;
            });

            let videoPanel = user.getProperty(UserProperty.videoPanel) as VideoPanel;
            if (isAllMuted) {
                if (videoPanel) {//remote it
                    this.ui.videoPanelGrid.freeVideoPanel(videoPanel.Id);
                    user.setProperty(UserProperty.videoPanel, null);
                }
            } else {
                if (!videoPanel) {
                    videoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
                    user.setProperty(UserProperty.videoPanel, videoPanel);
                }

                if (track.getType() === MediaType.VIDEO) {
                    const videoElem = videoPanel.videoElem as HTMLMediaElement;
                    track.attach(videoElem);
                    videoElem.play();
                }
                else if (track.getType() === MediaType.AUDIO) {
                    const audioElem = videoPanel.audioElem as HTMLMediaElement;
                    track.attach(audioElem);
                    audioElem.play();
                }
            }
        }

        //update panel
        this._updateUserPanel(user);

        //update list
        if (track.getType() === MediaType.VIDEO)
            this.ui.participantsListWidget.setMuteCamera(id, track.isMuted());
        else if (track.getType() === MediaType.AUDIO)
            this.ui.participantsListWidget.setMuteMic(id, track.isMuted());
    }

    //allow of camera, mic 
    /*public allowCamera(jitsiId: string, allow: boolean) {
        if (!this.myInfo.IsHost)
            return;

        this.sendJitsiBroadcastCommand(JitsiCommand.ALLOW_CAMERA, jitsiId, { allow: allow });
    }

    public allowMic(jitsiId: string, allow: boolean) {
        if (!this.myInfo.IsHost)
            return;

        this.sendJitsiBroadcastCommand(JitsiCommand.ALLOW_MIC, jitsiId, { allow: allow });
    }

    private onAllowCameraCommand(param: JitsiCommandParam) {
        const targetId = param.value;
        const allow = param.attributes.allow === "true";

        this.ui.participantsListWidget.setMuteCamera(targetId, allow);

        if (targetId === this.jitsiRoom.myUserId()) {
            if (param.attributes.senderId !== targetId) {
                if (allow) {
                    this.ui.notification(
                        param.attributes.senderName,
                        "Your camera was allowed",
                        NotificationType.Video
                    );
                }
                else {
                    this.ui.notification_warning(
                        param.attributes.senderName,
                        "Your camera was blocked",
                        NotificationType.VideoMute
                    );
                }
            }

            this.onAllowCamera(allow);
        }
    }

    private onAllowCamera(allow: boolean) {
        this.myInfo.mediaPolicy.useCamera = allow;
        if (allow) {
            this.createVideoTrack(this.activeCameraId)
                .then((tracks: JitsiTrack[]) => {
                    this.onLocalTrackAdded(tracks);
                })
        } else {
            //remove track
            const localVideoTrack = this.getLocalTrackByType(MediaType.VIDEO);
            if (localVideoTrack) {
                this.removeLocalTrack(localVideoTrack).then((_: any) => {
                    localVideoTrack.dispose();
                    this.updateUiOnLocalTrackChange();
                });
            }
        }
    }

    private onAllowMicCommand(param: JitsiCommandParam) {
        const targetId = param.value;
        const allow = param.attributes.allow === "true";

        this.ui.participantsListWidget.setMuteMic(targetId, allow);

        if (targetId === this.jitsiRoom.myUserId()) {
            if (param.attributes.senderId !== targetId) {
                if (allow) {
                    this.ui.notification(
                        param.attributes.senderName,
                        "Your microphone was allowed",
                        NotificationType.Audio
                    );
                }
                else {
                    this.ui.notification_warning(
                        param.attributes.senderName,
                        "Your microphone was blocked",
                        NotificationType.AudioMute
                    );
                }
            }

            this.onAllowMic(allow);
        }
    }

    private onAllowMic(allow: boolean) {
        this.myInfo.mediaPolicy.useMic = allow;

        if (allow) {
            this.createAudioTrack(this.activeMicId)
                .then((tracks: JitsiTrack[]) => {
                    this.onLocalTrackAdded(tracks);
                })
        } else {
            //remove track
            const localAudioTrack = this.getLocalTrackByType(MediaType.AUDIO);
            if (localAudioTrack) {
                this.removeLocalTrack(localAudioTrack).then((_: any) => {
                    localAudioTrack.dispose();
                    this.updateUiOnLocalTrackChange();
                });
            }
        }
    }*/


    //screenshare
    public async toggleScreenShare() {
        if (this.screenSharing)
            await this.turnOnCamera();
        else {
            if (this.myInfo.IsHost) {
                await this.turnOnScreenShare();
            } else {
                if (this.roomInfo.IsScreenShareRequired) {
                    //ask permission to host
                    this.sendJitsiBroadcastCommand(
                        JitsiCommand.ASK_SCREENSHARE,
                        this.myInfo.Jitsi_Id, null);
                    this.ui.notification_warning(
                        "Wait a second",
                        "Sent your screen sharing request",
                        NotificationType.Screensharing
                    );
                }
                else {
                    await this.turnOnScreenShare();
                }
            }
        }
        this.ui.toolbar.setScreenShare(this.screenSharing);
    }

    onAskScreenShare(param: JitsiCommandParam) {
        if (!this.myInfo.IsHost)
            return;

        const senderName = param.attributes.senderName;
        const senderId = param.attributes.senderId;
        this.ui.askDialog(
            senderName,
            "Requested screen sharing",
            NotificationType.Screensharing,
            this.allowScreenshare.bind(this),
            this.denyScreenshare.bind(this),
            senderId);
    }

    allowScreenshare(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_SCREENSHARE, { allow: true });
    }
    denyScreenshare(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_SCREENSHARE, { allow: false });
    }

    async onAllowScreenshare(senderId: string, allow: true) {
        const user = this.jitsiRoom.getParticipantById(senderId) as JitsiParticipant;
        if (user) {
            const userName = user.getDisplayName();
            if (allow) {
                this.ui.notification(
                    userName,
                    "Screensharing was accepted",
                    NotificationType.Screensharing);

                await this.turnOnScreenShare();
                this.ui.toolbar.setScreenShare(this.screenSharing);
            } else {
                this.ui.notification_warning(
                    userName,
                    "Screensharing was denied",
                    NotificationType.Screensharing);
            }
        }
    }

    //turn on screen share
    async turnOnScreenShare() {
        await this.JitsiMeetJS.createLocalTracks({
            devices: ['desktop']
        })
            .then(async (tracks: JitsiTrack[]) => {
                if (tracks.length <= 0) {
                    throw new Error("No Screen Selected");
                }

                const screenTrack = tracks[0];
                this.onLocalTrackAdded([screenTrack]);

                screenTrack.addEventListener(
                    this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => {
                        this.Log('screen - stopped');
                        this.toggleScreenShare();
                    });
                this.screenSharing = true;
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
                if (tracks.length <= 0) {
                    return;
                }

                const cameraTrack: JitsiTrack = tracks[0];
                this.onLocalTrackAdded([cameraTrack]);
                this.screenSharing = false;
            })
            .catch((error: any) => {
                this.screenSharing = false;
                console.log(error)
            });
    }

    /*chat*/
    sendChatMessage(msg: string) {
        this.jitsiRoom.sendTextMessage(msg);
    }

    sendPrivateChatMessage(targetId: string, msg: string) {
        this.sendJitsiPrivateCommand(targetId, JitsiPrivateCommand.PRIVATE_CAHT, msg);
    }

    onReceiveChatMessage(id: string, msg: string, timestamp: string) {
        if (this.myInfo.Jitsi_Id === id)
            return;

        const user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this.ui.chattingWidget.receiveMessage(id, user.getDisplayName(), msg);
        }
    }

    onReceivePrivateChatMessage(senderId: string, msg: string) {
        if (this.myInfo.Jitsi_Id === senderId)
            return;

        const user = this.jitsiRoom.getParticipantById(senderId);
        if (user) {
            this.ui.chattingWidget.receiveMessage(senderId, user.getDisplayName(), msg, true);
        }
    }

    /*file sharing*/
    sendFileMeta(meta: FileMeta) {
        this.sendJitsiBroadcastCommand(
            JitsiCommand.FILE_META,
            meta.sessionId,
            { meta: JSON.stringify(meta) });
    }

    sendFileData(sessionId: string, data: ArrayBuffer) {
        var binary = '';
        var bytes = new Uint8Array(data);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const enc = window.btoa(binary);

        this.sendJitsiBroadcastCommand(JitsiCommand.FILE_SLICE, sessionId, { data: enc });
    }

    onFileMeta(param: JitsiCommandParam) {
        const sessionId = param.value;
        const senderId = param.attributes.senderId;
        const senderName = param.attributes.senderName;
        const meta = JSON.parse(param.attributes.meta);

        if (senderId === this.myInfo.Jitsi_Id)
            return;

        this.ui.chattingWidget.onFileMeta(sessionId, meta, senderId, senderName);

    }

    onFileData(param: JitsiCommandParam) {
        const sessionId = param.value;
        const enc = param.attributes.data;
        const senderId = param.attributes.senderId;
        const senderName = param.attributes.senderName;

        if (senderId === this.myInfo.Jitsi_Id)
            return;

        const binary = window.atob(enc);
        const array = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; ++i) {
            array[i] = binary.charCodeAt(i);
        }

        this.ui.chattingWidget.onFileData(sessionId, array.buffer);
    }

    /* record */
    mediaRecorder: MediaRecorder;
    recorderStream: MediaStream;
    recordingData: any = [];

    public async toggleRecording() {
        if (this.recording) {
            await this.stopRecording();
            this.ui.toolbar.setRecording(this.recording);
        } else {
            if (this.myInfo.IsHost) {
                await this.startRecording();
                this.ui.toolbar.setRecording(this.recording);
            } else {
                if (this.roomInfo.IsRecordingRequired) {
                    //ask permission to host
                    this.sendJitsiBroadcastCommand(
                        JitsiCommand.ASK_RECORDING,
                        this.myInfo.Jitsi_Id, null);
                    this.ui.notification_warning(
                        "Wait a second",
                        "Sent your recording request",
                        NotificationType.Recording
                    );
                }
                else {
                    await this.startRecording();
                    this.ui.toolbar.setRecording(this.recording);
                }
            }
        }
    }

    onAskRecording(param: JitsiCommandParam) {
        if (!this.myInfo.IsHost)
            return;

        const senderName = param.attributes.senderName;
        const senderId = param.attributes.senderId;
        this.ui.askDialog(
            senderName,
            "Requested a recording",
            NotificationType.Recording,
            this.allowRecording.bind(this),
            this.denyRecording.bind(this),
            senderId);
    }

    allowRecording(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_RECORDING, { allow: true });
    }
    denyRecording(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_RECORDING, { allow: false });
    }

    async onAllowRecording(senderId: string, allow: true) {
        const user = this.jitsiRoom.getParticipantById(senderId) as JitsiParticipant;
        if (user) {
            const userName = user.getDisplayName();
            if (allow) {
                this.ui.notification(
                    userName,
                    "Recording was accepted",
                    NotificationType.Recording);

                await this.startRecording();
                this.ui.toolbar.setRecording(this.recording);
            } else {
                this.ui.notification_warning(
                    userName,
                    "Recording was denied",
                    NotificationType.Recording);
            }
        }
    }

    async startRecording() {
        let gumStream: MediaStream = null;
        let gdmStream: MediaStream = null;

        debugger;

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
            //seems to has no audio device
            debugger;

            try {
                gumStream = null;
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
                console.error("capture for recording failure");
                return;
            }
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

        const blob = new Blob(this.recordingData, { type: 'video/webm' });
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

    getRecordingFilename(): string {
        const now = new Date();
        const timestamp = now.toISOString();
        return `${this.roomInfo.conferenceName}_recording_${timestamp}`;
    }

    private mixer(stream1: MediaStream, stream2: MediaStream): MediaStream {
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

    // handraise
    public async toggleHandRaise() {
        if (! this.myInfo.IsHost) {
            //ask handraise to host
            this.sendJitsiBroadcastCommand(
                JitsiCommand.ASK_HANDRAISE,
                this.myInfo.Jitsi_Id, null);
            this.ui.notification_warning(
                "Wait a second",
                "Sent your hand-raise request",
                NotificationType.HandRaise
            );
        }
    }

    onAskHandRaise(param: JitsiCommandParam) {
        if (!this.myInfo.IsHost)
            return;

        const senderName = param.attributes.senderName;
        const senderId = param.attributes.senderId;
        this.ui.askDialog(
            senderName,
            "Requested Hand-Raise",
            NotificationType.HandRaise,
            this.allowHandRaise.bind(this),
            this.denyHandRaise.bind(this),
            senderId);
    }

    allowHandRaise(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_HANDRAISE, { allow: true });
    }
    denyHandRaise(jitsiId: string) {
        this.sendJitsiPrivateCommand(jitsiId, JitsiPrivateCommand.ALLOW_HANDRAISE, { allow: false });
    }

    async onAllowHandRaise(senderId: string, allow: true) {
        const user = this.jitsiRoom.getParticipantById(senderId) as JitsiParticipant;
        if (user) {
            const userName = user.getDisplayName();
            if (allow) {
                this.ui.notification(
                    userName,
                    "Hand-raise was accepted",
                    NotificationType.HandRaise);

                this.muteMyVideo(false);
                this.muteMyAudio(false);
            } else {
                this.ui.notification_warning(
                    userName,
                    "Hand-raise was denied",
                    NotificationType.HandRaise);
            }
        }
    }


    toggleCopyJoiningInfo() {
        var TempText = document.createElement("input");
        TempText.value = "https://" + window.location.host + "/lobby/" + this.roomInfo.Id; // enter your meeting url here
        document.body.appendChild(TempText);
        TempText.select();

        document.execCommand("copy");
        document.body.removeChild(TempText);
    }

    //highlight speaker
    onDominantSpeakerChanged(id: string) {
        if (id === this.myInfo.Jitsi_Id) {
            this.ui.videoPanelGrid.hightlightPanel(this.localVideoPanel.Id);
        } else {
            const user = this.jitsiRoom.getParticipantById(id) as JitsiParticipant;
            if (user) {
                const videoPanel = user.getProperty(UserProperty.videoPanel) as VideoPanel;
                if (videoPanel) this.ui.videoPanelGrid.hightlightPanel(videoPanel.Id);
            }
        }
    }


    /**
     * **************************************************************************
     *              Log
     * **************************************************************************
     */

    private Log(message: string) {
        console.log(message);
        if (this.ui != null)
            this.ui.Log(message);
    }
}

const meeting: BizGazeMeeting = new BizGazeMeeting();
meeting.start();
