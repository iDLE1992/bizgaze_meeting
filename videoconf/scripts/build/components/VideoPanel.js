"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPanel = exports.VideoPanelProps = void 0;
var MediaType_1 = require("../enum/MediaType");
var UserProperty_1 = require("../enum/UserProperty");
var snippet_1 = require("../util/snippet");
var vector_icon_1 = require("./vector_icon");
var VideoPanelProps = /** @class */ (function () {
    function VideoPanelProps() {
    }
    return VideoPanelProps;
}());
exports.VideoPanelProps = VideoPanelProps;
var VideoPanel = /** @class */ (function () {
    function VideoPanel(props) {
        this.videoElementClass = "video-element";
        this.moderatorClass = "moderator-icon";
        this.audioMuteClass = "audioMuted";
        this.videoMuteClass = "videoMuted";
        this.userNameClass = "displayname";
        this.shortNameClass = "avatar-container";
        this.activeSpeakerClass = "active-speaker";
        this.privateChatClass = "private-chat";
        this.popupMenuButtonClass = "remotevideomenu";
        this.props = props;
        this.panelClass = this.props.panelClass;
        this.fullscreenClass = this.props.fullscreenClass;
        this.popupMenuClass = this.props.popupMenuClass;
        this.Id = ++VideoPanel.nPanelInstanceId;
        this.root = this.create();
        this.videoElem = $("video", this.root)[0];
        this.audioElem = $("audio", this.root)[0];
        this.nameElem = $("." + this.userNameClass, this.root)[0];
        this.avatarNameElem = $("." + this.shortNameClass, this.root)[0];
        //white small icons at the bottom of panel
        this.audioMuteIconElem = $("." + this.audioMuteClass, this.root)[0];
        this.videoMuteIconElem = $("." + this.videoMuteClass, this.root)[0];
        this.moderatorIconElem = $("." + this.moderatorClass, this.root)[0];
        //menu items
        this.grantModeratorMenuItem = $("li.grant-moderator", this.root)[0];
        this.audioMuteMenuItem = $("li.audio-mute", this.root)[0];
        this.videoMuteMenuItem = $("li.video-mute", this.root)[0];
        this.fullscreenMuteItem = $("li.fullscreen", this.root)[0];
        //this.attachHandlers();
    }
    VideoPanel.prototype.attachHandlers = function () {
        var _this = this;
        $(this.root)
            .on('click', "." + _this.popupMenuButtonClass, function (e) {
            $("." + _this.popupMenuClass).removeClass("visible");
            $(this).find("." + _this.popupMenuClass).addClass("visible").focus();
            e.stopPropagation();
        })
            .on('click', 'li.overflow-menu-item', function (e) {
            $(this).closest("." + _this.popupMenuClass).removeClass("visible");
            e.stopPropagation();
        })
            .on('click', '.fullscreen', function (e) {
            $(_this.root).toggleClass(_this.fullscreenClass);
            _this.props.refreshGrid();
            var label = $(this).find(".label");
            if ($(_this.root).hasClass(_this.fullscreenClass)) {
                label.html("Exit full screen");
            }
            else {
                label.html("View full screen");
            }
        })
            .on('mouseover', function () {
            $(this).removeClass("display-video");
            $(this).addClass("display-name-on-video");
        })
            .on('mouseout', function () {
            $(this).removeClass("display-name-on-video");
            $(this).addClass("display-video");
        })
            .on('dblclick', function (e) {
            $(this).find(".fullscreen").trigger("click");
        });
    };
    VideoPanel.prototype.setShotnameVisible = function (show) {
        this.avatarNameElem.style.display = show ? "block" : "none";
        this.videoElem.style.visibility = show ? "hidden" : "visible";
    };
    VideoPanel.prototype.setUserName = function (name) {
        this.nameElem.innerHTML = name;
        $("text", this.avatarNameElem).html(snippet_1.avatarName(name));
    };
    VideoPanel.prototype.showModeratorIcon = function (show) {
        this.moderatorIconElem.style.display = show ? "block" : "none";
    };
    VideoPanel.prototype.setHighlight = function (h) {
        if (h)
            $(this.root).addClass(this.activeSpeakerClass);
        else
            $(this.root).removeClass(this.activeSpeakerClass);
    };
    VideoPanel.prototype.updatePanelOnJitsiUser = function (myInfo, jitsiUser) {
        var _this_1 = this;
        //set name
        this.setUserName(jitsiUser.getDisplayName());
        //hide shotname if exist visible video track
        var isVisibleVideo = false;
        jitsiUser.getTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo);
        //bottom small icons
        this.videoMuteIconElem.style.display = jitsiUser.isVideoMuted() ? "block" : "none";
        this.audioMuteIconElem.style.display = jitsiUser.isAudioMuted() ? "block" : "none";
        this.moderatorIconElem.style.display = jitsiUser.getProperty(UserProperty_1.UserProperty.IsHost) ? "block" : "none";
        //popup menu
        if (myInfo.IsHost) {
            var userHaveCamera_1 = false, userHaveMicrophone_1 = false;
            jitsiUser.getTracks().forEach(function (track) {
                if (track.getType() === MediaType_1.MediaType.VIDEO)
                    userHaveCamera_1 = true;
                else if (track.getType() === MediaType_1.MediaType.AUDIO)
                    userHaveMicrophone_1 = true;
            });
            this.videoMuteMenuItem.style.display = userHaveCamera_1 ? "flex" : "none";
            this.audioMuteMenuItem.style.display = userHaveMicrophone_1 ? "flex" : "none";
            this.grantModeratorMenuItem.style.display = "flex";
        }
        else {
            this.videoMuteMenuItem.style.display = "none";
            this.audioMuteMenuItem.style.display = "none";
            this.grantModeratorMenuItem.style.display = "none";
        }
        if (jitsiUser.getProperty(UserProperty_1.UserProperty.IsHost))
            this.grantModeratorMenuItem.style.display = "none";
        //popup menu audio icon/label change
        if (this.audioMuteMenuItem.style.display === 'flex') {
            if (jitsiUser.isAudioMuted()) {
                $(this.audioMuteMenuItem).find(".label").html("Unmute Audio");
                $(this.audioMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(this.audioMuteMenuItem).find(".label").html("Mute Audio");
                $(this.audioMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }
        if (this.videoMuteMenuItem.style.display === 'flex') {
            if (jitsiUser.isVideoMuted()) {
                $(this.videoMuteMenuItem).find(".label").html("Unmute Video");
                $(this.videoMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(this.videoMuteMenuItem).find(".label").html("Mute Video");
                $(this.videoMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }
        //popup menu handlers
        if (myInfo.IsHost) {
            $(this.grantModeratorMenuItem).unbind('click').on('click', function () {
                _this_1.props.grantModeratorRole(jitsiUser.getId());
            });
            $(this.audioMuteMenuItem).unbind('click').on('click', function () {
                _this_1.props.muteUserAudio(jitsiUser.getId(), !jitsiUser.isAudioMuted());
            });
            $(this.videoMuteMenuItem).unbind('click').on('click', function () {
                _this_1.props.muteUserVideo(jitsiUser.getId(), !jitsiUser.isVideoMuted());
            });
        }
        //private chat handler
        $(this.root).find("." + this.privateChatClass).unbind('click').on('click', function () {
            _this_1.props.openPrivateChat(jitsiUser.getId(), jitsiUser.getDisplayName());
        });
        //active speaker(blue border)
        $(this.root).removeClass(this.activeSpeakerClass);
    };
    VideoPanel.prototype.updatePanelOnMyBGUser = function (myInfo, localTracks) {
        var _this_1 = this;
        var audioMuted = true, videoMuted = true;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted())
                videoMuted = false;
            else if (track.getType() === MediaType_1.MediaType.AUDIO && !track.isMuted())
                audioMuted = false;
        });
        //name
        this.setUserName(myInfo.Name);
        var isVisibleVideo = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo);
        //bottom small icons
        this.videoMuteIconElem.style.display = videoMuted ? "block" : "none";
        this.audioMuteIconElem.style.display = audioMuted ? "block" : "none";
        this.moderatorIconElem.style.display = myInfo.IsHost ? "block" : "none";
        //popup menu
        if (myInfo.IsHost) {
            this.videoMuteMenuItem.style.display = myInfo.mediaPolicy.useCamera ? "flex" : "none";
            this.audioMuteMenuItem.style.display = myInfo.mediaPolicy.useMic ? "flex" : "none";
        }
        else {
            this.videoMuteMenuItem.style.display = "none";
            this.audioMuteMenuItem.style.display = "none";
        }
        this.grantModeratorMenuItem.style.display = "none";
        //popup menu audio icon/label change
        if (this.audioMuteMenuItem.style.display === 'flex') {
            if (audioMuted) {
                $(this.audioMuteMenuItem).find(".label").html("Unmute Audio");
                $(this.audioMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(this.audioMuteMenuItem).find(".label").html("Mute Audio");
                $(this.audioMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }
        if (this.videoMuteMenuItem.style.display === 'flex') {
            if (videoMuted) {
                $(this.videoMuteMenuItem).find(".label").html("Unmute Video");
                $(this.videoMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(this.videoMuteMenuItem).find(".label").html("Mute Video");
                $(this.videoMuteMenuItem).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }
        //popup menu handlers
        if (myInfo.IsHost) {
            $(this.audioMuteMenuItem).unbind('click').on('click', function () {
                _this_1.props.muteMyAudio(!audioMuted);
            });
            $(this.videoMuteMenuItem).unbind('click').on('click', function () {
                _this_1.props.muteMyVideo(!videoMuted);
            });
        }
        //hide private-chat item
        $(this.root).find("." + this.privateChatClass).hide();
        //active speaker(blue border)
        $(this.root).addClass(this.activeSpeakerClass);
    };
    VideoPanel.prototype.create = function () {
        var videoTag = "<video autoplay playsinline  class='" + this.videoElementClass + "' id='remoteVideo_" + this.Id + "'></video>";
        var audioTag = "<audio autoplay=\"\" id=\"remoteAudio_" + this.Id + "\"></audio>";
        var avatarVisible = 'visible';
        var cameraStatus = '<div class="indicator-container videoMuted"> \
                        <div> \
                            <span class="indicator-icon-container  toolbar-icon" id=""> \
                                <div class="jitsi-icon "> \
                                    <svg height="13" id="camera-disabled" width="13" viewBox="0 0 32 32"> \
                                        <path d="M4.375 2.688L28 26.313l-1.688 1.688-4.25-4.25c-.188.125-.5.25-.75.25h-16c-.75 0-1.313-.563-1.313-1.313V9.313c0-.75.563-1.313 1.313-1.313h1L2.687 4.375zm23.625 6v14.25L13.062 8h8.25c.75 0 1.375.563 1.375 1.313v4.688z"></path> \
                                    </svg> \
                                </div> \
                            </span> \
                        </div> \
                    </div>';
        var micStatus = '<div class="indicator-container audioMuted"> \
                            <div> \
                                <span class="indicator-icon-container  toolbar-icon" id=""> \
                                    <div class="jitsi-icon "> \
                                        <svg height="13" id="mic-disabled" width="13" viewBox="0 0 32 32"> \
                                            <path d="M5.688 4l22.313 22.313-1.688 1.688-5.563-5.563c-1 .625-2.25 1-3.438 1.188v4.375h-2.625v-4.375c-4.375-.625-8-4.375-8-8.938h2.25c0 4 3.375 6.75 7.063 6.75 1.063 0 2.125-.25 3.063-.688l-2.188-2.188c-.25.063-.563.125-.875.125-2.188 0-4-1.813-4-4v-1l-8-8zM20 14.875l-8-7.938v-.25c0-2.188 1.813-4 4-4s4 1.813 4 4v8.188zm5.313-.187a8.824 8.824 0 01-1.188 4.375L22.5 17.375c.375-.813.563-1.688.563-2.688h2.25z"></path> \
                                        </svg> \
                                    </div> \
                                </span> \
                            </div> \
                        </div>';
        var moderatorStatus = '<div class="moderator-icon right"> \
                                <div class="indicator-container"> \
                                    <div> \
                                        <span class="indicator-icon-container focusindicator toolbar-icon" id=""> \
                                            <div class="jitsi-icon "> \
                                                <svg height="13" width="13" viewBox="0 0 32 32"> \
                                                    <path d="M16 20.563l5 3-1.313-5.688L24.125 14l-5.875-.5L16 8.125 13.75 13.5l-5.875.5 4.438 3.875L11 23.563zm13.313-8.25l-7.25 6.313 2.188 9.375-8.25-5-8.25 5 2.188-9.375-7.25-6.313 9.563-.813 3.75-8.813 3.75 8.813z"></path> \
                                                </svg> \
                                            </div> \
                                        </span> \
                                    </div> \
                                </div> \
                            </div>';
        var panelHtml = "\n        <span class=\"" + this.panelClass + " display-video\">\n            " + videoTag + " \n            " + audioTag + "\n            <div class=\"videocontainer__toolbar\">\n                <div> " + cameraStatus + " " + micStatus + " " + moderatorStatus + "</div>\n            </div>\n            <div class=\"videocontainer__hoverOverlay\"></div>\n            <div class=\"displayNameContainer\"><span class=\"displayname\" id=\"localDisplayName\">Name</span></div>\n            <div class=\"avatar-container " + avatarVisible + "\" style=\"height: 105.5px; width: 105.5px;\">\n                <div class=\"avatar  userAvatar\" style=\"background-color: rgba(234, 255, 128, 0.4); font-size: 180%; height: 100%; width: 100%;\">\n                    <svg class=\"avatar-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                        <text dominant-baseline=\"central\" fill=\"rgba(255,255,255,.6)\" font-size=\"40pt\" text-anchor=\"middle\" x=\"50\" y=\"50\">Name</text>\n                    </svg>\n                </div>\n            </div >\n            <span class=\"" + this.popupMenuButtonClass + "\">\n                <div class=\"\" id=\"\">\n                    <span class=\"popover-trigger remote-video-menu-trigger\">\n                        <div class=\"jitsi-icon\">\n                            <svg height=\"1em\" width=\"1em\" viewBox=\"0 0 24 24\">\n                                <path d=\"M12 15.984c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 19.078 9.984 18s.938-2.016 2.016-2.016zm0-6c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 13.078 9.984 12 10.922 9.984 12 9.984zm0-1.968c-1.078 0-2.016-.938-2.016-2.016S10.922 3.984 12 3.984s2.016.938 2.016 2.016S13.078 8.016 12 8.016z\"></path>                             </svg>\n                        </div>\n                    </span>\n                </div>\n                <div class=\"" + this.popupMenuClass + "\" tabIndex=-1 style=\"position: relative; right: 168px;  top: 25px; width: 175px;\">\n                    <ul aria-label=\"More actions menu\" class=\"overflow-menu\">\n                        <li aria-label=\"Grant Moderator\" class=\"overflow-menu-item grant-moderator\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg height=\"22\" width=\"22\" viewBox=\"0 0 24 24\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14 4a2 2 0 01-1.298 1.873l1.527 4.07.716 1.912c.062.074.126.074.165.035l1.444-1.444 2.032-2.032a2 2 0 111.248.579L19 19a2 2 0 01-2 2H7a2 2 0 01-2-2L4.166 8.993a2 2 0 111.248-.579l2.033 2.033L8.89 11.89c.087.042.145.016.165-.035l.716-1.912 1.527-4.07A2 2 0 1114 4zM6.84 17l-.393-4.725 1.029 1.03a2.1 2.1 0 003.451-.748L12 9.696l1.073 2.86a2.1 2.1 0 003.451.748l1.03-1.03L17.16 17H6.84z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Grant Moderator</span>\n                        </li>\n                        <li aria-label=\"Mute\" class=\"overflow-menu-item audio-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Mute</span>\n                        </li>\n                        <li aria-label=\"Disable camera\" class=\"overflow-menu-item video-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon\">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M6.84 5.5h-.022L3.424 2.106a.932.932 0 10-1.318 1.318L4.182 5.5h-.515c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c.404 0 .777-.13 1.08-.352l3.746 3.746a.932.932 0 101.318-1.318l-4.31-4.31v-.024L13.75 12.41v.023l-5.1-5.099h.024L6.841 5.5zm6.91 4.274V7.333h-2.44L9.475 5.5h4.274c1.012 0 1.833.82 1.833 1.833v.786l3.212-1.835a.917.917 0 011.372.796v7.84c0 .344-.19.644-.47.8l-3.736-3.735 2.372 1.356V8.659l-2.75 1.571v1.377L13.75 9.774zM3.667 7.334h2.349l7.333 7.333H3.667V7.333z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Disable camera</span>\n                        </li>\n                        <li aria-label=\"Toggle full screen\" class=\"overflow-menu-item fullscreen\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M8.25 2.75H3.667a.917.917 0 00-.917.917V8.25h1.833V4.583H8.25V2.75zm5.5 1.833V2.75h4.583c.507 0 .917.41.917.917V8.25h-1.833V4.583H13.75zm0 12.834h3.667V13.75h1.833v4.583c0 .507-.41.917-.917.917H13.75v-1.833zM4.583 13.75v3.667H8.25v1.833H3.667a.917.917 0 01-.917-.917V13.75h1.833z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label overflow-menu-item-text\">View full screen</span>\n                        </li>\n                        <li aria-label=\"Private Chat\" class=\"overflow-menu-item " + this.privateChatClass + "\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M19,8H18V5a3,3,0,0,0-3-3H5A3,3,0,0,0,2,5V17a1,1,0,0,0,.62.92A.84.84,0,0,0,3,18a1,1,0,0,0,.71-.29l2.81-2.82H8v1.44a3,3,0,0,0,3,3h6.92l2.37,2.38A1,1,0,0,0,21,22a.84.84,0,0,0,.38-.08A1,1,0,0,0,22,21V11A3,3,0,0,0,19,8ZM8,11v1.89H6.11a1,1,0,0,0-.71.29L4,14.59V5A1,1,0,0,1,5,4H15a1,1,0,0,1,1,1V8H11A3,3,0,0,0,8,11Zm12,7.59-1-1a1,1,0,0,0-.71-.3H11a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label overflow-menu-item-text\">Private chat</span>\n                        </li>\n                    </ul>\n                </div>\n            </span>\n        </span >";
        return $(panelHtml)[0];
    };
    VideoPanel.nPanelInstanceId = 0; //increased when add new, but not decreased when remove panel
    return VideoPanel;
}());
exports.VideoPanel = VideoPanel;
//# sourceMappingURL=VideoPanel.js.map