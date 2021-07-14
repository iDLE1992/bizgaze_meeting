"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolBar = exports.ToolBarProps = void 0;
var MediaType_1 = require("../enum/MediaType");
var vector_icon_1 = require("./vector_icon");
var ToolBarProps = /** @class */ (function () {
    function ToolBarProps() {
    }
    return ToolBarProps;
}());
exports.ToolBarProps = ToolBarProps;
var ToolBar = /** @class */ (function () {
    function ToolBar(props) {
        this.root = null;
        this.props = props;
        this.root = document.getElementById("new-toolbox");
        this.toolbarAudioButtonElement = document.querySelector("#mic-enable");
        this.toolbarVideoButtonElement = document.querySelector("#camera-enable");
        this.toolbarDesktopShareButtonElement = document.querySelector("#share");
        this.toolbarRecordButtonElement = document.querySelector("#record");
        this.toolbarHandRaiseButtonElement = document.querySelector("#handraise");
        this.toolbarChatButtonElement = document.querySelector("#chat");
        this.toolbarLeaveButtonElement = document.querySelector("#leave");
        this.toolbarSettingButtonElement = document.querySelector("#setting");
        this.chattingUnreadBadge = document.querySelector(".chat-badge");
        this.attachHandlers();
    }
    ToolBar.prototype.attachHandlers = function () {
        var _this = this;
        $(this.toolbarVideoButtonElement).on('click', function () {
            _this.props.toggleVideoMute();
        });
        $(this.toolbarAudioButtonElement).on('click', function () {
            _this.props.toggleAudioMute();
        });
        $(this.toolbarChatButtonElement).on('click', function (_) {
            _this.props.openChatting(true);
        });
        $(this.toolbarDesktopShareButtonElement).on("click", function () {
            _this.props.toggleScreenShare();
        });
        $(this.toolbarRecordButtonElement).on('click', function () {
            _this.props.toggleRecording();
        });
        $(this.toolbarHandRaiseButtonElement).on('click', function () {
            console.log("handraise clicked");
            _this.props.toggleHandRaise();
        });
        $(this.toolbarSettingButtonElement).on('click', function () {
            _this.props.openSetting();
        });
        $(this.toolbarLeaveButtonElement).click(function () {
            _this.props.leaveMeeting();
        });
    };
    ToolBar.prototype.update = function (userInfo, localTracks) {
        var audioMuted = true, videoMuted = true;
        var hasAudioTrack = false, hasVideoTrack = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO) {
                hasVideoTrack = true;
                if (track.isMuted())
                    videoMuted = true;
                else
                    videoMuted = false;
            }
            else if (track.getType() === MediaType_1.MediaType.AUDIO) {
                hasAudioTrack = true;
                if (track.isMuted())
                    audioMuted = true;
                else
                    audioMuted = false;
            }
        });
        //this.toolbarVideoButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        //this.toolbarDesktopShareButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        //this.toolbarAudioButtonElement.style.display = hasAudioTrack ? "inline-block" : "none";
        if (audioMuted) {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            $(this.toolbarAudioButtonElement).addClass("muted");
        }
        else {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            $(this.toolbarAudioButtonElement).removeClass("muted");
        }
        if (videoMuted) {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            $(this.toolbarVideoButtonElement).addClass("muted");
        }
        else {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            $(this.toolbarVideoButtonElement).removeClass("muted");
        }
    };
    ToolBar.prototype.setScreenShare = function (on) {
        if (on) {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).addClass("toggled");
        }
        else {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).removeClass("toggled");
        }
    };
    ToolBar.prototype.setRecording = function (on) {
        if (on) {
            $(this.toolbarRecordButtonElement).addClass("live");
        }
        else {
            $(this.toolbarRecordButtonElement).removeClass("live");
        }
    };
    ToolBar.prototype.fadeIn = function () {
        $(this.root).addClass("visible");
    };
    ToolBar.prototype.fadeOut = function () {
        $(this.root).removeClass("visible");
    };
    ToolBar.prototype.showUnreadBadge = function (show) {
        this.chattingUnreadBadge.style.display = !!show ? "flex" : "none";
    };
    ToolBar.prototype.setUnreadCount = function (count) {
        this.chattingUnreadBadge.innerHTML = "" + count;
    };
    ToolBar.prototype.updateByRole = function (isHost) {
        this.toolbarHandRaiseButtonElement.style.display = isHost ? "none" : "inline-block";
    };
    return ToolBar;
}());
exports.ToolBar = ToolBar;
//# sourceMappingURL=ToolBar.js.map