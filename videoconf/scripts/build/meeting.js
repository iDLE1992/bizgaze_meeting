"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BizGazeMeeting = void 0;
var signalR = require("@microsoft/signalr");
var bg_1 = require("./protocol/bg");
var meeting_ui_1 = require("./meeting_ui");
var BGUser_1 = require("./model/BGUser");
var BGMeeting_1 = require("./model/BGMeeting");
var MediaType_1 = require("./enum/MediaType");
var JitsiCommandParam_1 = require("./jitsi/JitsiCommandParam");
var UserProperty_1 = require("./enum/UserProperty");
var TimeUtil_1 = require("./util/TimeUtil");
var ActiveDevices_1 = require("./model/ActiveDevices");
var InputDevicePolicy_1 = require("./model/InputDevicePolicy");
var ChannelType_1 = require("./enum/ChannelType");
var jitsi_1 = require("./protocol/jitsi");
var NotificationType_1 = require("./enum/NotificationType");
var JitsiCommandQueue_1 = require("./jitsi/JitsiCommandQueue");
/***********************************************************************************

                       Lifecycle of Bizgaze Meeting

    connectToBG -> joinBGConference -> connectToJitsi -> joinJitsiConference -> ...
    ... -> leaveFromJitsi -> leaveFromBG

************************************************************************************/
var MeetingConfig = /** @class */ (function () {
    function MeetingConfig() {
        this.resetMuteOnDeviceChange = true;
        this.hideToolbarOnMouseOut = false;
    }
    return MeetingConfig;
}());
var BizGazeMeeting = /** @class */ (function () {
    function BizGazeMeeting() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();
        this.joinedBGConference = false;
        this.ui = new meeting_ui_1.MeetingUI(this);
        this.roomInfo = new BGMeeting_1.BGMeetingInfo();
        this.m_BGUserList = new Map();
        this.localVideoPanel = null;
        this.localVideoElem = null;
        this.localAudioElem = null;
        this.myInfo = new BGUser_1.UserInfo();
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.JitsiServerDomain = "idlests.com";
        //JitsiServerDomain = "unimail.in";
        this.localTracks = [];
        this.screenSharing = false;
        this.recording = false;
        this.downloadRecordFile = false;
        //default devices
        this.activeCameraId = window._camId;
        this.activeMicId = window._micId;
        this.activeSpeakerId = window._speakerId;
        this.config = new MeetingConfig();
        this.commandQueue = new JitsiCommandQueue_1.JitsiCommandQueue();
        this.privateCommandQueue = new JitsiCommandQueue_1.JitsiPrivateCommandQueue();
        this.recordingData = [];
    }
    /**
     * **************************************************************************
     *              START ~ END
     *
     * **************************************************************************
     */
    BizGazeMeeting.prototype.start = function () {
        var _this = this;
        if (!window._roomId) {
            this.leaveBGConference();
            return;
        }
        //jitsi init
        var initOptions = {
            disableAudioLevels: true
        };
        this.JitsiMeetJS.setLogLevel(this.JitsiMeetJS.logLevels.ERROR);
        this.JitsiMeetJS.init(initOptions);
        //device log
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            devices.forEach(function (d) {
                if (_this.activeCameraId.length > 0 && d.deviceId === _this.activeCameraId) {
                    _this.Log("Camera: " + d.label);
                }
                if (_this.activeMicId.length > 0 && d.deviceId === _this.activeMicId && d.kind === 'audioinput') {
                    _this.Log("Microphone: " + d.label);
                }
            });
        });
        //connect to bg server
        this.connectToBGServer(function () {
            _this.Log("Connected to BizGaze SignalR Server");
            _this.joinBGConference(); // => onBGConferenceJoined
        });
    };
    BizGazeMeeting.prototype.stop = function () {
        //todo 
        //if it was recording, save it before stop
        var _this = this;
        if (this.jitsiRoomJoined()) {
            this.stopAllMediaStreams();
            this.jitsiRoom.leave().then(function () {
                _this.leaveBGConference();
            }).catch(function (error) {
                _this.leaveBGConference();
            });
        }
        else {
            this.leaveBGConference();
        }
    };
    BizGazeMeeting.prototype.forceStop = function () {
        this.stop();
    };
    /**
     * **************************************************************************
     *              BizGaze SignalR Server interaction
     *
     *          Connect
     *          Join/Leave
     *          Control Message
     * **************************************************************************
     */
    BizGazeMeeting.prototype.connectToBGServer = function (callback) {
        var _this = this;
        // Connect to the signaling server
        this.connection.start().then(function () {
            _this.registerBGServerCallbacks();
            callback();
        }).catch(function (err) {
            return console.error(err.toString());
        });
    };
    BizGazeMeeting.prototype.joinBGConference = function () {
        this.connection.invoke("Join", "" + window._roomId, "" + window._userId, "" + window._anonymousUserName).catch(function (err) {
            return console.error("Join Meeting Failed.", err.toString());
        });
    };
    //this is the entry point where we can decide webinar/group chatting
    //                        where we can decide i am host or not
    BizGazeMeeting.prototype.onBGConferenceJoined = function (roomInfo, userInfo) {
        var _this = this;
        this.joinedBGConference = true;
        this.localStartTimestamp = Date.now();
        this.roomInfo = roomInfo;
        this.Log("Meeting Type: " + (roomInfo.IsWebinar ? "Webinar" : "Group Chatting"));
        this.myInfo.Id = userInfo.Id;
        this.myInfo.Name = userInfo.Name;
        this.myInfo.IsHost = userInfo.IsHost;
        var deviceUsePolicy = this.getInitMediaPolicy();
        this.myInfo.mediaPolicy.useCamera = deviceUsePolicy.useCamera;
        this.myInfo.mediaPolicy.useMic = deviceUsePolicy.useMic;
        this.ui.updateByRole(this.myInfo.IsHost);
        this.ui.toolbar.updateByRole(this.myInfo.IsHost);
        this.initMediaDevices()
            .then(function (_) {
            //connect to jitsi server and enter room
            _this.connectToJitsiServer();
        });
    };
    BizGazeMeeting.prototype.leaveBGConference = function () {
        this.Log("leaving Meeting " + this.joinedBGConference);
        /*if (this.joinedBGConference) {
            this.connection.invoke("LeaveRoom").catch((err: any) => {
                return console.error("Leave Meeting Failed.", err.toString());
            });
        } else*/ {
            this.stopAllMediaStreams();
            $("form#return").submit();
        }
    };
    BizGazeMeeting.prototype.onBGConferenceLeft = function () {
        this.joinedBGConference = false;
        this.stopAllMediaStreams();
        this.m_BGUserList.clear();
        $("form#return").submit();
    };
    BizGazeMeeting.prototype.onBGUserJoined = function (userInfo) {
        this.m_BGUserList.set(userInfo.Id, userInfo);
    };
    BizGazeMeeting.prototype.onBGUserLeft = function (userId) {
        //self leave
        if (userId == this.myInfo.Id) {
            this.onBGConferenceLeft();
        }
        // participant left
        else {
            if (this.m_BGUserList.has(userId)) {
                var bizUser = this.m_BGUserList.get(userId);
                if (bizUser.Jitsi_Id && this.jitsiRoomJoined()) {
                    debugger;
                    var jitsiUser = this.jitsiRoom.getParticipantById(bizUser.Jitsi_Id);
                    if (jitsiUser)
                        this.onJitsiUserLeft(bizUser.Jitsi_Id, jitsiUser);
                }
                this.Log(this.m_BGUserList.get(userId).Name + " has left");
                this.m_BGUserList.delete(userId);
            }
        }
    };
    BizGazeMeeting.prototype.registerBGServerCallbacks = function () {
        var _this = this;
        this.connection.on(bg_1.BGtoUser.ROOM_JOINED, function (strRoomInfo, strMyInfo) {
            var roomInfo = JSON.parse(strRoomInfo);
            var myInfo = JSON.parse(strMyInfo);
            _this.onBGConferenceJoined(roomInfo, myInfo);
        });
        this.connection.on(bg_1.BGtoUser.ROOM_USER_JOINED, function (strUserInfo) {
            var info = JSON.parse(strUserInfo);
            _this.onBGUserJoined(info);
        });
        this.connection.on(bg_1.BGtoUser.ERROR, function (message) {
            alert(message);
            _this.forceStop();
        });
        this.connection.on(bg_1.BGtoUser.ROOM_LEFT, function (clientId) {
            _this.onBGUserLeft(clientId);
        });
        this.connection.on(bg_1.BGtoUser.SIGNALING, function (sourceId, strMsg) {
            /*console.log(' received signaling message:', strMsg);
            let msg = JSON.parse(strMsg);
            if (sourceId != this.myInfo.Id && this.connMap.has(sourceId)) {
                let peerConn: BizGazeConnection = this.connMap.get(sourceId);
                peerConn.onSignalingMessage(msg);
            }*/
        });
    };
    BizGazeMeeting.prototype.sendBGSignalingMessage = function (destId, msg) {
        this.connection.invoke(bg_1.BGtoUser.SIGNALING, this.myInfo.Id, destId, JSON.stringify(msg)).catch(function (err) {
            return console.error(err.toString());
        });
    };
    /**
     * **************************************************************************
     *              Local Camera/Microphone init
     *
     * **************************************************************************
     */
    BizGazeMeeting.prototype.initMediaDevices = function () {
        var _this = this;
        this.Log('Getting user media devices ...');
        //set speaker
        if (this.activeSpeakerId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerId);
        }
        ;
        //set input devices
        var cameraId = this.myInfo.mediaPolicy.useCamera ? this.activeCameraId : null;
        var micId = this.myInfo.mediaPolicy.useMic ? this.activeMicId : null;
        //const cameraId = this.activeCameraId;
        //const micId = this.activeMicId;
        return this.createLocalTracks(cameraId, micId)
            .then(function (tracks) {
            if (tracks.length <= 0) {
                throw new Error("no tracks");
            }
            _this.onLocalTrackAdded(tracks);
            return Promise.resolve();
        }).catch(function (error) {
            _this.ui.toolbar.update(_this.myInfo, _this.getLocalTracks());
            if (!_this.roomInfo.IsWebinar || _this.myInfo.IsHost)
                _this._updateMyPanel();
            return Promise.resolve();
        });
    };
    BizGazeMeeting.prototype.createVideoTrack = function (cameraDeviceId) {
        var _this = this;
        return this.JitsiMeetJS.createLocalTracks({
            devices: ['video'],
            cameraDeviceId: cameraDeviceId,
            micDeviceId: null
        })
            .catch(function (error) {
            _this.Log(error);
            return Promise.resolve([]);
        });
    };
    BizGazeMeeting.prototype.createAudioTrack = function (micDeviceId) {
        var _this = this;
        return (this.JitsiMeetJS.createLocalTracks({
            devices: ['audio'],
            cameraDeviceId: null,
            micDeviceId: micDeviceId
        })
            .catch(function (error) {
            _this.Log(error);
            return Promise.resolve([]);
        }));
    };
    BizGazeMeeting.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
        var _this = this;
        if (cameraDeviceId != null && micDeviceId != null) {
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['audio', 'video'],
                cameraDeviceId: cameraDeviceId,
                micDeviceId: micDeviceId
            }).catch(function () { return Promise.all([
                _this.createAudioTrack(micDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                }),
                _this.createVideoTrack(cameraDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                })
            ]); }).then(function (tracks) {
                return tracks.filter(function (t) { return typeof t !== 'undefined'; });
            });
        }
        else if (cameraDeviceId != null) {
            return this.createVideoTrack(cameraDeviceId);
        }
        else if (micDeviceId != null) {
            return this.createAudioTrack(micDeviceId);
        }
        return Promise.resolve([]);
    };
    BizGazeMeeting.prototype.onLocalTrackAdded = function (tracks) {
        return __awaiter(this, void 0, void 0, function () {
            var i, localVideoTrack;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (tracks.length <= 0)
                            return [2 /*return*/];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tracks.length)) return [3 /*break*/, 4];
                        tracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, function (audioLevel) { return console.log("Audio Level local: " + audioLevel); });
                        tracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, function (track) { _this.updateUiOnLocalTrackChange(); });
                        tracks[i].addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, function (track) { _this.updateUiOnLocalTrackChange(); });
                        tracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, function (deviceId) {
                            return console.log("track audio output device was changed to " + deviceId);
                        });
                        if (this.jitsiRoomJoined())
                            this.Log("[ OUT ] my track - " + tracks[i].getType());
                        return [4 /*yield*/, this.replaceLocalTrack(tracks[i], tracks[i].getType())];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        //toolbar
                        this.ui.toolbar.update(this.myInfo, this.getLocalTracks());
                        //my video panel
                        this._updateMyPanel();
                        localVideoTrack = this.getLocalTrackByType(MediaType_1.MediaType.VIDEO);
                        if (localVideoTrack && this.localVideoElem) {
                            localVideoTrack.attach(this.localVideoElem);
                            this.localVideoElem.play();
                            this.localVideoPanel.setShotnameVisible(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.stopAllMediaStreams = function () {
        var _this = this;
        var localTracks = __spreadArray([], this.getLocalTracks());
        localTracks.forEach(function (track) {
            _this.removeLocalTrack(track).then(function (_) {
                track.dispose();
            });
        });
    };
    BizGazeMeeting.prototype.onDeviceChange = function (newDevices) {
        var _this = this;
        var videoDeviceChanged = this.activeCameraId !== newDevices.cameraId;
        var audioDeviceChanged = this.activeMicId !== newDevices.micId;
        //create new tracks with new devices
        this.createLocalTracks(videoDeviceChanged ? newDevices.cameraId : null, audioDeviceChanged ? newDevices.micId : null)
            .then(function (tracks) {
            _this.onLocalTrackAdded(tracks);
        });
        this.activeCameraId = newDevices.cameraId;
        this.activeMicId = newDevices.micId;
        this.activeSpeakerId = newDevices.speakerId;
    };
    BizGazeMeeting.prototype.getActiveDevices = function () {
        var activeDevices = new ActiveDevices_1.ActiveDevices();
        activeDevices.cameraId = this.activeCameraId;
        activeDevices.micId = this.activeMicId;
        activeDevices.speakerId = this.activeSpeakerId;
        return activeDevices;
    };
    BizGazeMeeting.prototype.getInitMediaPolicy = function () {
        var useCamera = true;
        var useMic = true;
        if (this.roomInfo.IsWebinar) {
            if (!this.myInfo.IsHost) {
                useCamera = false;
                useMic = false;
            }
        }
        if (this.roomInfo.channelType === ChannelType_1.ChannelType.AudioOnly)
            useCamera = false;
        if (this.roomInfo.channelType === ChannelType_1.ChannelType.VideoOnly)
            useMic = false;
        if (window._videoMute !== "true")
            useCamera = false;
        if (window._audioMute !== "true")
            useMic = false;
        var policy = new InputDevicePolicy_1.InputMediaPolicy();
        policy.useCamera = useCamera;
        policy.useMic = useMic;
        this.Log("useCamera " + useCamera);
        this.Log("useMic " + useMic);
        return policy;
    };
    /**
     * **************************************************************************
     *              Local Track Access
     *
     * **************************************************************************
     */
    BizGazeMeeting.prototype.jitsiRoomJoined = function () {
        return this.jitsiRoom && this.jitsiRoom.isJoined();
    };
    BizGazeMeeting.prototype.getLocalTracks = function () {
        if (this.jitsiRoomJoined())
            return this.jitsiRoom.getLocalTracks();
        else
            return this.localTracks;
    };
    BizGazeMeeting.prototype.getLocalTrackByType = function (type) {
        if (this.jitsiRoomJoined()) {
            var tracks = this.jitsiRoom.getLocalTracks(type);
            if (tracks.length > 0)
                return tracks[0];
            return null;
        }
        else {
            var track = this.localTracks.find(function (t) { return t.getType() === type; });
            return track;
        }
    };
    BizGazeMeeting.prototype.removeLocalTrack = function (track) {
        if (this.jitsiRoomJoined()) {
            return this.jitsiRoom.removeTrack(track);
        }
        else {
            var index = this.localTracks.indexOf(track);
            if (index >= 0)
                this.localTracks.splice(index, 1);
            return Promise.resolve();
        }
    };
    //type is neccessray when newTrack is null
    BizGazeMeeting.prototype.replaceLocalTrack = function (newTrack, type) {
        return __awaiter(this, void 0, void 0, function () {
            var oldTrack;
            var _this = this;
            return __generator(this, function (_a) {
                oldTrack = this.getLocalTrackByType(type);
                if (oldTrack === newTrack)
                    return [2 /*return*/, Promise.reject()];
                if (!oldTrack && !newTrack)
                    return [2 /*return*/, Promise.reject()];
                if (this.jitsiRoomJoined()) {
                    return [2 /*return*/, this.jitsiRoom.replaceTrack(oldTrack, newTrack).then(function (_) {
                            if (oldTrack)
                                oldTrack.dispose();
                            _this.updateUiOnLocalTrackChange();
                            return Promise.resolve();
                        })];
                }
                else {
                    return [2 /*return*/, this.removeLocalTrack(oldTrack).then(function (_) {
                            if (oldTrack)
                                oldTrack.dispose();
                            if (newTrack)
                                _this.localTracks.push(newTrack);
                            _this.updateUiOnLocalTrackChange();
                            return Promise.resolve();
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    BizGazeMeeting.prototype.updateUiOnLocalTrackChange = function () {
        if (this.localVideoElem || this.localAudioElem)
            this._updateMyPanel();
        this.ui.toolbar.update(this.myInfo, this.getLocalTracks());
    };
    /**
     * **************************************************************************
     *              Jitsi Server interaction
     *         Connect
     *         Enter/Leave Room
     *         Send/Receive Track
     *         UserInfo
     * **************************************************************************
     */
    BizGazeMeeting.prototype.connectToJitsiServer = function () {
        var _this = this;
        var serverdomain = this.JitsiServerDomain;
        var connConf = {
            hosts: {
                domain: serverdomain,
                muc: "conference." + serverdomain,
            },
            bosh: "//" + serverdomain + "/http-bind",
            // The name of client node advertised in XEP-0115 'c' stanza
            clientNode: "//" + serverdomain + "/jitsimeet"
        };
        this.jitsiConnection = new this.JitsiMeetJS.JitsiConnection(null, null, connConf);
        this.jitsiConnection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, function () { _this.onJitsiConnectionSuccess(); });
        this.jitsiConnection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_FAILED, function () { _this.onJitsiConnectionFailed(); });
        this.jitsiConnection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, function () { _this.disconnectFromJitsiServer(); });
        this.jitsiConnection.connect();
    };
    BizGazeMeeting.prototype.onJitsiConnectionSuccess = function () {
        this.Log("Connected to Jitsi Server - " + this.JitsiServerDomain);
        this.joinJitsiConference();
    };
    BizGazeMeeting.prototype.onJitsiConnectionFailed = function () {
        this.Log("Failed to connect Jitsi Server - " + this.JitsiServerDomain);
        this.stop();
    };
    BizGazeMeeting.prototype.disconnectFromJitsiServer = function () {
        this.Log("Disconnected from Jitsi Server - " + this.JitsiServerDomain);
        this.stop();
    };
    BizGazeMeeting.prototype.joinJitsiConference = function () {
        var _this = this;
        var confOptions = {
            openBridgeChannel: true
        };
        this.jitsiRoom = this.jitsiConnection.initJitsiConference("" + this.roomInfo.Id, confOptions);
        //remote track
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, function (track) {
            _this.onRemoteTrackAdded(track);
        });
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, function (track) {
            _this.onRemovedRemoteTrack(track);
        });
        //my join
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.CONFERENCE_JOINED, function () { _this.onJitsiConferenceJoined(); });
        //my left
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.CONFERENCE_LEFT, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            this.onJitsiConferenceLeft();
            return [2 /*return*/];
        }); }); });
        //remote join
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.USER_JOINED, function (id, user) {
            _this.onJitsiUserJoined(id, user);
            //remoteTracks[id] = [];
        });
        //remote left
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.USER_LEFT, function (id, user) {
            _this.onJitsiUserLeft(id, user);
        });
        //track mute
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, function (track) {
            _this.onRemoteTrackMuteChanged(track);
        });
        //audio level change
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, function (userID, audioLevel) {
            _this.Log(userID + " - " + audioLevel);
        });
        //chat
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.MESSAGE_RECEIVED, function (id, message, timestamp) {
            _this.onReceiveChatMessage(id, message, timestamp);
        });
        //private message object
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, function (peer, message) {
            if (message && message.type === "biz_private") {
                _this.onPrivateCommand(message.senderId, message.subtype, message.message);
            }
        });
        //dominant speaker
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, function (id, previousSpeakers) {
            _this.onDominantSpeakerChanged(id);
        });
        //name change
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, function (userID, displayName) {
            console.log(userID + " - " + displayName);
        });
        //command
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.GRANT_HOST_ROLE, function (param) {
            _this.onChangedModerator(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.MUTE_AUDIO, function (param) {
            _this.onMutedAudio(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.MUTE_VIDEO, function (param) {
            _this.onMutedVideo(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.ALLOW_CAMERA, function (param) {
            _this.onAllowCameraCommand(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.ALLOW_MIC, function (param) {
            _this.onAllowMicCommand(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.INIT_MEDIA_POLICY, function (param) {
            _this.onInitMediaPolicy(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.BIZ_ID, function (param) {
            _this.onBizId(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.ASK_RECORDING, function (param) {
            _this.onAskRecording(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.ASK_SCREENSHARE, function (param) {
            _this.onAskScreenShare(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.ASK_HANDRAISE, function (param) {
            _this.onAskHandRaise(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.FILE_META, function (param) {
            _this.onFileMeta(param);
        });
        this.jitsiRoom.addCommandListener(jitsi_1.JitsiCommand.FILE_SLICE, function (param) {
            _this.onFileData(param);
        });
        //set name
        this.jitsiRoom.setDisplayName(this.myInfo.Name);
        for (var i = 0; i < this.localTracks.length; i++) {
            this.Log("[ OUT ] my track - " + this.localTracks[i].getType());
            this.jitsiRoom.addTrack(this.localTracks[i]).catch(function (error) {
                _this.Log(error);
            });
        }
        //joinJitsiConference
        this.jitsiRoom.join(); //callback -  onJitsiUserJoined
    };
    BizGazeMeeting.prototype.leaveJitsiConference = function () {
    };
    //my enter room
    BizGazeMeeting.prototype.onJitsiConferenceJoined = function () {
        var _this = this;
        this.myInfo.Jitsi_Id = this.jitsiRoom.myUserId();
        this.Log("Jitsi_Id : " + this.myInfo.Jitsi_Id);
        //set subject
        this.ui.meetingDescWidget.setSubject(this.roomInfo.conferenceName, this.roomInfo.hostName);
        //add list
        //if (this.myInfo.IsHost) 
        {
            this.ui.addParticipant(this.jitsiRoom.myUserId(), this.myInfo.Name, true, this.myInfo.mediaPolicy.useCamera, this.myInfo.mediaPolicy.useMic);
        }
        //set time
        setInterval(function () {
            var delta = Date.now() - _this.localStartTimestamp;
            var elapsed = _this.roomInfo.elapsed + delta;
            _this.ui.meetingDescWidget.updateTime(TimeUtil_1.TsToDateFormat(elapsed));
        }, 1000);
        //send media policy
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.INIT_MEDIA_POLICY, this.myInfo.Jitsi_Id, this.myInfo.mediaPolicy);
        //send bizgaze id
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.BIZ_ID, this.myInfo.Id);
    };
    //my leave room
    BizGazeMeeting.prototype.onJitsiConferenceLeft = function () {
        this.myInfo.Jitsi_Id = null;
        this.leaveBGConference();
    };
    //remote-user enter room
    BizGazeMeeting.prototype.onJitsiUserJoined = function (jitsiId, user) {
        var _this = this;
        this.Log("joined user: " + user.getDisplayName());
        this.ui.notification(user.getDisplayName(), "New Participant joined", NotificationType_1.NotificationType.User);
        //if track doesn't arrive for certain time
        //generate new panel for that user
        if (!this.roomInfo.IsWebinar) {
            setTimeout(function () {
                if (!user.getProperty(UserProperty_1.UserProperty.videoPanel)) {
                    var videoPanel = _this.ui.videoPanelGrid.getNewVideoPanel();
                    user.setProperty(UserProperty_1.UserProperty.videoPanel, videoPanel);
                    user.setProperty(UserProperty_1.UserProperty.videoElem, videoPanel.videoElem);
                    user.setProperty(UserProperty_1.UserProperty.audioElem, videoPanel.audioElem);
                    _this._updateUserPanel(user);
                }
            }, 1000);
        }
        //add list
        //if (this.myInfo.IsHost) 
        {
            this.ui.addParticipant(jitsiId, user.getDisplayName(), false, //me?
            false, //use camera?
            false //use mic?
            );
        }
        //notify him that i am moderator
        if (this.myInfo.IsHost)
            this.grantModeratorRole(this.jitsiRoom.myUserId());
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.MEDIA_POLICY, this.myInfo.mediaPolicy);
        this.commandQueue.executeQueuedCommands(jitsiId);
        this.privateCommandQueue.executeQueuedCommands(jitsiId);
    };
    //remote leave room
    BizGazeMeeting.prototype.onJitsiUserLeft = function (jitsiId, user) {
        var _this = this;
        this.ui.notification_warning(user.getDisplayName(), "Participant left", NotificationType_1.NotificationType.User);
        this.Log("left user: " + user.getDisplayName());
        var videoPanel = user.getProperty(UserProperty_1.UserProperty.videoPanel);
        if (videoPanel)
            this.ui.videoPanelGrid.freeVideoPanel(videoPanel.Id);
        //remove list
        this.ui.removeParticipant(jitsiId);
        //remove from list
        this.m_BGUserList.forEach(function (bzUser, bizId) {
            if (bzUser.Jitsi_Id == jitsiId) {
                _this.m_BGUserList.delete(bizId);
            }
        });
    };
    BizGazeMeeting.prototype.onBizId = function (param) {
        var senderJitsiId = param.attributes.senderId;
        if (senderJitsiId === this.myInfo.Jitsi_Id)
            return;
        var user = this.jitsiRoom.getParticipantById(senderJitsiId);
        if (user) {
            var bizId = param.value;
            var bizUser = this.m_BGUserList.get(bizId);
            if (bizUser)
                bizUser.Jitsi_Id = senderJitsiId;
        }
        else {
            this.commandQueue.queueCommand(senderJitsiId, jitsi_1.JitsiCommand.BIZ_ID, param, this.onBizId.bind(this));
        }
    };
    //[ IN ] remote track
    BizGazeMeeting.prototype.onRemoteTrackAdded = function (track) {
        if (track.isLocal()) {
            return;
        }
        this.Log("[ IN ] remote track - " + track.getType());
        var id = track.getParticipantId();
        var user = this.jitsiRoom.getParticipantById(id);
        if (!user) {
            this.Log(user.getDisplayName() + " not yet added");
            return;
        }
        var videoElem = user.getProperty(UserProperty_1.UserProperty.videoElem);
        if (!videoElem) {
            var videoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
            user.setProperty(UserProperty_1.UserProperty.videoPanel, videoPanel);
            user.setProperty(UserProperty_1.UserProperty.videoElem, videoPanel.videoElem);
            user.setProperty(UserProperty_1.UserProperty.audioElem, videoPanel.audioElem);
        }
        if (track.getType() === MediaType_1.MediaType.VIDEO) {
            var videoElem_1 = user.getProperty(UserProperty_1.UserProperty.videoElem);
            track.attach(videoElem_1);
            videoElem_1.play();
        }
        else if (track.getType() === MediaType_1.MediaType.AUDIO) {
            var audioElem = user.getProperty(UserProperty_1.UserProperty.audioElem);
            track.attach(audioElem);
            audioElem.play();
        }
        this._updateUserPanel(user);
    };
    // [DEL] remote track
    BizGazeMeeting.prototype.onRemovedRemoteTrack = function (track) {
        if (track.isLocal()) {
            this.Log("[ DEL ] localtrack - " + track.getType());
        }
        else {
            this.Log("[ DEL ] remotetrack - " + track.getType());
        }
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_VIDEOTYPE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.NO_DATA_FROM_SOURCE);
        if (!track.isLocal()) {
            var jitsiId = track.getParticipantId();
            var user = this.jitsiRoom.getParticipantById(jitsiId);
            if (this.roomInfo.IsWebinar) {
                var IsHost = user.getProperty(UserProperty_1.UserProperty.IsHost);
                var userVideoPanel = user.getProperty(UserProperty_1.UserProperty.videoPanel);
                if (!IsHost && user.getTracks().length <= 0 && userVideoPanel) {
                    this.ui.videoPanelGrid.freeVideoPanel(userVideoPanel.Id);
                    user.setProperty(UserProperty_1.UserProperty.videoElem, null);
                    user.setProperty(UserProperty_1.UserProperty.audioElem, null);
                    user.setProperty(UserProperty_1.UserProperty.videoPanel, null);
                }
            }
            this._updateUserPanel(user);
        }
        else {
            this.updateUiOnLocalTrackChange();
        }
    };
    BizGazeMeeting.prototype._updateUserPanel = function (user) {
        if (user && user.getProperty(UserProperty_1.UserProperty.videoPanel)) {
            var videoPanel = user.getProperty(UserProperty_1.UserProperty.videoPanel);
            videoPanel.updatePanelOnJitsiUser(this.myInfo, user);
        }
    };
    BizGazeMeeting.prototype._updateMyPanel = function () {
        if (this.localVideoPanel == null) {
            this.localVideoPanel = this.ui.videoPanelGrid.getNewVideoPanel();
            this.localVideoElem = this.localVideoPanel.videoElem;
            this.localAudioElem = this.localVideoPanel.audioElem;
        }
        if (this.localVideoElem)
            this.localVideoPanel.updatePanelOnMyBGUser(this.myInfo, this.getLocalTracks());
    };
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
    BizGazeMeeting.prototype.sendJitsiBroadcastCommand = function (type, value, attributes) {
        if (attributes === void 0) { attributes = null; }
        var param = new JitsiCommandParam_1.JitsiCommandParam();
        param.value = value;
        if (!!attributes && typeof attributes === "object" && attributes.constructor.name === "Object")
            param.attributes = __assign({}, attributes);
        param.attributes.senderId = this.myInfo.Jitsi_Id;
        param.attributes.senderName = this.myInfo.Name;
        this.jitsiRoom.sendCommandOnce(type, param);
    };
    BizGazeMeeting.prototype.sendJitsiPrivateCommand = function (targetId, type, message) {
        var payload = {
            type: "biz_private",
            subtype: type,
            senderId: this.myInfo.Jitsi_Id,
            message: message
        };
        this.jitsiRoom.sendMessage(payload, targetId);
    };
    BizGazeMeeting.prototype.onPrivateCommand = function (senderId, type, message) {
        var user = this.jitsiRoom.getParticipantById(senderId);
        if (!user) {
            this.privateCommandQueue.queueCommand(senderId, type, message, this.onPrivateCommand.bind(this));
            return;
        }
        if (type === jitsi_1.JitsiPrivateCommand.MEDIA_POLICY) {
            var policy = message;
            this.onUserMediaPolicy(senderId, policy);
        }
        else if (type === jitsi_1.JitsiPrivateCommand.ALLOW_RECORDING) {
            var allow = message.allow;
            this.onAllowRecording(senderId, allow);
        }
        else if (type === jitsi_1.JitsiPrivateCommand.ALLOW_SCREENSHARE) {
            var allow = message.allow;
            this.onAllowScreenshare(senderId, allow);
        }
        else if (type === jitsi_1.JitsiPrivateCommand.ALLOW_HANDRAISE) {
            var allow = message.allow;
            this.onAllowHandRaise(senderId, allow);
        }
        else if (type === jitsi_1.JitsiPrivateCommand.PRIVATE_CAHT) {
            this.onReceivePrivateChatMessage(senderId, message);
        }
    };
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
    BizGazeMeeting.prototype.grantModeratorRole = function (targetId) {
        this.Log("Sending grant host");
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.GRANT_HOST_ROLE, targetId);
    };
    BizGazeMeeting.prototype.onChangedModerator = function (param) {
        var _this = this;
        this.Log("received grant host");
        var targetId = param.value;
        var senderName = param.attributes.senderName;
        var senderId = param.attributes.senderId;
        if (targetId === this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                this.ui.notification_warning(senderName, "You're granted co-host permission", NotificationType_1.NotificationType.GrantHost);
                this.myInfo.IsHost = true;
                this._updateMyPanel();
                this.jitsiRoom.getParticipants().forEach(function (user) {
                    _this._updateUserPanel(user);
                });
                this.ui.updateByRole(this.myInfo.IsHost);
            }
        }
        else {
            var user = this.jitsiRoom.getParticipantById(targetId);
            if (user) {
                user.setProperty(UserProperty_1.UserProperty.IsHost, true);
                this._updateUserPanel(user);
            }
            else {
                this.commandQueue.queueCommand(targetId, jitsi_1.JitsiCommand.GRANT_HOST_ROLE, param, this.onChangedModerator.bind(this));
            }
        }
    };
    BizGazeMeeting.prototype.onInitMediaPolicy = function (param) {
        var sourceId = param.value;
        if (sourceId === this.myInfo.Jitsi_Id)
            return;
        this.Log("received initMediaPolicy from " + sourceId);
        var user = this.jitsiRoom.getParticipantById(sourceId);
        if (user) {
            var useCamera = param.attributes.useCamera === "true";
            var useMic = param.attributes.useMic === "true";
            this.ui.participantsListWidget.setCameraMediaPolicy(sourceId, useCamera);
            this.ui.participantsListWidget.setMicMediaPolicy(sourceId, useMic);
        }
        else {
            this.Log("delaying initMediaPolicy callback");
            this.commandQueue.queueCommand(sourceId, jitsi_1.JitsiCommand.INIT_MEDIA_POLICY, param, this.onInitMediaPolicy.bind(this));
        }
    };
    BizGazeMeeting.prototype.onUserMediaPolicy = function (senderId, policy) {
        this.ui.participantsListWidget.setCameraMediaPolicy(senderId, policy.useCamera);
        this.ui.participantsListWidget.setMicMediaPolicy(senderId, policy.useMic);
    };
    //mute myself
    //called when user click toolbar buttons
    BizGazeMeeting.prototype.OnToggleMuteMyAudio = function () {
        var audioMuted = false;
        this.getLocalTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.AUDIO && track.isMuted())
                audioMuted = true;
        });
        this.muteMyAudio(!audioMuted);
    };
    BizGazeMeeting.prototype.OnToggleMuteMyVideo = function () {
        var videoMuted = false;
        this.getLocalTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && track.isMuted())
                videoMuted = true;
        });
        this.muteMyVideo(!videoMuted);
    };
    BizGazeMeeting.prototype.muteMyAudio = function (mute) {
        this.getLocalTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.AUDIO) {
                if (mute)
                    track.mute();
                else
                    track.unmute();
            }
        });
    };
    BizGazeMeeting.prototype.muteMyVideo = function (mute) {
        this.getLocalTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO) {
                if (mute)
                    track.mute();
                else
                    track.unmute();
            }
        });
    };
    //mute others
    BizGazeMeeting.prototype.muteUserAudio = function (targetId, mute) {
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.MUTE_AUDIO, targetId, { mute: mute });
    };
    BizGazeMeeting.prototype.muteUserVideo = function (targetId, mute) {
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.MUTE_VIDEO, targetId, { mute: mute });
    };
    BizGazeMeeting.prototype.onMutedAudio = function (param) {
        var targetId = param.value;
        var senderId = param.attributes.senderId;
        var senderName = param.attributes.senderName;
        var mute = param.attributes.mute === "true";
        if (targetId == this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                if (mute) {
                    this.ui.askDialog(senderName, "Requested to mute your microphone", NotificationType_1.NotificationType.AudioMute, this.muteMyAudio.bind(this), null, mute);
                }
                else {
                    this.ui.askDialog(senderName, "Requested to unmute your microphone", NotificationType_1.NotificationType.Audio, this.muteMyAudio.bind(this), null, mute);
                }
            }
            else {
                this.muteMyAudio(mute);
            }
        }
    };
    BizGazeMeeting.prototype.onMutedVideo = function (param) {
        var targetId = param.value;
        var senderId = param.attributes.senderId;
        var senderName = param.attributes.senderName;
        var mute = param.attributes.mute === "true";
        if (targetId == this.myInfo.Jitsi_Id) {
            if (senderId !== targetId) {
                if (mute) {
                    this.ui.askDialog(senderName, "Requested to mute your camera", NotificationType_1.NotificationType.VideoMute, this.muteMyVideo.bind(this), null, mute);
                }
                else {
                    this.ui.askDialog(senderName, "Requested to unmute your camera", NotificationType_1.NotificationType.Video, this.muteMyVideo.bind(this), null, mute);
                }
            }
            else {
                this.muteMyVideo(mute);
            }
        }
    };
    BizGazeMeeting.prototype.onRemoteTrackMuteChanged = function (track) {
        if (this.jitsiRoomJoined()) {
            var id = track.getParticipantId();
            var user = this.jitsiRoom.getParticipantById(id);
            if (user) {
                this._updateUserPanel(user);
            }
        }
    };
    //allow of camera, mic 
    BizGazeMeeting.prototype.allowCamera = function (jitsiId, allow) {
        if (!this.myInfo.IsHost)
            return;
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.ALLOW_CAMERA, jitsiId, { allow: allow });
    };
    BizGazeMeeting.prototype.allowMic = function (jitsiId, allow) {
        if (!this.myInfo.IsHost)
            return;
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.ALLOW_MIC, jitsiId, { allow: allow });
    };
    BizGazeMeeting.prototype.onAllowCameraCommand = function (param) {
        var targetId = param.value;
        var allow = param.attributes.allow === "true";
        this.ui.participantsListWidget.setCameraMediaPolicy(targetId, allow);
        if (targetId === this.jitsiRoom.myUserId()) {
            if (param.attributes.senderId !== targetId) {
                if (allow) {
                    this.ui.notification(param.attributes.senderName, "Your camera was allowed", NotificationType_1.NotificationType.Video);
                }
                else {
                    this.ui.notification_warning(param.attributes.senderName, "Your camera was blocked", NotificationType_1.NotificationType.VideoMute);
                }
            }
            this.onAllowCamera(allow);
        }
    };
    BizGazeMeeting.prototype.onAllowCamera = function (allow) {
        var _this = this;
        this.myInfo.mediaPolicy.useCamera = allow;
        if (allow) {
            this.createVideoTrack(this.activeCameraId)
                .then(function (tracks) {
                _this.onLocalTrackAdded(tracks);
            });
        }
        else {
            //remove track
            var localVideoTrack_1 = this.getLocalTrackByType(MediaType_1.MediaType.VIDEO);
            if (localVideoTrack_1) {
                this.removeLocalTrack(localVideoTrack_1).then(function (_) {
                    localVideoTrack_1.dispose();
                    _this.updateUiOnLocalTrackChange();
                });
            }
        }
    };
    BizGazeMeeting.prototype.onAllowMicCommand = function (param) {
        var targetId = param.value;
        var allow = param.attributes.allow === "true";
        this.ui.participantsListWidget.setMicMediaPolicy(targetId, allow);
        if (targetId === this.jitsiRoom.myUserId()) {
            if (param.attributes.senderId !== targetId) {
                if (allow) {
                    this.ui.notification(param.attributes.senderName, "Your microphone was allowed", NotificationType_1.NotificationType.Audio);
                }
                else {
                    this.ui.notification_warning(param.attributes.senderName, "Your microphone was blocked", NotificationType_1.NotificationType.AudioMute);
                }
            }
            this.onAllowMic(allow);
        }
    };
    BizGazeMeeting.prototype.onAllowMic = function (allow) {
        var _this = this;
        this.myInfo.mediaPolicy.useMic = allow;
        if (allow) {
            this.createAudioTrack(this.activeMicId)
                .then(function (tracks) {
                _this.onLocalTrackAdded(tracks);
            });
        }
        else {
            //remove track
            var localAudioTrack_1 = this.getLocalTrackByType(MediaType_1.MediaType.AUDIO);
            if (localAudioTrack_1) {
                this.removeLocalTrack(localAudioTrack_1).then(function (_) {
                    localAudioTrack_1.dispose();
                    _this.updateUiOnLocalTrackChange();
                });
            }
        }
    };
    //screenshare
    BizGazeMeeting.prototype.toggleScreenShare = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.screenSharing) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.turnOnCamera()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!this.myInfo.IsHost) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.turnOnScreenShare()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!this.roomInfo.IsScreenShareRequired) return [3 /*break*/, 5];
                        //ask permission to host
                        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.ASK_SCREENSHARE, this.myInfo.Jitsi_Id, null);
                        this.ui.notification_warning("Wait a second", "Sent your screen sharing request", NotificationType_1.NotificationType.Screensharing);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.turnOnScreenShare()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        this.ui.toolbar.setScreenShare(this.screenSharing);
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.onAskScreenShare = function (param) {
        if (!this.myInfo.IsHost)
            return;
        var senderName = param.attributes.senderName;
        var senderId = param.attributes.senderId;
        this.ui.askDialog(senderName, "Requested screen sharing", NotificationType_1.NotificationType.Screensharing, this.allowScreenshare.bind(this), this.denyScreenshare.bind(this), senderId);
    };
    BizGazeMeeting.prototype.allowScreenshare = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_SCREENSHARE, { allow: true });
    };
    BizGazeMeeting.prototype.denyScreenshare = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_SCREENSHARE, { allow: false });
    };
    BizGazeMeeting.prototype.onAllowScreenshare = function (senderId, allow) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = this.jitsiRoom.getParticipantById(senderId);
                        if (!user) return [3 /*break*/, 3];
                        userName = user.getDisplayName();
                        if (!allow) return [3 /*break*/, 2];
                        this.ui.notification(userName, "Screensharing was accepted", NotificationType_1.NotificationType.Screensharing);
                        return [4 /*yield*/, this.turnOnScreenShare()];
                    case 1:
                        _a.sent();
                        this.ui.toolbar.setScreenShare(this.screenSharing);
                        return [3 /*break*/, 3];
                    case 2:
                        this.ui.notification_warning(userName, "Screensharing was denied", NotificationType_1.NotificationType.Screensharing);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    //turn on screen share
    BizGazeMeeting.prototype.turnOnScreenShare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.JitsiMeetJS.createLocalTracks({
                            devices: ['desktop']
                        })
                            .then(function (tracks) { return __awaiter(_this, void 0, void 0, function () {
                            var screenTrack;
                            var _this = this;
                            return __generator(this, function (_a) {
                                if (tracks.length <= 0) {
                                    throw new Error("No Screen Selected");
                                }
                                screenTrack = tracks[0];
                                this.onLocalTrackAdded([screenTrack]);
                                screenTrack.addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, function () {
                                    _this.Log('screen - stopped');
                                    _this.toggleScreenShare();
                                });
                                this.screenSharing = true;
                                return [2 /*return*/];
                            });
                        }); })
                            .catch(function (error) {
                            _this.screenSharing = false;
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.turnOnCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.JitsiMeetJS.createLocalTracks({
                            devices: [MediaType_1.MediaType.VIDEO]
                        })
                            .then(function (tracks) { return __awaiter(_this, void 0, void 0, function () {
                            var cameraTrack;
                            return __generator(this, function (_a) {
                                if (tracks.length <= 0) {
                                    return [2 /*return*/];
                                }
                                cameraTrack = tracks[0];
                                this.onLocalTrackAdded([cameraTrack]);
                                this.screenSharing = false;
                                return [2 /*return*/];
                            });
                        }); })
                            .catch(function (error) {
                            _this.screenSharing = false;
                            console.log(error);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*chat*/
    BizGazeMeeting.prototype.sendChatMessage = function (msg) {
        this.jitsiRoom.sendTextMessage(msg);
    };
    BizGazeMeeting.prototype.sendPrivateChatMessage = function (targetId, msg) {
        this.sendJitsiPrivateCommand(targetId, jitsi_1.JitsiPrivateCommand.PRIVATE_CAHT, msg);
    };
    BizGazeMeeting.prototype.onReceiveChatMessage = function (id, msg, timestamp) {
        if (this.myInfo.Jitsi_Id === id)
            return;
        var user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this.ui.chattingWidget.receiveMessage(id, user.getDisplayName(), msg);
        }
    };
    BizGazeMeeting.prototype.onReceivePrivateChatMessage = function (senderId, msg) {
        if (this.myInfo.Jitsi_Id === senderId)
            return;
        var user = this.jitsiRoom.getParticipantById(senderId);
        if (user) {
            this.ui.chattingWidget.receiveMessage(senderId, user.getDisplayName(), msg, true);
        }
    };
    /*file sharing*/
    BizGazeMeeting.prototype.sendFileMeta = function (meta) {
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.FILE_META, meta.sessionId, { meta: JSON.stringify(meta) });
    };
    BizGazeMeeting.prototype.sendFileData = function (sessionId, data) {
        var binary = '';
        var bytes = new Uint8Array(data);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        var enc = window.btoa(binary);
        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.FILE_SLICE, sessionId, { data: enc });
    };
    BizGazeMeeting.prototype.onFileMeta = function (param) {
        var sessionId = param.value;
        var senderId = param.attributes.senderId;
        var senderName = param.attributes.senderName;
        var meta = JSON.parse(param.attributes.meta);
        if (senderId === this.myInfo.Jitsi_Id)
            return;
        this.ui.chattingWidget.onFileMeta(sessionId, meta, senderId, senderName);
    };
    BizGazeMeeting.prototype.onFileData = function (param) {
        var sessionId = param.value;
        var enc = param.attributes.data;
        var senderId = param.attributes.senderId;
        var senderName = param.attributes.senderName;
        if (senderId === this.myInfo.Jitsi_Id)
            return;
        var binary = window.atob(enc);
        var array = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; ++i) {
            array[i] = binary.charCodeAt(i);
        }
        this.ui.chattingWidget.onFileData(sessionId, array.buffer);
    };
    BizGazeMeeting.prototype.toggleRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.recording) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stopRecording()];
                    case 1:
                        _a.sent();
                        this.ui.toolbar.setRecording(this.recording);
                        return [3 /*break*/, 7];
                    case 2:
                        if (!this.myInfo.IsHost) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startRecording()];
                    case 3:
                        _a.sent();
                        this.ui.toolbar.setRecording(this.recording);
                        return [3 /*break*/, 7];
                    case 4:
                        if (!this.roomInfo.IsRecordingRequired) return [3 /*break*/, 5];
                        //ask permission to host
                        this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.ASK_RECORDING, this.myInfo.Jitsi_Id, null);
                        this.ui.notification_warning("Wait a second", "Sent your recording request", NotificationType_1.NotificationType.Recording);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.startRecording()];
                    case 6:
                        _a.sent();
                        this.ui.toolbar.setRecording(this.recording);
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.onAskRecording = function (param) {
        if (!this.myInfo.IsHost)
            return;
        var senderName = param.attributes.senderName;
        var senderId = param.attributes.senderId;
        this.ui.askDialog(senderName, "Requested a recording", NotificationType_1.NotificationType.Recording, this.allowRecording.bind(this), this.denyRecording.bind(this), senderId);
    };
    BizGazeMeeting.prototype.allowRecording = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_RECORDING, { allow: true });
    };
    BizGazeMeeting.prototype.denyRecording = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_RECORDING, { allow: false });
    };
    BizGazeMeeting.prototype.onAllowRecording = function (senderId, allow) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = this.jitsiRoom.getParticipantById(senderId);
                        if (!user) return [3 /*break*/, 3];
                        userName = user.getDisplayName();
                        if (!allow) return [3 /*break*/, 2];
                        this.ui.notification(userName, "Recording was accepted", NotificationType_1.NotificationType.Recording);
                        return [4 /*yield*/, this.startRecording()];
                    case 1:
                        _a.sent();
                        this.ui.toolbar.setRecording(this.recording);
                        return [3 /*break*/, 3];
                    case 2:
                        this.ui.notification_warning(userName, "Recording was denied", NotificationType_1.NotificationType.Recording);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.startRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gumStream, gdmStream, e_1, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gumStream = null;
                        gdmStream = null;
                        debugger;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 9]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: false, audio: true })];
                    case 2:
                        gumStream = _a.sent();
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia({
                                video: { displaySurface: "browser" },
                                audio: { channelCount: 2 }
                            })];
                    case 3:
                        gdmStream = _a.sent();
                        gdmStream.addEventListener('inactive', function (event) {
                            if (_this.recording)
                                _this.toggleRecording();
                        });
                        return [3 /*break*/, 9];
                    case 4:
                        e_1 = _a.sent();
                        //seems to has no audio device
                        debugger;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        gumStream = null;
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia({
                                video: { displaySurface: "browser" },
                                audio: { channelCount: 2 }
                            })];
                    case 6:
                        gdmStream = _a.sent();
                        gdmStream.addEventListener('inactive', function (event) {
                            if (_this.recording)
                                _this.toggleRecording();
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _a.sent();
                        console.error("capture for recording failure");
                        return [2 /*return*/];
                    case 8: return [3 /*break*/, 9];
                    case 9:
                        this.recorderStream = gumStream ? this.mixer(gumStream, gdmStream) : gdmStream;
                        this.mediaRecorder = new MediaRecorder(this.recorderStream, { mimeType: 'video/webm' });
                        this.mediaRecorder.ondataavailable = function (e) {
                            if (e.data && e.data.size > 0) {
                                _this.recordingData.push(e.data);
                                if (!_this.recording && !_this.downloadRecordFile) {
                                    _this.downloadRecordingFile();
                                }
                            }
                        };
                        this.mediaRecorder.onstop = function () {
                            _this.recorderStream.getTracks().forEach(function (track) { return track.stop(); });
                            gumStream.getTracks().forEach(function (track) { return track.stop(); });
                            gdmStream.getTracks().forEach(function (track) { return track.stop(); });
                        };
                        this.recorderStream.addEventListener('inactive', function () {
                            console.log('Capture stream inactive');
                            _this.stopRecording();
                        });
                        this.recordingData = [];
                        this.mediaRecorder.start();
                        this.recording = true;
                        this.downloadRecordFile = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.stopRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.recording)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.mediaRecorder.stop()];
                    case 1:
                        _a.sent();
                        this.downloadRecordingFile();
                        this.recording = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.downloadRecordingFile = function () {
        if (this.downloadRecordFile || this.recordingData.length <= 0)
            return;
        var blob = new Blob(this.recordingData, { type: 'video/webm' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = this.getRecordingFilename() + ".webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 5000);
        this.downloadRecordFile = true;
    };
    BizGazeMeeting.prototype.getRecordingFilename = function () {
        var now = new Date();
        var timestamp = now.toISOString();
        return this.roomInfo.conferenceName + "_recording_" + timestamp;
    };
    BizGazeMeeting.prototype.mixer = function (stream1, stream2) {
        var ctx = new AudioContext();
        var dest = ctx.createMediaStreamDestination();
        if (stream1.getAudioTracks().length > 0)
            ctx.createMediaStreamSource(stream1).connect(dest);
        if (stream2.getAudioTracks().length > 0)
            ctx.createMediaStreamSource(stream2).connect(dest);
        var tracks = dest.stream.getTracks();
        tracks = tracks.concat(stream1.getVideoTracks()).concat(stream2.getVideoTracks());
        return new MediaStream(tracks);
    };
    // handraise
    BizGazeMeeting.prototype.toggleHandRaise = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.myInfo.IsHost) {
                    //ask handraise to host
                    this.sendJitsiBroadcastCommand(jitsi_1.JitsiCommand.ASK_HANDRAISE, this.myInfo.Jitsi_Id, null);
                    this.ui.notification_warning("Wait a second", "Sent your hand-raise request", NotificationType_1.NotificationType.HandRaise);
                }
                return [2 /*return*/];
            });
        });
    };
    BizGazeMeeting.prototype.onAskHandRaise = function (param) {
        if (!this.myInfo.IsHost)
            return;
        var senderName = param.attributes.senderName;
        var senderId = param.attributes.senderId;
        this.ui.askDialog(senderName, "Requested Hand-Raise", NotificationType_1.NotificationType.HandRaise, this.allowHandRaise.bind(this), this.denyHandRaise.bind(this), senderId);
    };
    BizGazeMeeting.prototype.allowHandRaise = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_HANDRAISE, { allow: true });
    };
    BizGazeMeeting.prototype.denyHandRaise = function (jitsiId) {
        this.sendJitsiPrivateCommand(jitsiId, jitsi_1.JitsiPrivateCommand.ALLOW_HANDRAISE, { allow: false });
    };
    BizGazeMeeting.prototype.onAllowHandRaise = function (senderId, allow) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userName;
            return __generator(this, function (_a) {
                user = this.jitsiRoom.getParticipantById(senderId);
                if (user) {
                    userName = user.getDisplayName();
                    if (allow) {
                        this.ui.notification(userName, "Hand-raise was accepted", NotificationType_1.NotificationType.HandRaise);
                        this.onAllowCamera(true);
                        this.onAllowMic(true);
                    }
                    else {
                        this.ui.notification_warning(userName, "Hand-raise was denied", NotificationType_1.NotificationType.HandRaise);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    //highlight speaker
    BizGazeMeeting.prototype.onDominantSpeakerChanged = function (id) {
        if (id === this.myInfo.Jitsi_Id) {
            this.ui.videoPanelGrid.hightlightPanel(this.localVideoPanel.Id);
        }
        else {
            var user = this.jitsiRoom.getParticipantById(id);
            if (user) {
                var videoPanel = user.getProperty(UserProperty_1.UserProperty.videoPanel);
                if (videoPanel)
                    this.ui.videoPanelGrid.hightlightPanel(videoPanel.Id);
            }
        }
    };
    /**
     * **************************************************************************
     *              Log
     * **************************************************************************
     */
    BizGazeMeeting.prototype.Log = function (message) {
        console.log(message);
        if (this.ui != null)
            this.ui.Log(message);
    };
    return BizGazeMeeting;
}());
exports.BizGazeMeeting = BizGazeMeeting;
var meeting = new BizGazeMeeting();
meeting.start();
//# sourceMappingURL=meeting.js.map