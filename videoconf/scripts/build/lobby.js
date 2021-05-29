"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
var MediaType_1 = require("./enum/MediaType");
var snippet_1 = require("./util/snippet");
var ParticipantType_1 = require("./enum/ParticipantType");
var LobbySeetings = /** @class */ (function () {
    function LobbySeetings() {
    }
    return LobbySeetings;
}());
var Lobby = /** @class */ (function () {
    function Lobby() {
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.audioTrackError = null;
        this.videoTrackError = null;
        this.activeCameraDeviceId = null;
        this.activeMicDeviceId = null;
        this.activeSpeakerDeviceId = null;
        this.conferenceId = window.conferenceId;
        this.userId = window.userId;
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");
        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");
        this.videoMuteElem = document.getElementById("videoMute");
        this.audioMuteElem = document.getElementById("audioMute");
        this.anonymousNameFiled = document.getElementById("anonymous-name");
        this.startSessionButton = document.getElementById("start-session");
    }
    Lobby.prototype.start = function () {
        var _this_1 = this;
        var initOptions = {
            disableAudioLevels: true
        };
        this.JitsiMeetJS.init(initOptions);
        $(document).ready(function () {
            _this_1.resizeCameraView();
            _this_1.attachEventHandlers();
            _this_1.refreshDeviceList();
            $(_this_1.startSessionButton).prop('disabled', true);
            _this_1.videoMuteElem.checked = true;
            _this_1.audioMuteElem.checked = true;
            $.ajax({
                url: "/api/Meeting/" + _this_1.conferenceId,
                type: "GET",
                data: "",
                dataType: 'json',
                success: function (res) {
                    _this_1.onMeetingResult(res);
                },
                error: function (xhr, status, error) {
                    _this_1.onMeetingErrorResult(error);
                }
            });
        });
    };
    Lobby.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        var _this = this;
        $(this.cameraListElem).on('change', function () {
            _this.onCameraChanged($(this).val());
        });
        $(this.micListElem).on('change', function () {
            _this.onMicChanged($(this).val());
        });
        $(this.speakerListElem).on('change', function () {
            _this.onSpeakerChanged($(this).val());
        });
        $(this.startSessionButton).on('click', function () {
            _this_1.startSession();
        });
        $(window).resize(function () {
            _this_1.resizeCameraView();
        });
    };
    Lobby.prototype.refreshDeviceList = function () {
        var _this_1 = this;
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            _this_1.cameraList = devices.filter(function (d) { return d.kind === 'videoinput'; });
            _this_1.micList = devices.filter(function (d) { return d.kind === 'audioinput'; });
            _this_1.speakerList = devices.filter(function (d) { return d.kind === 'audiooutput'; });
            _this_1.renderDevices();
        });
    };
    Lobby.prototype.renderDevices = function () {
        var _this_1 = this;
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach(function (camera) {
            $(_this_1.cameraListElem).append("<option value=\"" + camera.deviceId + "\">" + camera.label + "</option>");
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach(function (mic) {
            $(_this_1.micListElem).append("<option value=\"" + mic.deviceId + "\">" + mic.label + "</option>");
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach(function (speaker) {
            $(_this_1.speakerListElem).append("<option value=\"" + speaker.deviceId + "\">" + speaker.label + "</option>");
        });
        this.activeCameraDeviceId = this.cameraList.length > 0 ? this.cameraList[0].deviceId : null;
        this.activeMicDeviceId = this.micList.length > 0 ? this.micList[0].deviceId : null;
        this.activeSpeakerDeviceId = this.speakerList.length > 0 ? this.speakerList[0].deviceId : null;
        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    t.attach(_this_1.videoPreviewElem);
                }
                else if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    t.attach(_this_1.audioPreviewElem);
                }
            });
        });
    };
    Lobby.prototype.clearDOMElement = function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    };
    Lobby.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
        var _this_1 = this;
        this.videoTrackError = null;
        this.audioTrackError = null;
        if (cameraDeviceId != null && micDeviceId != null) {
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['audio', 'video'],
                cameraDeviceId: cameraDeviceId,
                micDeviceId: micDeviceId
            }).catch(function () { return Promise.all([
                _this_1.createAudioTrack(micDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                }),
                _this_1.createVideoTrack(cameraDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                })
            ]); }).then(function (tracks) {
                if (_this_1.audioTrackError) {
                    //display error
                }
                if (_this_1.videoTrackError) {
                    //display error
                }
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
    Lobby.prototype.createVideoTrack = function (cameraDeviceId) {
        var _this_1 = this;
        return this.JitsiMeetJS.createLocalTracks({
            devices: ['video'],
            cameraDeviceId: cameraDeviceId,
            micDeviceId: null
        })
            .catch(function (error) {
            _this_1.videoTrackError = error;
            return Promise.resolve([]);
        });
    };
    Lobby.prototype.createAudioTrack = function (micDeviceId) {
        var _this_1 = this;
        return (this.JitsiMeetJS.createLocalTracks({
            devices: ['audio'],
            cameraDeviceId: null,
            micDeviceId: micDeviceId
        })
            .catch(function (error) {
            _this_1.audioTrackError = error;
            return Promise.resolve([]);
        }));
    };
    Lobby.prototype.onCameraChanged = function (cameraDeviceId) {
        var _this_1 = this;
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    t.attach(_this_1.videoPreviewElem);
                }
            });
        });
    };
    Lobby.prototype.onMicChanged = function (micDeviceId) {
        var _this_1 = this;
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    t.attach(_this_1.audioPreviewElem);
                }
            });
        });
    };
    Lobby.prototype.onSpeakerChanged = function (speakerDeviceId) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        }
        ;
    };
    Lobby.prototype.resizeCameraView = function () {
        var w = $("#camera-preview").width();
        var h = w * 9 / 16;
        $("#camera-preview").css("height", h);
        $("#camera-preview").css("min-height", h);
    };
    Lobby.prototype.startSession = function () {
        if (this.isAnonymousUser() && this.anonymousNameFiled.value.trim().length <= 0)
            return;
        $("[name=cameraId]").val(this.activeCameraDeviceId);
        $("[name=micId]").val(this.activeMicDeviceId);
        $("[name=speakerId]").val(this.activeSpeakerDeviceId);
        $("[name=anonymousUserName]").val(this.anonymousNameFiled.value.trim());
        $("[name=videoMute]").val(this.videoMuteElem.checked + "");
        $("[name=audioMute]").val(this.audioMuteElem.checked + "");
        $("form").submit();
    };
    Lobby.prototype.onMeetingResult = function (meeting) {
        var _this_1 = this;
        var hosts = meeting.Participants.filter(function (p) { return p.ParticipantType === ParticipantType_1.ParticipantType.Host; });
        if (hosts.length === 1)
            this.setOrganizerName(hosts[0].ParticipantName);
        else
            this.setOrganizerName("No organizer");
        //anonymous
        if (this.isAnonymousUser()) {
            $(this.anonymousNameFiled)
                .show()
                .focus()
                .keyup(function (_) {
                $(_this_1.startSessionButton).prop('disabled', _this_1.anonymousNameFiled.value.trim().length <= 0);
            }).keypress(function (e) {
                if ((e.keyCode || e.which) == 13) { //Enter keycode
                    e.preventDefault();
                    _this_1.startSession();
                }
            });
        }
        else {
            $(this.anonymousNameFiled).hide();
            $(this.startSessionButton).prop('disabled', false);
        }
        this.hidePreloader();
    };
    Lobby.prototype.onMeetingErrorResult = function (err) {
        location.href = "/";
    };
    Lobby.prototype.isAnonymousUser = function () {
        return !this.userId || !parseInt(this.userId);
    };
    /***********************************************************************************
    
                    Lobby UI methods
          (not introduced seperate UI class as this is simple class)
                           
    ************************************************************************************/
    Lobby.prototype.setOrganizerName = function (name) {
        $("#host-name").html(snippet_1.stripHTMLTags(name));
    };
    Lobby.prototype.hidePreloader = function () {
        $("#preloader").css("display", "none");
        $("#main-wrapper").addClass("show");
    };
    return Lobby;
}());
exports.Lobby = Lobby;
var lobby = new Lobby();
lobby.start();
//# sourceMappingURL=lobby.js.map