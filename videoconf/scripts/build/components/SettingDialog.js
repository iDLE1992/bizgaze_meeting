"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingDialog = exports.SettingDialogProps = void 0;
var MediaType_1 = require("../enum/MediaType");
var ActiveDevices_1 = require("../model/ActiveDevices");
var SettingDialogProps = /** @class */ (function () {
    function SettingDialogProps() {
    }
    return SettingDialogProps;
}());
exports.SettingDialogProps = SettingDialogProps;
var SettingDialog = /** @class */ (function () {
    function SettingDialog() {
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.audioTrackError = null;
        this.videoTrackError = null;
        this.activeCameraDeviceId = null;
        this.activeMicDeviceId = null;
        this.activeSpeakerDeviceId = null;
        this.localTracks = [];
    }
    SettingDialog.prototype.init = function (props) {
        this.props = props;
        this.dialog = document.querySelector(".setting-dialog-wrapper");
        this.showButton = document.querySelector(".setting-dialog-wrapper>button");
        $(this.dialog).addClass("d-none");
        this.okButton = document.querySelector("#setting-dialog-ok-button");
        this.closeButton = document.querySelector("#setting-dialog-cancel-button");
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");
        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");
        this.attachEventHandlers();
        this.refreshDeviceList();
    };
    SettingDialog.prototype.show = function () {
        $(this.dialog).removeClass("d-none");
        $(this.showButton).trigger("click");
    };
    SettingDialog.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        var _this = this;
        $(this.cameraListElem).off('change').on('change', function () {
            _this.onCameraChanged($(this).val());
        });
        $(this.micListElem).off('change').on('change', function () {
            _this.onMicChanged($(this).val());
        });
        $(this.speakerListElem).off('change').on('change', function () {
            _this.onSpeakerChanged($(this).val());
        });
        $(this.okButton).off('click').on('click', function () {
            _this_1.onOK();
        });
    };
    SettingDialog.prototype.refreshDeviceList = function () {
        var _this_1 = this;
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            _this_1.cameraList = devices.filter(function (d) { return d.kind === 'videoinput'; });
            _this_1.micList = devices.filter(function (d) { return d.kind === 'audioinput'; });
            _this_1.speakerList = devices.filter(function (d) { return d.kind === 'audiooutput'; });
            _this_1.renderDevices();
        });
    };
    SettingDialog.prototype.renderDevices = function () {
        var _this_1 = this;
        this.activeCameraDeviceId = this.props.curDevices.cameraId;
        this.activeMicDeviceId = this.props.curDevices.micId;
        this.activeSpeakerDeviceId = this.props.curDevices.speakerId;
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach(function (camera) {
            var selected = (_this_1.activeCameraDeviceId && camera.deviceId === _this_1.activeCameraDeviceId)
                ? "selected" : "";
            $(_this_1.cameraListElem).append("<option value=\"" + camera.deviceId + "\" " + selected + ">" + camera.label + "</option>");
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach(function (mic) {
            var selected = (_this_1.activeMicDeviceId && mic.deviceId === _this_1.activeMicDeviceId)
                ? "selected" : "";
            $(_this_1.micListElem).append("<option value=\"" + mic.deviceId + "\" " + selected + ">" + mic.label + "</option>");
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach(function (speaker) {
            var selected = (_this_1.activeSpeakerDeviceId && speaker.deviceId === _this_1.activeSpeakerDeviceId)
                ? "selected" : "";
            $(_this_1.speakerListElem).append("<option value=\"" + speaker.deviceId + "\" " + selected + ">" + speaker.label + "</option>");
        });
        $(".form-select").select2();
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
            _this_1.localTracks = tracks;
        });
    };
    SettingDialog.prototype.initCurrentDevices = function () {
        var _this_1 = this;
        var _this = this;
        $("option", this.cameraListElem).each(function (_) {
            if ($(_this_1).val() === _this.props.curDevices.micId)
                $(_this_1).attr("selected", "selected");
        });
    };
    SettingDialog.prototype.clearDOMElement = function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    };
    SettingDialog.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
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
    SettingDialog.prototype.createVideoTrack = function (cameraDeviceId) {
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
    SettingDialog.prototype.createAudioTrack = function (micDeviceId) {
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
    SettingDialog.prototype.onCameraChanged = function (cameraDeviceId) {
        var _this_1 = this;
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then(function (tracks) {
            var newTrack = tracks.find(function (t) { return t.getType() === MediaType_1.MediaType.VIDEO; });
            //remove existing track
            var oldTrack = _this_1.localTracks.find(function (t) { return t.getType() === MediaType_1.MediaType.VIDEO; });
            if (oldTrack) {
                oldTrack.dispose();
                _this_1.localTracks.splice(_this_1.localTracks.indexOf(oldTrack), 1);
            }
            if (newTrack) {
                _this_1.localTracks.push(newTrack);
                newTrack.attach(_this_1.videoPreviewElem);
            }
        });
    };
    SettingDialog.prototype.onMicChanged = function (micDeviceId) {
        var _this_1 = this;
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then(function (tracks) {
            var newTrack = tracks.find(function (t) { return t.getType() === MediaType_1.MediaType.AUDIO; });
            //remove existing track
            var oldTrack = _this_1.localTracks.find(function (t) { return t.getType() === MediaType_1.MediaType.AUDIO; });
            if (oldTrack) {
                oldTrack.dispose();
                _this_1.localTracks.splice(_this_1.localTracks.indexOf(oldTrack), 1);
            }
            if (newTrack) {
                _this_1.localTracks.push(newTrack);
                newTrack.attach(_this_1.audioPreviewElem);
            }
        });
    };
    SettingDialog.prototype.onSpeakerChanged = function (speakerDeviceId) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        }
        ;
    };
    SettingDialog.prototype.onOK = function () {
        this.closeDialog();
        var newDevices = new ActiveDevices_1.ActiveDevices();
        newDevices.cameraId = this.activeCameraDeviceId;
        newDevices.micId = this.activeMicDeviceId;
        newDevices.speakerId = this.activeSpeakerDeviceId;
        this.props.onDeviceChange(newDevices);
    };
    SettingDialog.prototype.closeDialog = function () {
        $(this.closeButton).trigger("click");
        this.localTracks.forEach(function (track) {
            track.dispose();
        });
    };
    return SettingDialog;
}());
exports.SettingDialog = SettingDialog;
//# sourceMappingURL=SettingDialog.js.map