
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
import { ChattingWidget, ChattingPanelProps } from "./components/ChattingPanel";
import { ParticipantListWidget, ParticipantListPanelProps } from "./components/ParticipantListPanel";
import { NotificationType } from "./enum/NotificationType";
import { avatarName } from "./util/snippet";
import { AskDialog, AskDialogProps } from "./components/AskDialog";
import { ToolBar, ToolBarProps } from "./components/ToolBar";
import { MeetingDescriptionWidget } from "./components/MeetingDescriptionWidget";
import { VideoPanelGrid, VideoPanelGridProps } from "./components/VideoPanelGrid";

declare global {
    interface Window { _roomId: number; meetingController: any }
    interface JQueryStatic { toast: Function; }
}

enum PanelVideoState { NoCamera = "no-camera", ScreenShare = "screen", Camera = "camera", VideoStreaming = "stream" }

export class MeetingUI {
    meeting: BizGazeMeeting = null;

    options: any = {
        hideToolbarOnMouseOut: false,
    };

    toolbar: ToolBar;
    chattingWidget: ChattingWidget;
    participantsListWidget: ParticipantListWidget;
    meetingDescWidget: MeetingDescriptionWidget;
    videoPanelGrid: VideoPanelGrid;
    

    constructor(meeting: BizGazeMeeting) {
        this.meeting = meeting;

        //toolbar
        const tProps = new ToolBarProps();
        tProps.toggleVideoMute = this.meeting.OnToggleMuteMyVideo.bind(this.meeting);
        tProps.toggleAudioMute = this.meeting.OnToggleMuteMyAudio.bind(this.meeting);
        tProps.openChatting = this.openChatting.bind(this);
        tProps.toggleScreenShare = this.meeting.toggleScreenShare.bind(this.meeting);
        tProps.toggleRecording = this.meeting.toggleRecording.bind(this.meeting);
        tProps.openSetting = this.showSettingDialog.bind(this);
        tProps.leaveMeeting = this.meeting.stop.bind(this.meeting);
        this.toolbar = new ToolBar(tProps);

        //chatting
        this.chattingWidget = new ChattingWidget();
        const props = new ChattingPanelProps();
        props.openCallback = this.redrawGrid.bind(this);
        props.sendChat = this.meeting.sendChatMessage.bind(this.meeting);
        props.sendPrivateChat = this.meeting.sendPrivateChatMessage.bind(this.meeting);
        props.sendFileMeta = this.meeting.sendFileMeta.bind(this.meeting);
        props.sendFileData = this.meeting.sendFileData.bind(this.meeting);
        props.onFileSendErrror = this.onFileSendError.bind(this);
        props.onFileSendFinished = this.onFileSendFinished.bind(this);
        props.onFileReceiveError = this.onFileReceiveError.bind(this);
        props.onFileReceiveFinished = this.onFileReceiveFinished.bind(this);
        props.showUnreadBadge = this.toolbar.showUnreadBadge.bind(this.toolbar);
        props.setUnreadCount = this.toolbar.setUnreadCount.bind(this.toolbar);
        this.chattingWidget.init(props);

        //list
        this.participantsListWidget = new ParticipantListWidget();
        const lProps = new ParticipantListPanelProps();
        lProps.onUseCamera = this.meeting.allowCamera.bind(this.meeting);
        lProps.onUseMic = this.meeting.allowMic.bind(this.meeting);
        this.participantsListWidget.init(lProps);

        //meeting description
        this.meetingDescWidget = new MeetingDescriptionWidget();

        //video grid
        const vProps = new VideoPanelGridProps();
        vProps.grantModeratorRole = this.meeting.grantModeratorRole.bind(this.meeting);
        vProps.muteMyAudio = this.meeting.muteMyAudio.bind(this.meeting);
        vProps.muteMyVideo = this.meeting.muteMyVideo.bind(this.meeting);
        vProps.muteUserAudio = this.meeting.muteUserAudio.bind(this.meeting);
        vProps.muteUserVideo = this.meeting.muteUserVideo.bind(this.meeting);
        vProps.openPrivateChat = this.chattingWidget.openPrivateChat.bind(this.chattingWidget);
        this.videoPanelGrid = new VideoPanelGrid(vProps);

        this.attachHandlers();
    }

    private attachHandlers() {
        $(document).ready(() => {
            //hover effect
            if (this.options.hideToolbarOnMouseOut) {
                $("#content").hover(
                    _ => {
                        this.toolbar.fadeIn();
                        this.meetingDescWidget.fadeIn();
                    },
                    _ => {
                        this.toolbar.fadeOut();
                        this.meetingDescWidget.fadeOut();
                    }
                );
            }
        });
        window.addEventListener('unload', () => {
            this.meeting.forceStop();
        });
    }

    updateByRole(isHost: boolean) {
        const isWebinar = this.meeting.roomInfo.IsWebinar;
        if (isWebinar && !isHost)
            this.showParticipantListButton(false);
        else
            this.showParticipantListButton(true);

        this.participantsListWidget.updateByRole(isHost);
    }

    //chattting
    openChatting(o: boolean) {
        if (this.chattingWidget)
            this.chattingWidget.open(o);
    }
    redrawGrid() {
        if (this.videoPanelGrid)
            this.videoPanelGrid.redrawGrid();
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
        this.participantsListWidget.addParticipant(jitsiId, name, me, useCamera, useMic);
    }

    public removeParticipant(jitsiId: string) {
        this.participantsListWidget.removeParticipant(jitsiId);
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
        return;
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
            hideAfter: 7000,
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

