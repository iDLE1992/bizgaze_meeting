"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingDialog = exports.SettingDialogProps = void 0;
var MediaType_1 = require("./jitsi/MediaType");
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
    }
    SettingDialog.prototype.init = function (props) {
        this.props = props;
        this.dialog = document.querySelector(".setting-dialog");
        this.showButton = document.querySelector(".setting-dialog>button");
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
        var _this = this;
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
        $(this.okButton).on('click', function () {
            _this.onOK();
        });
    };
    SettingDialog.prototype.refreshDeviceList = function () {
        var _this = this;
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            _this.cameraList = devices.filter(function (d) { return d.kind === 'videoinput'; });
            _this.micList = devices.filter(function (d) { return d.kind === 'audioinput'; });
            _this.speakerList = devices.filter(function (d) { return d.kind === 'audiooutput'; });
            _this.renderDevices();
        });
    };
    SettingDialog.prototype.renderDevices = function () {
        var _this = this;
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach(function (camera) {
            $(_this.cameraListElem).append("<option value=\"" + camera.deviceId + "\">" + camera.label + "</option>");
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach(function (mic) {
            $(_this.micListElem).append("<option value=\"" + mic.deviceId + "\">" + mic.label + "</option>");
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach(function (speaker) {
            $(_this.speakerListElem).append("<option value=\"" + speaker.deviceId + "\">" + speaker.label + "</option>");
        });
        this.activeCameraDeviceId = this.cameraList.length > 0 ? this.cameraList[0].deviceId : null;
        this.activeMicDeviceId = this.micList.length > 0 ? this.micList[0].deviceId : null;
        this.activeSpeakerDeviceId = this.speakerList.length > 0 ? this.speakerList[0].deviceId : null;
        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    t.attach(_this.videoPreviewElem);
                }
                else if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    t.attach(_this.audioPreviewElem);
                }
            });
        });
    };
    SettingDialog.prototype.clearDOMElement = function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    };
    SettingDialog.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
        var _this = this;
        this.videoTrackError = null;
        this.audioTrackError = null;
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
                if (_this.audioTrackError) {
                    //display error
                }
                if (_this.videoTrackError) {
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
        var _this = this;
        return this.JitsiMeetJS.createLocalTracks({
            devices: ['video'],
            cameraDeviceId: cameraDeviceId,
            micDeviceId: null
        })
            .catch(function (error) {
            _this.videoTrackError = error;
            return Promise.resolve([]);
        });
    };
    SettingDialog.prototype.createAudioTrack = function (micDeviceId) {
        var _this = this;
        return (this.JitsiMeetJS.createLocalTracks({
            devices: ['audio'],
            cameraDeviceId: null,
            micDeviceId: micDeviceId
        })
            .catch(function (error) {
            _this.audioTrackError = error;
            return Promise.resolve([]);
        }));
    };
    SettingDialog.prototype.onCameraChanged = function (cameraDeviceId) {
        var _this = this;
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    t.attach(_this.videoPreviewElem);
                }
            });
        });
    };
    SettingDialog.prototype.onMicChanged = function (micDeviceId) {
        var _this = this;
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    t.attach(_this.audioPreviewElem);
                }
            });
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
        this.props.onDeviceChange(this.activeCameraDeviceId, this.activeMicDeviceId, this.activeSpeakerDeviceId);
    };
    SettingDialog.prototype.closeDialog = function () {
        $(this.closeButton).trigger("click");
    };
    return SettingDialog;
}());
exports.SettingDialog = SettingDialog;
//# sourceMappingURL=SettingDialog.js.map