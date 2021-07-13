"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChattingWidget = exports.ChattingPanelProps = void 0;
var FileReceiver_1 = require("../file/FileReceiver");
var FileSender_1 = require("../file/FileSender");
var random_1 = require("../util/random");
var snippet_1 = require("../util/snippet");
var TimeUtil_1 = require("../util/TimeUtil");
var ChattingPanelProps = /** @class */ (function () {
    function ChattingPanelProps() {
    }
    return ChattingPanelProps;
}());
exports.ChattingPanelProps = ChattingPanelProps;
var ChattingWidget = /** @class */ (function () {
    function ChattingWidget() {
        this.unreadCount = 0;
        this.isPrivate = false;
        this.nameColors = [];
        this.remainColors = [];
        this.fileSendingPool = new Map();
        this.fileReceivingPool = new Map();
    }
    ChattingWidget.prototype.init = function (props) {
        this.props = props;
        this.root = document.getElementById("sideToolbarContainer");
        this.closeButton = document.querySelector(".chat-close-button");
        this.inputField = document.querySelector("#chat-input #usermsg");
        this.sendButton = document.querySelector(".send-button");
        this.filesendButton = document.querySelector(".file-share-button");
        this.fileElement = document.getElementById("file-selector");
        this.fileSendingPanel = document.getElementById("file-sending");
        this.privatePanel = document.querySelector("#chat-recipient");
        this.privateLabelElement = $(this.privatePanel).find(">span")[0];
        this.privateCloseElement = $(this.privatePanel).find(">div")[0];
        this.nameColors.push("#00bfff"); //deepskyblue
        this.nameColors.push("#9acd32"); //yellowgreen
        this.nameColors.push("#d2691e"); //chocolate
        this.nameColors.push("#ee82ee"); //violet
        this.nameColors.push("#6495ed"); //cornflowerblue
        this.nameColors.push("#ffd700"); //gold
        this.nameColors.push("#808000"); //olive
        this.nameColors.push("#cd853f"); //peru
        this.remainColors = __spreadArray([], this.nameColors);
        this.nameColorMap = new Map();
        this.attachEventHandlers();
        this.open(this.opened);
    };
    ChattingWidget.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        $(this.closeButton).on('click', function () {
            _this_1.open(false);
        });
        $(this.inputField).keypress(function (e) {
            if ((e.keyCode || e.which) == 13) { //Enter keycode
                if (!e.shiftKey) {
                    e.preventDefault();
                    _this_1.onSend();
                }
            }
        });
        $(this.sendButton).on('click', function () {
            _this_1.onSend();
        });
        var _this = this;
        $(".smileyContainer").click(function () {
            var id = $(this).attr("id");
            var imoname = _this.idToEmoname(id);
            console.log(imoname);
            var sendel = $("#usermsg");
            var sms = sendel.val();
            sms += imoname;
            sendel.val(sms);
            //var el = $(".smileys-panel");
            //el.removeClass("show-smileys");
            //el.addClass("hide-smileys");
            sendel.focus();
        });
        $("#smileys").click(function () {
            var el = $(".smileys-panel");
            if (el.hasClass("hide-smileys")) {
                el.removeClass("hide-smileys");
                el.addClass("show-smileys");
            }
            else {
                el.removeClass("show-smileys");
                el.addClass("hide-smileys");
            }
        });
        $(this.privateCloseElement).click(function (_) {
            _this_1.clearPrivateState();
        });
        $(this.filesendButton).click(function (_) {
            $(_this_1.fileElement).click();
        });
        $(this.fileElement).on("change", function (_) {
            _this_1.sendFile();
        });
    };
    ChattingWidget.prototype.open = function (opened) {
        if (opened) {
            $("#video-panel").addClass("shift-right");
            $("#new-toolbox").addClass("shift-right");
            $(this.root).removeClass("invisible");
            $(this.inputField).focus();
            //$(".toolbox-icon", this.props.chatOpenButton).addClass("toggled");
        }
        else {
            $("#video-panel").removeClass("shift-right");
            $("#new-toolbox").removeClass("shift-right");
            $(this.root).addClass("invisible");
            //$(".toolbox-icon", this.props.chatOpenButton).removeClass("toggled");
        }
        this.unreadCount = 0;
        this.props.showUnreadBadge(false);
        this.opened = opened;
        this.props.openCallback();
    };
    ChattingWidget.prototype.clearInput = function () {
        $(this.inputField).val('');
    };
    ChattingWidget.prototype.toggleOpen = function () {
        this.opened = !this.opened;
        this.open(this.opened);
    };
    ChattingWidget.prototype.onSend = function () {
        var msg = $(this.inputField).val().toString().trim();
        this.clearInput();
        if (!msg)
            return;
        msg = this.emonameToEmoicon(msg);
        var time = TimeUtil_1.getCurTime();
        var privateClass = this.isPrivate ? "private" : "";
        var privateDetail = "";
        if (this.isPrivate) {
            privateDetail = "<div style=\"color:#778899\">private: " + this.privateSenderName + "</div>";
        }
        var el = $(".smileys-panel");
        el.removeClass("show-smileys");
        el.addClass("hide-smileys");
        var sel = $("#chatconversation div.chat-message-group:last-child");
        if (sel.hasClass("local")) {
            sel.find(".timestamp").remove();
            sel.append("<div class= \"chatmessage-wrapper\" >                            <div class=\"chatmessage " + privateClass + "\">                                <div class=\"replywrapper\">                                    <div class=\"messagecontent\">                                        <div class=\"usermessage\"> " + msg + " </div>                                        " + privateDetail + "\n                                    </div>                                </div>                            </div>                            <div class=\"timestamp\"> " + time + " </div>                        </div >");
        }
        else {
            $("#chatconversation").append("<div class=\"chat-message-group local\">                     <div class= \"chatmessage-wrapper\" >                        <div class=\"chatmessage " + privateClass + "\">                            <div class=\"replywrapper\">                                <div class=\"messagecontent\">                                    <div class=\"usermessage\"> " + msg + " </div>                                    " + privateDetail + "\n                                </div>                            </div>                        </div>                        <div class=\"timestamp\"> " + time + " </div>                    </div >                </div>");
        }
        this.scrollToBottom();
        if (this.isPrivate) {
            this.props.sendPrivateChat(this.privateSenderId, msg);
        }
        else {
            this.props.sendChat(msg);
        }
    };
    //chat
    ChattingWidget.prototype.receiveMessage = function (id, username, message, isPrivate) {
        if (isPrivate === void 0) { isPrivate = false; }
        //update unread count
        if (!this.opened) {
            this.unreadCount++;
            this.props.setUnreadCount(this.unreadCount);
            this.props.showUnreadBadge(true);
        }
        //update ui
        var emoMessage = this.emonameToEmoicon(message);
        var nameColor = this.getNameColor(username);
        var privateClass = isPrivate ? "private" : "";
        var replyElem = "";
        if (isPrivate) {
            replyElem = "\n                <span class=\"jitsi-icon\" jitsi-id=\"" + id + "\" jitsi-name=\"" + username + "\">\n                    <svg height=\"22\" width=\"22\" viewBox=\"0 0 36 36\">\n                        <path d=\"M30,29a1,1,0,0,1-.81-.41l-2.12-2.92A18.66,18.66,0,0,0,15,18.25V22a1,1,0,0,1-1.6.8l-12-9a1,1,0,0,1,0-1.6l12-9A1,1,0,0,1,15,4V8.24A19,19,0,0,1,31,27v1a1,1,0,0,1-.69.95A1.12,1.12,0,0,1,30,29ZM14,16.11h.1A20.68,20.68,0,0,1,28.69,24.5l.16.21a17,17,0,0,0-15-14.6,1,1,0,0,1-.89-1V6L3.67,13,13,20V17.11a1,1,0,0,1,.33-.74A1,1,0,0,1,14,16.11Z\"></path>\n                    </svg>\n                </span>";
        }
        var $chatitem = $("<div class=\"chat-message-group remote\">         <div class= \"chatmessage-wrapper\" >                <div class=\"chatmessage " + privateClass + "\">                    <div class=\"replywrapper\">                        <div class=\"messagecontent\">                            <div class=\"display-name\" style=\"color:" + nameColor + "\">" + username + replyElem + '</div>\
                            <div class="usermessage">' + emoMessage + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">' + TimeUtil_1.getCurTime() + '</div>\
            </div >\
        </div>');
        $("#chatconversation").append($chatitem);
        if (isPrivate) {
            var _this_2 = this;
            $chatitem.find(".jitsi-icon").click(function (e) {
                var id = $(this).attr("jitsi-id");
                var name = $(this).attr("jitsi-name");
                _this_2.setPrivateState(id, name);
            });
        }
        this.scrollToBottom();
        if (isPrivate)
            this.setPrivateState(id, username);
    };
    ChattingWidget.prototype.scrollToBottom = function () {
        var overheight = 0;
        $(".chat-message-group").each(function () {
            overheight += $(this).height();
        });
        var limit = $('#chatconversation').height();
        var pos = overheight - limit;
        $("#chatconversation").animate({ scrollTop: pos }, 200);
    };
    ChattingWidget.prototype.idToEmoname = function (id) {
        if (id == 'smiley1')
            return ':)';
        if (id == 'smiley2')
            return ':(';
        if (id == 'smiley3')
            return ':D';
        if (id == 'smiley4')
            return ':+1:';
        if (id == 'smiley5')
            return ':P';
        if (id == 'smiley6')
            return ':wave:';
        if (id == 'smiley7')
            return ':blush:';
        if (id == 'smiley8')
            return ':slightly_smiling_face:';
        if (id == 'smiley9')
            return ':scream:';
        if (id == 'smiley10')
            return ':*';
        if (id == 'smiley11')
            return ':-1:';
        if (id == 'smiley12')
            return ':mag:';
        if (id == 'smiley13')
            return ':heart:';
        if (id == 'smiley14')
            return ':innocent:';
        if (id == 'smiley15')
            return ':angry:';
        if (id == 'smiley16')
            return ':angel:';
        if (id == 'smiley17')
            return ';(';
        if (id == 'smiley18')
            return ':clap:';
        if (id == 'smiley19')
            return ';)';
        if (id == 'smiley20')
            return ':beer:';
    };
    ChattingWidget.prototype.emonameToEmoicon = function (sms) {
        var smsout = sms;
        smsout = smsout.replace(':)', '<span class="smiley" style="width: 20px; height:20px;">😃</span>');
        smsout = smsout.replace(':(', '<span class="smiley">😦</span>');
        smsout = smsout.replace(':D', '<span class="smiley">😄</span>');
        smsout = smsout.replace(':+1:', '<span class="smiley">👍</span>');
        smsout = smsout.replace(':P', '<span class="smiley">😛</span>');
        smsout = smsout.replace(':wave:', '<span class="smiley">👋</span>');
        smsout = smsout.replace(':blush:', '<span class="smiley">😊</span>');
        smsout = smsout.replace(':slightly_smiling_face:', '<span class="smiley">🙂</span>');
        smsout = smsout.replace(':scream:', '<span class="smiley">😱</span>');
        smsout = smsout.replace(':*', '<span class="smiley">😗</span>');
        smsout = smsout.replace(':-1:', '<span class="smiley">👎</span>');
        smsout = smsout.replace(':mag:', '<span class="smiley">🔍</span>');
        smsout = smsout.replace(':heart:', '<span class="smiley">❤️</span>');
        smsout = smsout.replace(':innocent:', '<span class="smiley">😇</span>');
        smsout = smsout.replace(':angry:', '<span class="smiley">😠</span>');
        smsout = smsout.replace(':angel:', '<span class="smiley">👼</span>');
        smsout = smsout.replace(';(', '<span class="smiley">😭</span>');
        smsout = smsout.replace(':clap:', '<span class="smiley">👏</span>');
        smsout = smsout.replace(';)', '<span class="smiley">😉</span>');
        smsout = smsout.replace(':beer:', '<span class="smiley">🍺</span>');
        return smsout;
    };
    ChattingWidget.prototype.getNameColor = function (name) {
        if (this.nameColorMap.has(name))
            return this.nameColorMap.get(name);
        if (this.remainColors.length <= 0)
            this.remainColors = __spreadArray([], this.nameColors);
        //[min, max)
        var randIndex = snippet_1.random(0, this.remainColors.length);
        var randomColor = this.remainColors[randIndex];
        this.remainColors.splice(randIndex, 1);
        this.nameColorMap.set(name, randomColor);
        return randomColor;
    };
    ChattingWidget.prototype.setPrivateState = function (jitsiId, name) {
        this.isPrivate = true;
        this.privateSenderId = jitsiId;
        this.privateSenderName = name;
        this.privatePanel.style.display = "flex";
        this.privateLabelElement.innerHTML = "Private message to " + name;
    };
    ChattingWidget.prototype.clearPrivateState = function () {
        this.isPrivate = false;
        this.privateSenderId = null;
        this.privatePanel.style.display = "none";
    };
    ChattingWidget.prototype.sendFile = function () {
        var props = new FileSender_1.FileSenderProps();
        props.fileElement = this.fileElement;
        props.fileSendingPanel = this.fileSendingPanel;
        props.sessionId = random_1.randomSessonId();
        props.onError = this.props.onFileSendErrror;
        props.onFinished = this.props.onFileSendFinished;
        props.sendFileData = this.props.sendFileData;
        props.sendFileMeta = this.props.sendFileMeta;
        var fileSender = new FileSender_1.FileSender(props);
        fileSender.sendFile();
    };
    ChattingWidget.prototype.onFileMeta = function (sessionId, meta, senderId, senderName) {
        var props = new FileReceiver_1.FileReceiverProps();
        props.meta = meta;
        props.senderId = senderId;
        props.senderName = senderName;
        props.onFinished = this.onFileReceiveFinished.bind(this);
        props.onError = this.onFileReceiveError.bind(this);
        props.addChatItem = this.receiveMessage.bind(this);
        var receiver = new FileReceiver_1.FileReceiver(props);
        this.fileReceivingPool.set(sessionId, receiver);
        receiver.show();
    };
    ChattingWidget.prototype.onFileData = function (sessionId, data) {
        var receiver = this.fileReceivingPool.get(sessionId);
        if (receiver)
            receiver.readFileData(data);
    };
    ChattingWidget.prototype.onFileReceiveError = function (sessionId, filename, message) {
        this.fileReceivingPool.delete(sessionId);
        this.props.onFileReceiveError(filename, message);
    };
    ChattingWidget.prototype.onFileReceiveFinished = function (sessionId, filename, message) {
        this.fileReceivingPool.delete(sessionId);
        this.props.onFileReceiveFinished(filename, message);
    };
    ChattingWidget.prototype.openPrivateChat = function (jitsiId, name) {
        this.open(true);
        this.setPrivateState(jitsiId, name);
    };
    return ChattingWidget;
}());
exports.ChattingWidget = ChattingWidget;
//# sourceMappingURL=ChattingPanel.js.map