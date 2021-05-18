"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BizGazeMeeting = void 0;
var signalR = require("@microsoft/signalr");
var BGC_Msg_1 = require("./BGC_Msg");
var meeting_ui_1 = require("./meeting_ui");
var MediaType_1 = require("./jitsi/MediaType");
var CommandParam_1 = require("./jitsi/CommandParam");
var UserProperty_1 = require("./jitsi/UserProperty");
var Room_1 = require("./Room");
var TimeUtil_1 = require("./TimeUtil");
/***********************************************************************************

                       Lifecycle of Bizgaze Meeting

    connectToBG -> joinBGConference -> connectToJitsi -> joinJitsiConference -> ...
    ... -> leaveFromJitsi -> leaveFromBG

************************************************************************************/
var ControlMessageTypes;
(function (ControlMessageTypes) {
    ControlMessageTypes["GRANT_HOST_ROLE"] = "grant-host";
    ControlMessageTypes["MUTE_AUDIO"] = "mute_audio";
    ControlMessageTypes["MUTE_VIDEO"] = "mute_video";
})(ControlMessageTypes || (ControlMessageTypes = {}));
;
var BizGazeMeeting = /** @class */ (function () {
    function BizGazeMeeting() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("/BizGazeMeetingServer").build();
        this.connMap = new Map();
        this.joinedBGConference = false;
        this.joinedJitsiConference = false;
        this.m_UI = new meeting_ui_1.MeetingUI(this);
        this.roomInfo = new Room_1.BGRoom();
        this.m_BGUserList = new Map();
        this.localVideoElem = null;
        this.myInfo = {
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
        this.bizgazePeerLinkOffer = 'bizgazePeerLinkOffer';
        this.bizgazePeerLinkAnswer = 'bizgazePeerLinkAnswer';
        this.pcConfig = { "iceServers": [] };
        this.offerConstraints = { "optional": [], "mandatory": {} };
        this.mediaConstraints = { "audio": true, "video": { "mandatory": {}, "optional": [] } };
        this.sdpConstraints = { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } };
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.screenSharing = false;
        this.recording = false;
        this.downloadRecordFile = false;
        this.recordingData = [];
    }
    /**
     * **************************************************************************
     *              START ~ END
     *
     * **************************************************************************
     */
    BizGazeMeeting.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initOptions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(window._roomId && window._roomId > 0)) {
                            this.leaveBGConference();
                            return [2 /*return*/];
                        }
                        initOptions = {
                            disableAudioLevels: true
                        };
                        this.JitsiMeetJS.setLogLevel(this.JitsiMeetJS.logLevels.ERROR);
                        this.JitsiMeetJS.init(initOptions);
                        //capture media devices
                        return [4 /*yield*/, this.initMediaDevices()];
                    case 1:
                        //capture media devices
                        _a.sent();
                        this.Log("Camera: " + this.myInfo.hasMediaDevice.hasCamera);
                        this.Log("Mic: " + this.myInfo.hasMediaDevice.hasMic);
                        //update device status
                        this.m_UI.updateToolbar(this.myInfo, this.localTracks);
                        //connect to bg server
                        this.connectToBGServer(function () {
                            _this.Log("Connected to BizGaze SignalR Server");
                            _this.joinBGConference();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.stop = function () {
        if (this.joinedJitsiConference)
            this.leaveJitsiConference();
        else
            this.leaveBGConference();
    };
    BizGazeMeeting.prototype.forceStop = function () {
        this.leaveJitsiConference();
        this.leaveBGConference();
    };
    /**
     * **************************************************************************
     *              Local Camera/Microphone init
     *
     * **************************************************************************
     */
    BizGazeMeeting.prototype.initMediaDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var audioTracks, videoTracks, tracks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.Log('Getting user media devices ...');
                        return [4 /*yield*/, this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
                                var audioInputDeviceExist = false;
                                var videoInputDeviceExist = false;
                                var videoInputDevices = devices.filter(function (d) {
                                    return d.kind === 'videoinput';
                                });
                                if (videoInputDevices.length >= 1) {
                                    _this.Log("found one camera");
                                    videoInputDeviceExist = true;
                                    videoInputDevices.map(function (d) {
                                        return _this.Log(d.deviceId + "  ---> " + d.label);
                                    });
                                }
                                var audioInputDevices = devices.filter(function (d) { return d.kind === 'audioinput'; });
                                if (audioInputDevices.length >= 1) {
                                    audioInputDeviceExist = true;
                                    audioInputDevices.map(function (d) {
                                        return _this.Log(d.deviceId + "  ---> " + d.label);
                                    });
                                }
                                /*let createTrackOptions = [];
                                if (audioInputDeviceExist) createTrackOptions.push(MediaType.AUDIO);
                                if (videoInputDeviceExist) createTrackOptions.push(MediaType.VIDEO);*/
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.JitsiMeetJS.createLocalTracks({ devices: [MediaType_1.MediaType.AUDIO] }).catch(function (err) {
                            })];
                    case 2:
                        audioTracks = _a.sent();
                        return [4 /*yield*/, this.JitsiMeetJS.createLocalTracks({ devices: [MediaType_1.MediaType.VIDEO] }).catch(function (err) {
                            })];
                    case 3:
                        videoTracks = _a.sent();
                        tracks = [];
                        if (audioTracks && audioTracks.length > 0)
                            tracks.push(audioTracks[0]);
                        if (videoTracks && videoTracks.length > 0)
                            tracks.push(videoTracks[0]);
                        this.onLocalTracks(tracks);
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.onLocalTracks = function (tracks) {
        this.localTracks = tracks;
        for (var i = 0; i < this.localTracks.length; i++) {
            this.localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, function (audioLevel) { return console.log("Audio Level local: " + audioLevel); });
            this.localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, function () { console.log('local track muted'); });
            this.localTracks[i].addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, function () { return console.log('local track stoped'); });
            this.localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, function (deviceId) {
                return console.log("track audio output device was changed to " + deviceId);
            });
            if (this.localTracks[i].getType() === MediaType_1.MediaType.VIDEO) {
                this.myInfo.hasMediaDevice.hasCamera = true;
            }
            else if (this.localTracks[i].getType() === MediaType_1.MediaType.AUDIO) {
                this.myInfo.hasMediaDevice.hasMic = true;
            }
        }
        if (this.localVideoElem == null) {
            this.localVideoElem = this.m_UI.getEmptyVideoPanel();
        }
        this._updateMyPanel();
        for (var i = 0; i < this.localTracks.length; i++) {
            if (this.localTracks[i].getType() === MediaType_1.MediaType.VIDEO) {
                this.localTracks[i].attach(this.localVideoElem);
                this.m_UI.setShotnameVisible(false, this.localVideoElem);
            }
        }
    };
    BizGazeMeeting.prototype.stopAllMediaStreams = function () {
        if (this.localTracks && this.localTracks.length > 0) {
            var N = this.localTracks.length;
            for (var i = 0; i < N; i++) {
                this.localTracks[i].dispose();
            }
        }
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
        var serverdomain = "idlests.com";
        //const serverdomain = "unimail.in";
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
        this.Log("Connected to Jitsi Server");
        this.joinJitsiConference();
    };
    BizGazeMeeting.prototype.onJitsiConnectionFailed = function () {
        this.Log("sorry, failed to connect jitsi server");
    };
    BizGazeMeeting.prototype.disconnectFromJitsiServer = function () {
        this.Log("disconnected from jitsi server");
    };
    BizGazeMeeting.prototype.joinJitsiConference = function () {
        var _this = this;
        var confOptions = {
            openBridgeChannel: true
        };
        this.jitsiRoom = this.jitsiConnection.initJitsiConference("" + this.roomInfo.Id, confOptions);
        //remote track
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, function (track) {
            _this.onAddedRemoteTrack(track);
        });
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, function (track) {
            _this.onRemovedRemoteTrack(track);
        });
        //my join
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.CONFERENCE_JOINED, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.onJitsiConferenceJoined()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        }); }); });
        //my left
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.CONFERENCE_LEFT, function () { _this.onJitsiConferenceLeft(); });
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
            _this.onTrackMuteChanged(track);
        });
        //audio level change
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, function (userID, audioLevel) {
            _this.Log(userID + " - " + audioLevel);
        });
        //chat
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.MESSAGE_RECEIVED, function (id, message, timestamp) {
            _this.onReceiveChatMessage(id, message, timestamp);
        });
        //name change
        this.jitsiRoom.on(this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, function (userID, displayName) {
            console.log(userID + " - " + displayName);
        });
        //command
        this.jitsiRoom.addCommandListener(ControlMessageTypes.GRANT_HOST_ROLE, function (param) { _this.onChangedModerator(param); });
        this.jitsiRoom.addCommandListener(ControlMessageTypes.MUTE_AUDIO, function (param) { _this.onMutedAudio(param); });
        this.jitsiRoom.addCommandListener(ControlMessageTypes.MUTE_VIDEO, function (param) { _this.onMutedVideo(param); });
        //set name
        this.jitsiRoom.setDisplayName(this.myInfo.Name);
        //joinJitsiConference
        this.jitsiRoom.join(); //callback -  onJitsiUserJoined
    };
    BizGazeMeeting.prototype.leaveJitsiConference = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.localTracks.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.jitsiRoom.removeTrack(this.localTracks[i])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.jitsiRoom.leave().then(function () {
                            _this.leaveBGConference();
                        })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //my enter room
    BizGazeMeeting.prototype.onJitsiConferenceJoined = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.joinedJitsiConference = true;
                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var i;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < this.localTracks.length)) return [3 /*break*/, 4];
                                this.Log("[ OUT ] my track - " + this.localTracks[i].getType());
                                return [4 /*yield*/, this.jitsiRoom.addTrack(this.localTracks[i]).catch(function (error) {
                                        _this.Log(error);
                                    })];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, 500);
                //set subject
                this.m_UI.showMeetingSubject(this.roomInfo.subject);
                //set time
                setInterval(function () {
                    var delta = Date.now() - _this.localStartTimestamp;
                    var elapsed = _this.roomInfo.elapsed + delta;
                    _this.m_UI.updateTime(TimeUtil_1.TsToDateFormat(elapsed));
                }, 1000);
                return [2 /*return*/];
            });
        });
    };
    //my leave room
    BizGazeMeeting.prototype.onJitsiConferenceLeft = function () {
        this.joinedJitsiConference = false;
        this.leaveBGConference();
    };
    //remote enter room
    BizGazeMeeting.prototype.onJitsiUserJoined = function (id, user) {
        var _this = this;
        this.Log("joined user: " + user.getDisplayName());
        setTimeout(function () {
            if (!user.getProperty(UserProperty_1.UserProperty.videoElem)) {
                var videoElem = _this.m_UI.getEmptyVideoPanel();
                user.setProperty(UserProperty_1.UserProperty.videoElem, videoElem);
                _this._updateUserPanel(user);
            }
        }, 3000);
        //notify him that i am moderator
        if (this.myInfo.IsHost)
            this.grantModeratorRole(this.jitsiRoom.myUserId());
    };
    //remote leave room
    BizGazeMeeting.prototype.onJitsiUserLeft = function (id, user) {
        this.Log("left user: " + user.getDisplayName());
        this.m_UI.freeVideoPanel(user.getProperty(UserProperty_1.UserProperty.videoElem));
    };
    //[ IN ] remote track
    BizGazeMeeting.prototype.onAddedRemoteTrack = function (track) {
        if (track.isLocal()) {
            return;
        }
        this.Log("[ IN ] remote track - " + track.getType());
        var id = track.getParticipantId();
        var user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            var videoElem = user.getProperty(UserProperty_1.UserProperty.videoElem);
            if (!videoElem) {
                videoElem = this.m_UI.getEmptyVideoPanel();
                user.setProperty(UserProperty_1.UserProperty.videoElem, videoElem);
                this._updateUserPanel(user);
            }
            track.attach(videoElem);
            this._updateUserPanel(user);
        }
    };
    BizGazeMeeting.prototype._updateUserPanel = function (user) {
        if (user && user.getProperty(UserProperty_1.UserProperty.videoElem)) {
            var videoElem = user.getProperty(UserProperty_1.UserProperty.videoElem);
            this.m_UI.updatePanelOnJitsiUser(videoElem, this.myInfo, user);
        }
    };
    BizGazeMeeting.prototype._updateMyPanel = function () {
        if (this.localVideoElem)
            this.m_UI.updatePanelOnMyBGUser(this.localVideoElem, this.myInfo, this.localTracks);
    };
    // [DEL] remote track
    BizGazeMeeting.prototype.onRemovedRemoteTrack = function (track) {
        this.Log("[ DEL ] remotetrack - " + track.getType());
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_VIDEOTYPE_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED);
        track.removeAllListeners(this.JitsiMeetJS.events.track.NO_DATA_FROM_SOURCE);
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
        this.connection.invoke("Join", window._roomId + "", window._userId + "").catch(function (err) {
            return console.error("Join Meeting Failed.", err.toString());
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
    BizGazeMeeting.prototype.onBGConferenceJoined = function (roomId, userInfo) {
        this.joinedBGConference = true;
        this.roomInfo.Id = "" + roomId;
        this.myInfo.Id = userInfo.Id;
        this.myInfo.Name = userInfo.Name;
        this.myInfo.IsHost = userInfo.IsHost;
        //update name, moderator ...
        this._updateMyPanel();
        //connect to jitsi server and enter room
        this.connectToJitsiServer();
    };
    BizGazeMeeting.prototype.onBGConferenceLeft = function () {
        this.joinedBGConference = false;
        this.stopAllMediaStreams();
        this.m_BGUserList.clear();
        this.connMap.clear();
        $("form#return").submit();
    };
    BizGazeMeeting.prototype.onBGUserJoined = function (userInfo) {
        this.m_BGUserList.set(userInfo.Id, userInfo);
    };
    BizGazeMeeting.prototype.onBGUserLeft = function (userId) {
        if (this.m_BGUserList.has(userId))
            this.Log(this.m_BGUserList.get(userId).Name + " has left");
        if (this.m_BGUserList.has(userId)) {
            var conn = this.connMap.get(userId);
            if (conn != null)
                conn.closePeerConnection();
            this.m_BGUserList.delete(userId);
            this.connMap.delete(userId);
        }
        //self leave
        if (userId == this.myInfo.Id) {
            this.onBGConferenceLeft();
        }
    };
    BizGazeMeeting.prototype.registerBGServerCallbacks = function () {
        var _this = this;
        this.connection.on(BGC_Msg_1.BGC_Msg.ROOM_JOINED, function (roomId, strMyInfo) {
            var info = JSON.parse(strMyInfo);
            _this.onBGConferenceJoined(roomId, info);
        });
        this.connection.on(BGC_Msg_1.BGC_Msg.ROOM_USER_JOINED, function (strUserInfo) {
            var info = JSON.parse(strUserInfo);
            _this.onBGUserJoined(info);
        });
        this.connection.on(BGC_Msg_1.BGC_Msg.ERROR, function (message) {
            alert(message);
            _this.forceStop();
        });
        this.connection.on(BGC_Msg_1.BGC_Msg.ROOM_LEFT, function (clientId) {
            _this.onBGUserLeft(clientId);
        });
        this.connection.on(BGC_Msg_1.BGC_Msg.SIGNALING, function (sourceId, strMsg) {
            /*console.log(' received signaling message:', strMsg);
            let msg = JSON.parse(strMsg);
            if (sourceId != this.myInfo.Id && this.connMap.has(sourceId)) {
                let peerConn: BizGazeConnection = this.connMap.get(sourceId);
                peerConn.onSignalingMessage(msg);
            }*/
        });
        this.connection.on(BGC_Msg_1.BGC_Msg.ROOM_INFO, function (strInfo) {
            var info = JSON.parse(strInfo);
            _this.roomInfo.subject = info.subject;
            _this.roomInfo.elapsed = info.elapsed;
            //update local ts
            _this.localStartTimestamp = Date.now();
        });
    };
    BizGazeMeeting.prototype.sendBGSignalingMessage = function (destId, msg) {
        this.connection.invoke(BGC_Msg_1.BGC_Msg.SIGNALING, this.myInfo.Id, destId, JSON.stringify(msg)).catch(function (err) {
            return console.error(err.toString());
        });
    };
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
    BizGazeMeeting.prototype.grantModeratorRole = function (targetId) {
        var param = new CommandParam_1.CommandParam();
        param.value = targetId;
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.GRANT_HOST_ROLE, param);
    };
    BizGazeMeeting.prototype.onChangedModerator = function (param) {
        var _this = this;
        var targetId = param.value;
        var user = this.jitsiRoom.getParticipantById(targetId);
        if (user && !user.getProperty(UserProperty_1.UserProperty.isModerator)) {
            user.setProperty(UserProperty_1.UserProperty.isModerator, true);
            this._updateUserPanel(user);
        }
        else if (targetId == this.jitsiRoom.myUserId() && !this.myInfo.IsHost) {
            this.myInfo.IsHost = true;
            this._updateMyPanel();
            this.jitsiRoom.getParticipants().forEach(function (user) {
                _this._updateUserPanel(user);
            });
        }
    };
    //mute/unmute
    BizGazeMeeting.prototype.muteMyAudio = function (mute) {
        var _this = this;
        this.localTracks.forEach(function (track) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(track.getType() === MediaType_1.MediaType.AUDIO)) return [3 /*break*/, 4];
                        if (!mute) return [3 /*break*/, 2];
                        return [4 /*yield*/, track.mute()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, track.unmute()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    BizGazeMeeting.prototype.muteMyVideo = function (mute) {
        var _this = this;
        this.localTracks.forEach(function (track) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(track.getType() === MediaType_1.MediaType.VIDEO)) return [3 /*break*/, 4];
                        if (!mute) return [3 /*break*/, 2];
                        return [4 /*yield*/, track.mute()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, track.unmute()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    BizGazeMeeting.prototype.muteUserAudio = function (targetId, mute) {
        var param = new CommandParam_1.CommandParam();
        param.value = targetId;
        param.attributes = { mute: mute };
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.MUTE_AUDIO, param);
    };
    BizGazeMeeting.prototype.muteUserVideo = function (targetId, mute) {
        debugger;
        var param = new CommandParam_1.CommandParam();
        param.value = targetId;
        param.attributes = { mute: mute };
        this.jitsiRoom.sendCommandOnce(ControlMessageTypes.MUTE_VIDEO, param);
    };
    //these are called when user press bottom toolbar buttons
    BizGazeMeeting.prototype.OnToggleMuteMyAudio = function () {
        if (this.myInfo.IsHost) {
            var audioMuted_1 = false;
            this.localTracks.forEach(function (track) {
                if (track.getType() === MediaType_1.MediaType.AUDIO && track.isMuted())
                    audioMuted_1 = true;
            });
            this.muteMyAudio(!audioMuted_1);
        }
    };
    BizGazeMeeting.prototype.OnToggleMuteMyVideo = function () {
        if (this.myInfo.IsHost) {
            var videoMuted_1 = false;
            this.localTracks.forEach(function (track) {
                if (track.getType() === MediaType_1.MediaType.VIDEO && track.isMuted())
                    videoMuted_1 = true;
            });
            this.muteMyVideo(!videoMuted_1);
        }
    };
    BizGazeMeeting.prototype.onMutedAudio = function (param) {
        var targetId = param.value;
        if (targetId == this.jitsiRoom.myUserId()) {
            //IMPORTANT! attributes comes with string 
            var mute = param.attributes.mute === "true";
            this.muteMyAudio(mute);
        }
    };
    BizGazeMeeting.prototype.onMutedVideo = function (param) {
        var targetId = param.value;
        if (targetId == this.jitsiRoom.myUserId()) {
            var mute = param.attributes.mute === "true";
            this.muteMyVideo(mute);
        }
    };
    BizGazeMeeting.prototype.onTrackMuteChanged = function (track) {
        //update ui
        var id = track.getParticipantId();
        var user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this._updateUserPanel(user);
        }
        else if (id === this.jitsiRoom.myUserId()) {
            this._updateMyPanel();
            this.m_UI.updateToolbar(this.myInfo, this.localTracks);
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
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.turnOnScreenShare()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.m_UI.setScreenShare(this.screenSharing);
                        return [2 /*return*/];
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
                            var screenTrack, i, oldTrack;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (tracks.length <= 0) {
                                            return [2 /*return*/];
                                        }
                                        screenTrack = tracks[0];
                                        screenTrack.addEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, function () { return _this.Log('screen - mute chagned'); });
                                        screenTrack.addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, function () {
                                            _this.Log('screen - stopped');
                                            _this.toggleScreenShare();
                                        });
                                        i = 0;
                                        oldTrack = null;
                                        while (i < this.localTracks.length) {
                                            if (this.localTracks[i].getType() === MediaType_1.MediaType.VIDEO) {
                                                oldTrack = this.localTracks[i];
                                                break;
                                            }
                                            else {
                                                ++i;
                                            }
                                        }
                                        return [4 /*yield*/, this.jitsiRoom.replaceTrack(oldTrack, screenTrack).then(function () {
                                                if (oldTrack) {
                                                    oldTrack.dispose();
                                                    _this.localTracks.splice(i, 1);
                                                }
                                                _this.localTracks.push(screenTrack);
                                                screenTrack.attach(_this.localVideoElem);
                                                _this.screenSharing = true;
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
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
                            var videoTrack, i, oldTrack;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (tracks.length <= 0)
                                            return [2 /*return*/];
                                        videoTrack = tracks[0];
                                        this.localTracks.push(videoTrack);
                                        videoTrack.addEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, function () { return _this.Log('local track muted'); });
                                        videoTrack.addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, function () { return _this.Log('local track stoped'); });
                                        i = 0;
                                        oldTrack = null;
                                        while (i < this.localTracks.length) {
                                            if (this.localTracks[i].getType() === MediaType_1.MediaType.VIDEO) {
                                                oldTrack = this.localTracks[i];
                                                break;
                                            }
                                            else {
                                                ++i;
                                            }
                                        }
                                        return [4 /*yield*/, this.jitsiRoom.replaceTrack(oldTrack, videoTrack).then(function () {
                                                if (oldTrack) {
                                                    oldTrack.dispose();
                                                    _this.localTracks.splice(i, 1);
                                                }
                                                _this.localTracks.push(videoTrack);
                                                videoTrack.attach(_this.localVideoElem);
                                                _this.screenSharing = false;
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (error) {
                            _this.screenSharing = true;
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
    BizGazeMeeting.prototype.onReceiveChatMessage = function (id, msg, timestamp) {
        if (this.jitsiRoom.myUserId === id)
            return;
        var user = this.jitsiRoom.getParticipantById(id);
        if (user) {
            this.m_UI.receiveMessage(user.getDisplayName(), msg, timestamp);
        }
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
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.startRecording()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.m_UI.setRecording(this.recording);
                        return [2 /*return*/];
                }
            });
        });
    };
    BizGazeMeeting.prototype.startRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gumStream, gdmStream, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: false, audio: true })];
                    case 1:
                        gumStream = _a.sent();
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia({
                                video: { displaySurface: "browser" },
                                audio: { channelCount: 2 }
                            })];
                    case 2:
                        gdmStream = _a.sent();
                        gdmStream.addEventListener('inactive', function (event) {
                            if (_this.recording)
                                _this.toggleRecording();
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error("capture failure", e_1);
                        return [2 /*return*/];
                    case 4:
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
        return this.roomInfo.subject + "_recording_" + timestamp;
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
    /**
     * **************************************************************************
     *              Log
     * **************************************************************************
     */
    BizGazeMeeting.prototype.Log = function (message) {
        console.log(message);
        if (this.m_UI != null)
            this.m_UI.Log(message);
    };
    return BizGazeMeeting;
}());
exports.BizGazeMeeting = BizGazeMeeting;
var meeting = new BizGazeMeeting();
meeting.start();
//# sourceMappingURL=meeting.js.map