"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingUI = void 0;
var SettingDialog_1 = require("./components/SettingDialog");
var ChattingPanel_1 = require("./components/ChattingPanel");
var ParticipantListPanel_1 = require("./components/ParticipantListPanel");
var NotificationType_1 = require("./enum/NotificationType");
var AskDialog_1 = require("./components/AskDialog");
var ToolBar_1 = require("./components/ToolBar");
var MeetingDescriptionWidget_1 = require("./components/MeetingDescriptionWidget");
var VideoPanelGrid_1 = require("./components/VideoPanelGrid");
var PanelVideoState;
(function (PanelVideoState) {
    PanelVideoState["NoCamera"] = "no-camera";
    PanelVideoState["ScreenShare"] = "screen";
    PanelVideoState["Camera"] = "camera";
    PanelVideoState["VideoStreaming"] = "stream";
})(PanelVideoState || (PanelVideoState = {}));
var MeetingUI = /** @class */ (function () {
    function MeetingUI(meeting) {
        this.meeting = null;
        this.options = {
            hideToolbarOnMouseOut: false,
        };
        this.meeting = meeting;
        //toolbar
        var tProps = new ToolBar_1.ToolBarProps();
        tProps.toggleVideoMute = this.meeting.OnToggleMuteMyVideo.bind(this.meeting);
        tProps.toggleAudioMute = this.meeting.OnToggleMuteMyAudio.bind(this.meeting);
        tProps.openChatting = this.openChatting.bind(this);
        tProps.toggleScreenShare = this.meeting.toggleScreenShare.bind(this.meeting);
        tProps.toggleRecording = this.meeting.toggleRecording.bind(this.meeting);
        tProps.openSetting = this.showSettingDialog.bind(this);
        tProps.leaveMeeting = this.meeting.stop.bind(this.meeting);
        this.toolbar = new ToolBar_1.ToolBar(tProps);
        //chatting
        this.chattingWidget = new ChattingPanel_1.ChattingWidget();
        var props = new ChattingPanel_1.ChattingPanelProps();
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
        this.participantsListWidget = new ParticipantListPanel_1.ParticipantListWidget();
        var lProps = new ParticipantListPanel_1.ParticipantListPanelProps();
        lProps.onUseCamera = this.meeting.allowCamera.bind(this.meeting);
        lProps.onUseMic = this.meeting.allowMic.bind(this.meeting);
        this.participantsListWidget.init(lProps);
        //meeting description
        this.meetingDescWidget = new MeetingDescriptionWidget_1.MeetingDescriptionWidget();
        //video grid
        var vProps = new VideoPanelGrid_1.VideoPanelGridProps();
        vProps.grantModeratorRole = this.meeting.grantModeratorRole.bind(this.meeting);
        vProps.muteMyAudio = this.meeting.muteMyAudio.bind(this.meeting);
        vProps.muteMyVideo = this.meeting.muteMyVideo.bind(this.meeting);
        vProps.muteUserAudio = this.meeting.muteUserAudio.bind(this.meeting);
        vProps.muteUserVideo = this.meeting.muteUserVideo.bind(this.meeting);
        vProps.openPrivateChat = this.chattingWidget.openPrivateChat.bind(this.chattingWidget);
        this.videoPanelGrid = new VideoPanelGrid_1.VideoPanelGrid(vProps);
        this.attachHandlers();
    }
    MeetingUI.prototype.attachHandlers = function () {
        var _this = this;
        $(document).ready(function () {
            //hover effect
            if (_this.options.hideToolbarOnMouseOut) {
                $("#content").hover(function (_) {
                    _this.toolbar.fadeIn();
                    _this.meetingDescWidget.fadeIn();
                }, function (_) {
                    _this.toolbar.fadeOut();
                    _this.meetingDescWidget.fadeOut();
                });
            }
        });
        window.addEventListener('unload', function () {
            _this.meeting.forceStop();
        });
    };
    MeetingUI.prototype.updateByRole = function (isHost) {
        var isWebinar = this.meeting.roomInfo.IsWebinar;
        if (isWebinar && !isHost)
            this.showParticipantListButton(false);
        else
            this.showParticipantListButton(true);
        this.participantsListWidget.updateByRole(isHost);
    };
    //chattting
    MeetingUI.prototype.openChatting = function (o) {
        if (this.chattingWidget)
            this.chattingWidget.open(o);
    };
    MeetingUI.prototype.redrawGrid = function () {
        if (this.videoPanelGrid)
            this.videoPanelGrid.redrawGrid();
    };
    MeetingUI.prototype.showSettingDialog = function () {
        var settingDialog = new SettingDialog_1.SettingDialog();
        var props = new SettingDialog_1.SettingDialogProps();
        props.curDevices = this.meeting.getActiveDevices();
        props.onDeviceChange = this.meeting.onDeviceChange.bind(this.meeting);
        settingDialog.init(props);
        settingDialog.show();
    };
    //add, remove participant to and from list
    MeetingUI.prototype.addParticipant = function (jitsiId, name, me, useCamera, useMic) {
        this.participantsListWidget.addParticipant(jitsiId, name, me, useCamera, useMic);
    };
    MeetingUI.prototype.removeParticipant = function (jitsiId) {
        this.participantsListWidget.removeParticipant(jitsiId);
    };
    MeetingUI.prototype.showParticipantListButton = function (show) {
        $("#open-participants-toggle").css("visibility", show ? "visible" : "hidden");
    };
    //file send
    MeetingUI.prototype.onFileSendError = function (filename, message) {
        this.notification_warning(filename, message, NotificationType_1.NotificationType.FileTransfer);
    };
    MeetingUI.prototype.onFileSendFinished = function (filename, message) {
        this.notification(filename, message, NotificationType_1.NotificationType.FileTransfer);
    };
    //file receive
    MeetingUI.prototype.onFileReceiveError = function (filename, message) {
        this.notification_warning(filename, message, NotificationType_1.NotificationType.FileReceive);
    };
    MeetingUI.prototype.onFileReceiveFinished = function (filename, message) {
        this.notification(filename, message, NotificationType_1.NotificationType.FileReceive);
    };
    MeetingUI.prototype.Log = function (message) {
        return;
        if ($("#logPanel").length <= 0) {
            var logPanel = "<div id=\"logPanel\" style=\"position: fixed;width: 300px;height: 100px;background: black;top:0px;left: 0px;\n                                z-index: 100000;border-right: 1px dashed rebeccapurple;border-bottom: 1px dashed rebeccapurple;overflow-y:auto;\"></div>";
            $("body").append(logPanel);
        }
        var colors = ['blanchedalmond', 'hotpink', 'chartreuse', 'coral', 'gold', 'greenyellow', 'violet', 'wheat'];
        var color = colors[Math.floor(Math.random() * 100) % colors.length];
        var messageItm = "<div style=\"color:" + color + ";\"><span>" + message + "</span></div>";
        $("#logPanel").append(messageItm);
        $('#logPanel').scroll();
        $("#logPanel").animate({
            scrollTop: 20000
        }, 200);
    };
    MeetingUI.prototype.askDialog = function (title, message, icon, allowCallback, denyCallback, param) {
        var props = new AskDialog_1.AskDialogProps();
        props.title = title;
        props.message = message;
        props.icon = icon;
        props.isWarning = true;
        props.allowCallback = allowCallback;
        props.denyCallback = denyCallback;
        props.param = param;
        var dlg = new AskDialog_1.AskDialog(props);
        dlg.show();
    };
    MeetingUI.prototype.notification = function (title, message, icon) {
        if (!icon)
            icon = NotificationType_1.NotificationType.Info;
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
    };
    MeetingUI.prototype.notification_warning = function (title, message, icon) {
        if (!icon)
            icon = NotificationType_1.NotificationType.Warning;
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
    };
    return MeetingUI;
}());
exports.MeetingUI = MeetingUI;
//# sourceMappingURL=meeting_ui.js.map