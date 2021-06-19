
/****************************************************************
  
          nPanelCount = 4

----------panelContainer--------------

    ---panel---       ---panel---
    |    1     |      |    2    |
    |__________|      |_________|

    ---panel---       ---panel---
    |    3     |      |    4    |
    |__________|      |_________|

-------------------------------------

         Buttons -  audio/videoMute, screenShare, Record, Chat
*****************************************************************/

import { UserInfo } from "./model/BGUser"
import { VectorIcon } from "./components/vector_icon"
import { BizGazeMeeting } from "./meeting"
import { JitsiParticipant } from "./jitsi/JitsiParticipant";
import { MediaType } from "./enum/MediaType"
import { UserProperty } from "./enum/UserProperty";
import { JitsiTrack } from "./jitsi/JitsiTrack";
import { SettingDialog, SettingDialogProps } from "./components/SettingDialog";
import { ChattingPanel, ChattingPanelProps } from "./components/ChattingPanel";
import { ParticipantListPanel, ParticipantListPanelProps } from "./components/ParticipantListPanel";
import { NotificationType } from "./enum/NotificationType";
import { avatarName } from "./util/snippet";
import { AskDialog, AskDialogProps } from "./components/AskDialog";



declare global {
    interface Window { _roomId: number; meetingController: any }
    interface JQueryStatic { toast: Function; }
}

enum PanelVideoState { NoCamera = "no-camera", ScreenShare = "screen", Camera = "camera", VideoStreaming = "stream" }

export class MeetingUI {
    MAX_PANELS: number = 9;
    nPanelCount: number = 0;

    panelContainerId: string = "video-panel";
    panelContainerElement: HTMLElement = null;
    toolbarId: string = "new-toolbox";
    toolbarElement: HTMLElement = null;

    panelClass: string = "videocontainer"; //every panel elements have this class
    videoElementClass: string = "video-element";
    shortNameClass: string = "avatar-container";
    moderatorClass: string = "moderator-icon";
    audioMuteClass: string = "audioMuted";
    videoMuteClass: string = "videoMuted";
    popupMenuClass: string = "popup-menu";
    popupMenuButtonClass: string = "remotevideomenu";
    userNameClass: string = "displayname";
    activeSpeakerClass: string = "active-speaker";
    fullscreenClass: string = "video-fullscreen";
    privateChatClass: string = "private-chat";

    toolbarAudioButtonElement: HTMLElement;
    toolbarVideoButtonElement: HTMLElement;
    toolbarDesktopShareButtonElement: HTMLElement;
    toolbarRecordButtonElement: HTMLElement;
    toolbarChatButtonElement: HTMLElement;
    toolbarLeaveButtonElement: HTMLElement;
    toolbarSettingButtonElement: HTMLElement;

    topInfobarElement: HTMLElement;
    subjectElement: HTMLElement;
    timestampElement: HTMLElement;
    initTopInfo: boolean = false;

    userListToggleButtonElement: HTMLElement;

    nPanelInstanceId: number = 1;//increased when add new, but not decreased when remove panel
    meeting: BizGazeMeeting = null;

    chattingPanel: ChattingPanel;
    participantsListPanel: ParticipantListPanel;

    constructor(meeting: BizGazeMeeting) {
        this.meeting = meeting;

        this.panelContainerElement = document.getElementById(this.panelContainerId);
        this.toolbarElement = document.getElementById(this.toolbarId);
        this.toolbarAudioButtonElement = document.querySelector("#mic-enable");
        this.toolbarVideoButtonElement = document.querySelector("#camera-enable");
        this.toolbarDesktopShareButtonElement = document.querySelector("#share");
        this.toolbarRecordButtonElement = document.querySelector("#record");
        this.toolbarChatButtonElement = document.querySelector("#chat");
        this.toolbarLeaveButtonElement = document.querySelector("#leave");
        this.toolbarSettingButtonElement = document.querySelector("#setting");

        this.subjectElement = document.querySelector(".subject-text");
        this.timestampElement = document.querySelector(".subject-timer");
        this.topInfobarElement = document.querySelector(".subject");

        this.userListToggleButtonElement = document.querySelector("#open-participants-toggle");

        this.registerEventHandlers();

        this.chattingPanel = new ChattingPanel();
        const props = new ChattingPanelProps();
        props.chatOpenButton = this.toolbarChatButtonElement;
        props.unreadBadgeElement = document.querySelector(".chat-badge");
        props.openCallback = this.refreshCardViews.bind(this);
        props.sendChat = this.meeting.sendChatMessage.bind(this.meeting);
        props.sendPrivateChat = this.meeting.sendPrivateChatMessage.bind(this.meeting);
        props.sendFileMeta = this.meeting.sendFileMeta.bind(this.meeting);
        props.sendFileData = this.meeting.sendFileData.bind(this.meeting);
        props.onFileSendErrror = this.onFileSendError.bind(this);
        props.onFileSendFinished = this.onFileSendFinished.bind(this);
        props.onFileReceiveError = this.onFileReceiveError.bind(this);
        props.onFileReceiveFinished = this.onFileReceiveFinished.bind(this);
        this.chattingPanel.init(props);

        this.participantsListPanel = new ParticipantListPanel();
        const lProps = new ParticipantListPanelProps();
        lProps.onUseCamera = this.meeting.allowCamera.bind(this.meeting);
        lProps.onUseMic = this.meeting.allowMic.bind(this.meeting);
        this.participantsListPanel.init(lProps);
    }

    private registerEventHandlers() {
        $(window).resize(() => {
            this.refreshCardViews();
        });
        window.addEventListener('unload', () => {
            this.meeting.forceStop();
        });

        $(document).ready(() => {
            this.refreshCardViews();
            const _this = this;

            $(this.toolbarLeaveButtonElement).click(() => {
                this.meeting.stop();
            });

            if (this.meeting.config.hideToolbarOnMouseOut) {
                $("#content").hover(
                    _ => {
                        $(this.toolbarElement).addClass("visible");
                        if (this.initTopInfo)
                            $(this.topInfobarElement).addClass("visible");
                    },
                    _ => {
                        $(this.toolbarElement).removeClass("visible");
                        if (this.initTopInfo)
                            $(this.topInfobarElement).removeClass("visible");
                    }
                ).click(() => {
                    $(`.${this.popupMenuClass}`).removeClass("visible");
                });
            } else {
                $(this.toolbarElement).addClass("visible");
                if (this.initTopInfo)
                    $(this.topInfobarElement).addClass("visible");
            }

            $("#mic-enable").click(() => {
                this.meeting.OnToggleMuteMyAudio();
                /*var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {

                    el.find("svg").attr("viewBox", "0 0 22 22");
                    el.find("path").attr("d", "M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z");
                } else {
                    el.find("svg").attr("viewBox", "0 0 24 24");
                    el.find("path").attr("d", "M16 6a4 4 0 00-8 0v6a4.002 4.002 0 003.008 3.876c-.005.04-.008.082-.008.124v1.917A6.002 6.002 0 016 12a1 1 0 10-2 0 8.001 8.001 0 007 7.938V21a1 1 0 102 0v-1.062A8.001 8.001 0 0020 12a1 1 0 10-2 0 6.002 6.002 0 01-5 5.917V16c0-.042-.003-.083-.008-.124A4.002 4.002 0 0016 12V6zm-4-2a2 2 0 00-2 2v6a2 2 0 104 0V6a2 2 0 00-2-2z");
                }*/
            });

            $("#camera-enable").click(() => {
                this.meeting.OnToggleMuteMyVideo();
                /*var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {
                    el.find("path").attr("d", "M 6.84 5.5 h -0.022 L 3.424 2.106 a 0.932 0.932 0 1 0 -1.318 1.318 L 4.182 5.5 h -0.515 c -1.013 0 -1.834 0.82 -1.834 1.833 v 7.334 c 0 1.012 0.821 1.833 1.834 1.833 H 13.75 c 0.404 0 0.777 -0.13 1.08 -0.352 l 3.746 3.746 a 0.932 0.932 0 1 0 1.318 -1.318 l -4.31 -4.31 v -0.024 L 13.75 12.41 v 0.023 l -5.1 -5.099 h 0.024 L 6.841 5.5 Z m 6.91 4.274 V 7.333 h -2.44 L 9.475 5.5 h 4.274 c 1.012 0 1.833 0.82 1.833 1.833 v 0.786 l 3.212 -1.835 a 0.917 0.917 0 0 1 1.372 0.796 v 7.84 c 0 0.344 -0.19 0.644 -0.47 0.8 l -3.736 -3.735 l 2.372 1.356 V 8.659 l -2.75 1.571 v 1.377 L 13.75 9.774 Z M 3.667 7.334 h 2.349 l 7.333 7.333 H 3.667 V 7.333 Z");
                } else {
                    el.find("path").attr("d", "M13.75 5.5H3.667c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c1.012 0 1.833-.82 1.833-1.833v-.786l3.212 1.835a.916.916 0 001.372-.796V7.08a.917.917 0 00-1.372-.796l-3.212 1.835v-.786c0-1.012-.82-1.833-1.833-1.833zm0 3.667v5.5H3.667V7.333H13.75v1.834zm4.583 4.174l-2.75-1.572v-1.538l2.75-1.572v4.682z");
                }*/
            });

            $(this.toolbarChatButtonElement).on('click', _ => {
                this.chattingPanel.toggleOpen();
            });

            $(this.toolbarDesktopShareButtonElement).on("click", () => {
                this.meeting.toggleScreenShare();
            });

            $(this.toolbarRecordButtonElement).on('click', () => {
                this.meeting.toggleRecording();
            });

            $(this.toolbarSettingButtonElement).on('click', () => {
                this.showSettingDialog();
            });

            document.addEventListener('click', (e) => {
                let inside = $(e.target).closest(`.${this.popupMenuClass}`).length > 0;
                if (!inside) {
                    $(`.${this.popupMenuClass}`).removeClass("visible");
                }
            });
        });
    }

    updateByRole(isHost: boolean) {
        const isWebinar = this.meeting.roomInfo.IsWebinar;
        if (isWebinar && !isHost)
            this.showParticipantListButton(false);
        else
            this.showParticipantListButton(true);

        this.participantsListPanel.updateByRole(isHost);
    }


    private registerPanelEventHandler(panel: HTMLElement) {
        const _this = this;

        $(panel)
            .on('click', `.${_this.popupMenuButtonClass}`,
                function (e) {
                    $(`.${_this.popupMenuClass}`).removeClass("visible");
                    $(this).find(`.${_this.popupMenuClass}`).addClass("visible").focus();
                    e.stopPropagation();
                }
            )
            .on('click', 'li.overflow-menu-item',
                function (e) {
                    $(this).closest(`.${_this.popupMenuClass}`).removeClass("visible");
                    e.stopPropagation();
                }
            )
            .on('click', '.fullscreen',
                function (e) {
                    $(panel).toggleClass(_this.fullscreenClass);
                    _this.refreshCardViews();

                    const label = $(this).find(".label");
                    if ($(panel).hasClass(_this.fullscreenClass)) {
                        label.html("Exit full screen");
                    } else {
                        label.html("View full screen");
                    }
                }
            )
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
            })
            ;
    }

    private _getPanelFromVideoElement(videoElem: HTMLMediaElement): HTMLElement {
        return videoElem.parentNode as HTMLElement;
    }

    private _getVideoElementFromPanel(panel: HTMLElement): HTMLMediaElement {
        return $(`.${this.videoElementClass}`, panel)[0] as HTMLMediaElement;
    }

    private _getAudioElementFromPanel(panel: HTMLElement): HTMLMediaElement {
        return $(`audio`, panel)[0] as HTMLMediaElement;
    }

    private _getShortNameElementFromPanel(panel: HTMLElement): HTMLElement {
        return $(`.${this.shortNameClass}`, panel)[0] as HTMLElement;
    }

    private _getAudioMuteElementFromPanel(panel: HTMLElement): HTMLElement {
        return $(`.${this.audioMuteClass}`, panel)[0] as HTMLElement;
    }

    private _getVideoMuteElementFromPanel(panel: HTMLElement): HTMLElement {
        return $(`.${this.videoMuteClass}`, panel)[0] as HTMLElement;
    }

    private _getModeratorStarElementFromPanel(panel: HTMLElement): HTMLElement {
        return $(`.${this.moderatorClass}`, panel)[0] as HTMLElement;
    }

    private _getNameElementFromPanel(panel: HTMLElement): HTMLElement {
        return $(`.${this.userNameClass}`, panel)[0] as HTMLElement;
    }

    private _getPopupMenuGrantModeratorFromPanel(panel: HTMLElement): HTMLElement {
        return $(`li.grant-moderator`, panel)[0] as HTMLElement;
    }
    private _getPopupMenuAudioMuteFromPanel(panel: HTMLElement): HTMLElement {
        return $(`li.audio-mute`, panel)[0] as HTMLElement;
    }
    private _getPopupMenuVideoMuteFromPanel(panel: HTMLElement): HTMLElement {
        return $(`li.video-mute`, panel)[0] as HTMLElement;
    }
    private _getPopupMenuFullscreenFromPanel(panel: HTMLElement): HTMLElement {
        return $(`li.fullscreen`, panel)[0] as HTMLElement;
    }

    public getEmptyVideoPanel(): any {
        let panel: HTMLElement = this.addNewPanel();
        this.registerPanelEventHandler(panel);

        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = "none";
        this._getAudioMuteElementFromPanel(panel).style.display = "none";
        this._getModeratorStarElementFromPanel(panel).style.display = "none";

        const videoElem = this._getVideoElementFromPanel(panel);
        const audioElem = this._getAudioElementFromPanel(panel);
        return { videoElem, audioElem };
    }

    public freeVideoPanel(videoElement: HTMLMediaElement) {
        const videoCardViews = document.querySelectorAll(`video.${this.videoElementClass}`);
        const N: number = videoCardViews.length;
        let i: number = 0;
        for (i = 0; i < N; i++) {
            if (videoCardViews[i] == videoElement) {
                var curElem = videoCardViews[i];
                while (!$(curElem).hasClass(this.panelClass))
                    curElem = curElem.parentElement;
                curElem.remove();
                return;
            }
        }
        this.refreshCardViews();
    }

    public updatePanelOnJitsiUser(videoElem: HTMLMediaElement, myInfo: UserInfo, user: JitsiParticipant) {
        const panel = this._getPanelFromVideoElement(videoElem);
        if (!panel)
            return;

        //set name
        this.setUserName(user.getDisplayName(), videoElem);

        //hide shotname if exist visible video track
        let isVisibleVideo = false;
        user.getTracks().forEach(track => {
            if (track.getType() === MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo, videoElem);

        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = user.isVideoMuted() ? "block" : "none";
        this._getAudioMuteElementFromPanel(panel).style.display = user.isAudioMuted() ? "block" : "none";
        this._getModeratorStarElementFromPanel(panel).style.display = user.getProperty(UserProperty.IsHost) ? "block" : "none";

        //popup menu
        const audioMutePopupMenu = this._getPopupMenuAudioMuteFromPanel(panel);
        const videoMutePopupMenu = this._getPopupMenuVideoMuteFromPanel(panel);
        const grantModeratorPopupMenu = this._getPopupMenuGrantModeratorFromPanel(panel);

        if (myInfo.IsHost) {
            let userHaveCamera = false, userHaveMicrophone = false;
            user.getTracks().forEach(track => {
                if (track.getType() === MediaType.VIDEO) userHaveCamera = true;
                else if (track.getType() === MediaType.AUDIO) userHaveMicrophone = true;
            })

            videoMutePopupMenu.style.display = userHaveCamera ? "flex" : "none";
            audioMutePopupMenu.style.display = userHaveMicrophone ? "flex" : "none";
            grantModeratorPopupMenu.style.display = "flex";
        } else {
            videoMutePopupMenu.style.display = "none";
            audioMutePopupMenu.style.display = "none";
            grantModeratorPopupMenu.style.display = "none";
        }
        if (user.getProperty(UserProperty.IsHost))
            grantModeratorPopupMenu.style.display = "none";

        //popup menu audio icon/label change
        if (audioMutePopupMenu.style.display === 'flex') {
            if (user.isAudioMuted()) {
                $(audioMutePopupMenu).find(".label").html("Unmute Audio");
                $(audioMutePopupMenu).find("path").attr("d", VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(audioMutePopupMenu).find(".label").html("Mute Audio");
                $(audioMutePopupMenu).find("path").attr("d", VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }

        if (videoMutePopupMenu.style.display === 'flex') {
            if (user.isVideoMuted()) {
                $(videoMutePopupMenu).find(".label").html("Unmute Video");
                $(videoMutePopupMenu).find("path").attr("d", VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(videoMutePopupMenu).find(".label").html("Mute Video");
                $(videoMutePopupMenu).find("path").attr("d", VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }

        //popup menu handlers
        if (myInfo.IsHost) {
            $(grantModeratorPopupMenu).unbind('click').on('click', () => {
                this.meeting.grantModeratorRole(user.getId());
            });
            $(audioMutePopupMenu).unbind('click').on('click', () => {
                this.meeting.muteUserAudio(user.getId(), !user.isAudioMuted());
            });
            $(videoMutePopupMenu).unbind('click').on('click', () => {
                this.meeting.muteUserVideo(user.getId(), !user.isVideoMuted());
            });
        }

        //private chat handler
        $(panel).find(`.${this.privateChatClass}`).click(_ => {
            this.chattingPanel.open(true);
            this.chattingPanel.setPrivateState(user.getId(), user.getDisplayName());
        });

        //active speaker(blue border)
        $(panel).removeClass(this.activeSpeakerClass);

    }

    public updatePanelOnMyBGUser(videoElem: HTMLMediaElement, myInfo: UserInfo, localTracks: JitsiTrack[]) {
        const panel = this._getPanelFromVideoElement(videoElem);
        if (!panel) return;

        let audioMuted = true, videoMuted = true;
        localTracks.forEach(track => {
            if (track.getType() === MediaType.VIDEO && !track.isMuted()) videoMuted = false;
            else if (track.getType() === MediaType.AUDIO && !track.isMuted()) audioMuted = false;
        });

        //name
        this.setUserName(myInfo.Name, videoElem);
        let isVisibleVideo = false;
        localTracks.forEach(track => {
            if (track.getType() === MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo, videoElem);

        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = videoMuted ? "block" : "none";
        this._getAudioMuteElementFromPanel(panel).style.display = audioMuted ? "block" : "none";
        this._getModeratorStarElementFromPanel(panel).style.display = myInfo.IsHost ? "block" : "none";

        //popup menu
        const audioMutePopupMenu = this._getPopupMenuAudioMuteFromPanel(panel);
        const videoMutePopupMenu = this._getPopupMenuVideoMuteFromPanel(panel);
        const grantModeratorPopupMenu = this._getPopupMenuGrantModeratorFromPanel(panel);

        if (myInfo.IsHost) {
            videoMutePopupMenu.style.display = myInfo.mediaPolicy.useCamera ? "flex" : "none";
            audioMutePopupMenu.style.display = myInfo.mediaPolicy.useMic ? "flex" : "none";
            grantModeratorPopupMenu.style.display = "flex";
        } else {
            videoMutePopupMenu.style.display = "none";
            audioMutePopupMenu.style.display = "none";
            grantModeratorPopupMenu.style.display = "none";
        }

        grantModeratorPopupMenu.style.display = "none";

        //popup menu audio icon/label change
        if (audioMutePopupMenu.style.display === 'flex') {
            if (audioMuted) {
                $(audioMutePopupMenu).find(".label").html("Unmute Audio");
                $(audioMutePopupMenu).find("path").attr("d", VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(audioMutePopupMenu).find(".label").html("Mute Audio");
                $(audioMutePopupMenu).find("path").attr("d", VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }

        if (videoMutePopupMenu.style.display === 'flex') {
            if (videoMuted) {
                $(videoMutePopupMenu).find(".label").html("Unmute Video");
                $(videoMutePopupMenu).find("path").attr("d", VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(videoMutePopupMenu).find(".label").html("Mute Video");
                $(videoMutePopupMenu).find("path").attr("d", VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }

        //popup menu handlers
        if (myInfo.IsHost) {
            $(audioMutePopupMenu).unbind('click').on('click', () => {
                this.meeting.muteMyAudio(!audioMuted);
            });
            $(videoMutePopupMenu).unbind('click').on('click', () => {
                this.meeting.muteMyVideo(!videoMuted);
            });
        }

        //hide private-chat item
        $(panel).find(`.${this.privateChatClass}`).hide();

        //active speaker(blue border)
        $(panel).addClass(this.activeSpeakerClass);
    }

    public setShotnameVisible(show: boolean, videoElem: HTMLMediaElement) {
        const panel = this._getPanelFromVideoElement(videoElem);
        const shortNamePanel = this._getShortNameElementFromPanel(panel);
        shortNamePanel.style.display = show ? "block" : "none";
        videoElem.style.visibility = show ? "hidden" : "visible";
    }

    public setUserName(name: string, videoElem: HTMLMediaElement) {
        //name
        const panel = this._getPanelFromVideoElement(videoElem);
        this._getNameElementFromPanel(panel).innerHTML = name;

        //shortname
        const shortNamePanel = this._getShortNameElementFromPanel(panel);
        $("text", shortNamePanel).html(avatarName(name));
    }

    public updateToolbar(myInfo: UserInfo, localTracks: JitsiTrack[]) {
        let audioMuted = false, videoMuted = false;
        let hasAudioTrack = false, hasVideoTrack = false;

        localTracks.forEach(track => {
            if (track.getType() === MediaType.VIDEO) {
                hasVideoTrack = true;
                if (track.isMuted()) videoMuted = true;
            }
            else if (track.getType() === MediaType.AUDIO) {
                hasAudioTrack = true;
                if (track.isMuted()) audioMuted = true;
            }
        });

        this.toolbarVideoButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        this.toolbarDesktopShareButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        this.toolbarAudioButtonElement.style.display = hasAudioTrack ? "inline-block" : "none";

        if (audioMuted) {
            $(this.toolbarAudioButtonElement).find("path").attr("d", VectorIcon.AUDIO_MUTE_ICON);
            $(this.toolbarAudioButtonElement).addClass("muted");
        } else {
            $(this.toolbarAudioButtonElement).find("path").attr("d", VectorIcon.AUDIO_UNMUTE_ICON);
            $(this.toolbarAudioButtonElement).removeClass("muted");
        }

        if (videoMuted) {
            $(this.toolbarVideoButtonElement).find("path").attr("d", VectorIcon.VIDEO_MUTE_ICON);
            $(this.toolbarVideoButtonElement).addClass("muted");
        } else {
            $(this.toolbarVideoButtonElement).find("path").attr("d", VectorIcon.VIDEO_UNMUTE_ICON);
            $(this.toolbarVideoButtonElement).removeClass("muted");
        }
    }

    public setScreenShare(on: boolean) {
        if (on) {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).addClass("toggled");
        }
        else {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).removeClass("toggled");
        }
    }

    public setRecording(on: boolean) {
        if (on) {
            $(".toolbox-icon", this.toolbarRecordButtonElement).addClass("toggled");
        }
        else {
            $(".toolbox-icon", this.toolbarRecordButtonElement).removeClass("toggled");
        }
    }

    public showModeratorIcon(panel: HTMLElement, show: boolean) {
        this._getModeratorStarElementFromPanel(panel).style.display = show ? "block" : "none";
    }

    private setPanelState(panel: HTMLElement, state: PanelVideoState): void {
        panel.setAttribute("video-state", `${state}`);
    }

    private getPanelState(panel: HTMLElement): PanelVideoState {
        const videoState = panel.getAttribute("video-state");
        return videoState as PanelVideoState;
    }

    private refreshCardViews() {
        //margin
        const gutter = 40;

        let width = $("#content").width() - gutter;
        let height = $("#content").height() - gutter;

        //number of video panels
        const panelCount = $(`.${this.panelClass}`).length;

        //chatting dialog
        const chattingWidth = 315;
        if ($("#video-panel").hasClass("shift-right")) {
            width -= chattingWidth;
        }

        //width, height of each video panel
        let w: number, h: number;

        //if fullscreen mode, hide other video panels
        if ($(`.${this.panelClass}`).hasClass(this.fullscreenClass)) {
            $(`.${this.panelClass}`).css("display", "none");
            $("." + this.fullscreenClass).css("display", "inline-block").css("height", height + gutter - 6).css("width", width + gutter);
            return;
        }

        //show all video panels
        $(`.${this.panelClass}`).css("display", "inline-block");

        let columnCount = 1;
        let rowCount = 1;

        const SM = 576;
        const MD = 768;
        const LG = 992;
        const XL = 1200;
        const XXL = 1400;

        if (width < SM) {
            columnCount = 1;
        } else if (width < LG) {
            if (panelCount <= 1) columnCount = 1;
            else columnCount = 2;
        } else {
            if (panelCount == 1) {
                if (width < XXL)
                    columnCount = 1;
                else
                    columnCount = 2;
            }
            else if (panelCount <= 4) columnCount = 2;
            else if (panelCount <= 9) columnCount = 3;
            else columnCount = 4;
        }

        rowCount = Math.floor((panelCount - 1) / columnCount) + 1;
        if (width < 576) {
            w = width;
            h = w * 9 / 16;
        }
        else {
            // 
            if (width * rowCount * 9 > height * columnCount * 16) {
                h = height / rowCount;
                w = h * 16 / 9;
            }
            //
            else {
                w = width / columnCount;
                h = w * 9 / 16;
            }
        }

        $(`.${this.panelClass}`)
            .css("width", w)
            .css("height", h)
            .find(".avatar-container")
            .css("width", h / 2)
            .css("height", h / 2);

    }

    private addNewPanel(): HTMLElement {
        var count = $(`.${this.panelClass}`).length;
        if (count >= this.MAX_PANELS) return;

        var isSpeak = false;
        var isDisableCamera = true;

        var activeSpeaker = '';
        if (isSpeak) {
            activeSpeaker = "active-speaker";
        }

        var avatarVisible = '';
        var cameraStatus = '';

        ++this.nPanelInstanceId;

        const videoTag = `<video autoplay playsinline  class='${this.videoElementClass}' id='remoteVideo_${this.nPanelInstanceId}'></video>`;
        const audioTag = `<audio autoplay="" id="remoteAudio_${this.nPanelInstanceId}"></audio>`;

        if (isDisableCamera) {
            avatarVisible = 'visible';
            cameraStatus = '<div class="indicator-container videoMuted"> \
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

        }

        const micStatus = '<div class="indicator-container audioMuted"> \
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

        const moderatorStatus = '<div class="moderator-icon right"> \
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

        const panelHtml = `
        <span class="${this.panelClass} display-video ${activeSpeaker}">
            ${videoTag} 
            ${audioTag}
            <div class="videocontainer__toolbar">
                <div> ${cameraStatus} ${micStatus} ${moderatorStatus}</div>
            </div>
            <div class="videocontainer__hoverOverlay"></div>
            <div class="displayNameContainer"><span class="displayname" id="localDisplayName">Name</span></div>
            <div class="avatar-container ${avatarVisible}" style="height: 105.5px; width: 105.5px;">
                <div class="avatar  userAvatar" style="background-color: rgba(234, 255, 128, 0.4); font-size: 180%; height: 100%; width: 100%;">
                    <svg class="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <text dominant-baseline="central" fill="rgba(255,255,255,.6)" font-size="40pt" text-anchor="middle" x="50" y="50">Name</text>
                    </svg>
                </div>
            </div >
            <span class="${this.popupMenuButtonClass}">
                <div class="" id="">
                    <span class="popover-trigger remote-video-menu-trigger">
                        <div class="jitsi-icon">
                            <svg height="1em" width="1em" viewBox="0 0 24 24">
                                <path d="M12 15.984c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 19.078 9.984 18s.938-2.016 2.016-2.016zm0-6c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 13.078 9.984 12 10.922 9.984 12 9.984zm0-1.968c-1.078 0-2.016-.938-2.016-2.016S10.922 3.984 12 3.984s2.016.938 2.016 2.016S13.078 8.016 12 8.016z"></path> \
                            </svg>
                        </div>
                    </span>
                </div>
                <div class="${this.popupMenuClass}" tabIndex=-1 style="position: relative; right: 168px;  top: 25px; width: 175px;">
                    <ul aria-label="More actions menu" class="overflow-menu">
                        <li aria-label="Grant Moderator" class="overflow-menu-item grant-moderator" tabindex="0" role="button">
                            <span class="overflow-menu-item-icon">
                                <div class="jitsi-icon ">
                                    <svg height="22" width="22" viewBox="0 0 24 24">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M14 4a2 2 0 01-1.298 1.873l1.527 4.07.716 1.912c.062.074.126.074.165.035l1.444-1.444 2.032-2.032a2 2 0 111.248.579L19 19a2 2 0 01-2 2H7a2 2 0 01-2-2L4.166 8.993a2 2 0 111.248-.579l2.033 2.033L8.89 11.89c.087.042.145.016.165-.035l.716-1.912 1.527-4.07A2 2 0 1114 4zM6.84 17l-.393-4.725 1.029 1.03a2.1 2.1 0 003.451-.748L12 9.696l1.073 2.86a2.1 2.1 0 003.451.748l1.03-1.03L17.16 17H6.84z"></path> \
                                    </svg>
                                </div>
                            </span>
                            <span class="label">Grant Moderator</span>
                        </li>
                        <li aria-label="Mute" class="overflow-menu-item audio-mute" tabindex="0" role="button">
                            <span class="overflow-menu-item-icon">
                                <div class="jitsi-icon ">
                                    <svg fill="none" height="22" width="22" viewBox="0 0 22 22">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z"></path> \
                                    </svg>
                                </div>
                            </span>
                            <span class="label">Mute</span>
                        </li>
                        <li aria-label="Disable camera" class="overflow-menu-item video-mute" tabindex="0" role="button">
                            <span class="overflow-menu-item-icon">
                                <div class="jitsi-icon">
                                    <svg fill="none" height="22" width="22" viewBox="0 0 22 22">
                                        <path clip-rule="evenodd" d="M6.84 5.5h-.022L3.424 2.106a.932.932 0 10-1.318 1.318L4.182 5.5h-.515c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c.404 0 .777-.13 1.08-.352l3.746 3.746a.932.932 0 101.318-1.318l-4.31-4.31v-.024L13.75 12.41v.023l-5.1-5.099h.024L6.841 5.5zm6.91 4.274V7.333h-2.44L9.475 5.5h4.274c1.012 0 1.833.82 1.833 1.833v.786l3.212-1.835a.917.917 0 011.372.796v7.84c0 .344-.19.644-.47.8l-3.736-3.735 2.372 1.356V8.659l-2.75 1.571v1.377L13.75 9.774zM3.667 7.334h2.349l7.333 7.333H3.667V7.333z"></path> \
                                    </svg>
                                </div>
                            </span>
                            <span class="label">Disable camera</span>
                        </li>
                        <li aria-label="Toggle full screen" class="overflow-menu-item fullscreen">
                            <span class="overflow-menu-item-icon">
                                <div class="jitsi-icon ">
                                    <svg fill="none" height="22" width="22" viewBox="0 0 22 22">
                                        <path clip-rule="evenodd" d="M8.25 2.75H3.667a.917.917 0 00-.917.917V8.25h1.833V4.583H8.25V2.75zm5.5 1.833V2.75h4.583c.507 0 .917.41.917.917V8.25h-1.833V4.583H13.75zm0 12.834h3.667V13.75h1.833v4.583c0 .507-.41.917-.917.917H13.75v-1.833zM4.583 13.75v3.667H8.25v1.833H3.667a.917.917 0 01-.917-.917V13.75h1.833z"></path> \
                                    </svg>
                                </div>
                            </span>
                            <span class="label overflow-menu-item-text">View full screen</span>
                        </li>
                        <li aria-label="Private Chat" class="overflow-menu-item private-chat">
                            <span class="overflow-menu-item-icon">
                                <div class="jitsi-icon ">
                                    <svg fill="none" height="22" width="22" viewBox="0 0 22 22">
                                        <path clip-rule="evenodd" d="M19,8H18V5a3,3,0,0,0-3-3H5A3,3,0,0,0,2,5V17a1,1,0,0,0,.62.92A.84.84,0,0,0,3,18a1,1,0,0,0,.71-.29l2.81-2.82H8v1.44a3,3,0,0,0,3,3h6.92l2.37,2.38A1,1,0,0,0,21,22a.84.84,0,0,0,.38-.08A1,1,0,0,0,22,21V11A3,3,0,0,0,19,8ZM8,11v1.89H6.11a1,1,0,0,0-.71.29L4,14.59V5A1,1,0,0,1,5,4H15a1,1,0,0,1,1,1V8H11A3,3,0,0,0,8,11Zm12,7.59-1-1a1,1,0,0,0-.71-.3H11a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z"></path> \
                                    </svg>
                                </div>
                            </span>
                            <span class="label overflow-menu-item-text">Private chat</span>
                        </li>
                    </ul>
                </div>
            </span>
        </span >`;

        const panel = $(panelHtml);
        $(`#${this.panelContainerId}`).append(panel[0]);
        this.refreshCardViews();

        return panel[0];
    }

    public updateTime(timeLabel: string) {
        this.timestampElement.innerHTML = timeLabel;
        if (!this.initTopInfo) {
            this.initTopInfo = true;
            $(this.topInfobarElement).addClass("visible");
        }
    }

    public showMeetingSubject(subject: string, hostName: string) {
        if (subject && subject.trim().length > 0) {
            let subjectLabel = subject.trim();
            if (hostName && hostName.trim().length > 0)
                subjectLabel += `(${hostName.trim()})`;
            this.subjectElement.innerHTML = subjectLabel;
        }
    }

    private showSettingDialog() {
        const settingDialog = new SettingDialog();

        const props = new SettingDialogProps();
        props.curDevices = this.meeting.getActiveDevices();
        props.onDeviceChange = this.meeting.onDeviceChange.bind(this.meeting);

        settingDialog.init(props);
        settingDialog.show();
    }

    //add, remove participant to and from list
    public addParticipant(jitsiId: string, name: string, me: boolean, useCamera: boolean, useMic: boolean) {
        this.participantsListPanel.addParticipant(jitsiId, name, me, useCamera, useMic);
    }

    public removeParticipant(jitsiId: string) {
        this.participantsListPanel.removeParticipant(jitsiId);
    }

    public showParticipantListButton(show: boolean) {
        $("#open-participants-toggle").css("visibility", show ? "visible" : "hidden");
    }

    //file send
    onFileSendError(filename: string, message: string) {
        this.notification_warning(filename, message, NotificationType.FileTransfer);
    }

    onFileSendFinished(filename: string, message: string) {
        this.notification(filename, message, NotificationType.FileTransfer);
    }

    //file receive
    onFileReceiveError(filename: string, message: string) {
        this.notification_warning(filename, message, NotificationType.FileReceive);
    }

    onFileReceiveFinished(filename: string, message: string) {
        this.notification(filename, message, NotificationType.FileReceive);
    }


    public Log(message: string) {
        if ($("#logPanel").length <= 0) {
            const logPanel = `<div id="logPanel" style="position: fixed;width: 300px;height: 100px;background: black;top:0px;left: 0px;
                                z-index: 100000;border-right: 1px dashed rebeccapurple;border-bottom: 1px dashed rebeccapurple;overflow-y:auto;"></div>`;
            $("body").append(logPanel);
        }
        const colors = ['blanchedalmond', 'hotpink', 'chartreuse', 'coral', 'gold', 'greenyellow', 'violet', 'wheat'];
        const color = colors[Math.floor(Math.random() * 100) % colors.length];
        const messageItm = `<div style="color:${color};"><span>${message}</span></div>`;
        $("#logPanel").append(messageItm);

        $('#logPanel').scroll();
        $("#logPanel").animate({
            scrollTop: 20000
        }, 200);
    }

    public askDialog(title: string, message: string, icon: NotificationType,
        allowCallback: Function, denyCallback: Function, param: any) {
        const props = new AskDialogProps();
        props.title = title;
        props.message = message;
        props.icon = icon;
        props.isWarning = true;
        props.allowCallback = allowCallback;
        props.denyCallback = denyCallback;
        props.param = param;
        const dlg = new AskDialog(props);
        dlg.show();
    }

    public notification(title: string, message: string, icon: NotificationType) {
        if (!icon)
            icon = NotificationType.Info;
        $.toast({
            heading: title,
            text: message,
            showHideTransition: 'slide',
            hideAfter: false,//7000
            bgColor: "#164157",
            icon: icon,
            stack: 5,
            loader: false,
        });
    }

    public notification_warning(title: string, message: string, icon: NotificationType) {
        if (!icon)
            icon = NotificationType.Warning;
        $.toast({
            heading: title,
            text: message,
            showHideTransition: 'slide',
            hideAfter: 7000,
            bgColor: "#800000",
            icon: icon,
            stack: 5,
            loader: false
        });
    }
}

