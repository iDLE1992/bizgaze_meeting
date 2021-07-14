import { MediaType } from "../enum/MediaType";
import { JitsiTrack } from "../jitsi/JitsiTrack";
import { UserInfo } from "../model/BGUser";
import { VectorIcon } from "./vector_icon";

export class ToolBarProps {
    toggleVideoMute: () => void;
    toggleAudioMute: () => void;
    toggleScreenShare: () => void;
    toggleRecording: () => void;
    toggleHandRaise: () => void;
    openChatting: (open: boolean) => void;
    openSetting: () => void;
    leaveMeeting: () => void;
}

export class ToolBar {
    root: HTMLElement = null;

    toolbarAudioButtonElement: HTMLElement;
    toolbarVideoButtonElement: HTMLElement;
    toolbarDesktopShareButtonElement: HTMLElement;
    toolbarRecordButtonElement: HTMLElement;
    toolbarHandRaiseButtonElement: HTMLElement;
    toolbarChatButtonElement: HTMLElement;
    toolbarLeaveButtonElement: HTMLElement;
    toolbarSettingButtonElement: HTMLElement;
    chattingUnreadBadge: HTMLElement;

    props: ToolBarProps;

    constructor(props: ToolBarProps) {
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

    attachHandlers() {
        $(this.toolbarVideoButtonElement).on('click', () => {
            this.props.toggleVideoMute();
        });

        $(this.toolbarAudioButtonElement).on('click', () => {
            this.props.toggleAudioMute();
        });

        $(this.toolbarChatButtonElement).on('click', _ => {
            this.props.openChatting(true);
        });

        $(this.toolbarDesktopShareButtonElement).on("click", () => {
            this.props.toggleScreenShare();
        });

        $(this.toolbarRecordButtonElement).on('click', () => {
            this.props.toggleRecording();
        });

        $(this.toolbarHandRaiseButtonElement).on('click', () => {
            console.log("handraise clicked");
            this.props.toggleHandRaise();
        });

        $(this.toolbarSettingButtonElement).on('click', () => {
            this.props.openSetting();
        });

        $(this.toolbarLeaveButtonElement).click(() => {
            this.props.leaveMeeting();
        });
    }


    public update(userInfo: UserInfo, localTracks: JitsiTrack[]) {
        let audioMuted = true, videoMuted = true;
        let hasAudioTrack = false, hasVideoTrack = false;

        localTracks.forEach(track => {
            if (track.getType() === MediaType.VIDEO) {
                hasVideoTrack = true;
                if (track.isMuted()) videoMuted = true;
                else videoMuted = false;
            }
            else if (track.getType() === MediaType.AUDIO) {
                hasAudioTrack = true;
                if (track.isMuted()) audioMuted = true;
                else audioMuted = false;
            }
        });

        //this.toolbarVideoButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        //this.toolbarDesktopShareButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        //this.toolbarAudioButtonElement.style.display = hasAudioTrack ? "inline-block" : "none";

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
            $(this.toolbarRecordButtonElement).addClass("live");
        }
        else {
            $(this.toolbarRecordButtonElement).removeClass("live");
        }
    }

    fadeIn() {
        $(this.root).addClass("visible");
    }

    fadeOut() {
        $(this.root).removeClass("visible");
    }


    showUnreadBadge(show: boolean) {
        this.chattingUnreadBadge.style.display = !!show ? "flex" : "none";
    }

    setUnreadCount(count: number) {
        this.chattingUnreadBadge.innerHTML = `${count}`;
    }

    updateByRole(isHost: boolean) {
        this.toolbarHandRaiseButtonElement.style.display = isHost ? "none" : "inline-block";
    }
}