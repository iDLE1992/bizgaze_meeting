"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChattingPanel = exports.ChattingPanelProps = void 0;
var snippet_1 = require("../util/snippet");
var ChattingPanelProps = /** @class */ (function () {
    function ChattingPanelProps() {
    }
    return ChattingPanelProps;
}());
exports.ChattingPanelProps = ChattingPanelProps;
var ChattingPanel = /** @class */ (function () {
    function ChattingPanel() {
        this.unreadCount = 0;
        this.nameColors = [];
        this.remainColors = [];
    }
    ChattingPanel.prototype.init = function (props) {
        this.props = props;
        this.container = document.querySelector("#sideToolbarContainer");
        this.closeButton = document.querySelector(".chat-close-button");
        this.inputField = document.querySelector("#chat-input #usermsg");
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
    ChattingPanel.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        $(this.closeButton).on('click', function () {
            _this_1.open(false);
        });
        $(this.inputField).keypress(function (e) {
            if ((e.keyCode || e.which) == 13) { //Enter keycode
                if (!e.shiftKey) {
                    e.preventDefault();
                    _this_1.onEnter();
                }
            }
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
            var el = $(".smileys-panel");
            el.removeClass("show-smileys");
            el.addClass("hide-smileys");
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
    };
    ChattingPanel.prototype.open = function (opened) {
        if (opened) {
            $("#video-panel").addClass("shift-right");
            $("#new-toolbox").addClass("shift-right");
            $(this.container).removeClass("invisible");
            $(this.inputField).focus();
            $(".toolbox-icon", this.props.chatOpenButton).addClass("toggled");
        }
        else {
            $("#video-panel").removeClass("shift-right");
            $("#new-toolbox").removeClass("shift-right");
            $(this.container).addClass("invisible");
            $(".toolbox-icon", this.props.chatOpenButton).removeClass("toggled");
        }
        this.unreadCount = 0;
        this.showUnreadBadge(false);
        this.opened = opened;
        this.props.openCallback();
    };
    ChattingPanel.prototype.showUnreadBadge = function (show) {
        this.props.unreadBadgeElement.style.display = !!show ? "flex" : "none";
    };
    ChattingPanel.prototype.toggleOpen = function () {
        this.opened = !this.opened;
        this.open(this.opened);
    };
    ChattingPanel.prototype.onEnter = function () {
        var sms = $(this.inputField).val().toString().trim();
        $(this.inputField).val('');
        if (!sms)
            return;
        sms = this.emonameToEmoicon(sms);
        var time = this.getCurTime();
        var sel = $("#chatconversation div.chat-message-group:last-child");
        if (sel.hasClass("local")) {
            sel.find(".timestamp").remove();
            sel.append('<div class= "chatmessage-wrapper" >\
                                        <div class="chatmessage ">\
                                            <div class="replywrapper">\
                                                <div class="messagecontent">\
                                                    <div class="usermessage">' + sms + '</div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="timestamp">' + time + '</div>\
                                    </div >');
        }
        else {
            $("#chatconversation").append('<div class="chat-message-group local"> \
                                                <div class= "chatmessage-wrapper" >\
                                                        <div class="chatmessage ">\
                                                            <div class="replywrapper">\
                                                                <div class="messagecontent">\
                                                                    <div class="usermessage">' + sms + '</div>\
                                                                </div>\
                                                            </div>\
                                                        </div>\
                                                        <div class="timestamp">' + time + '</div>\
                                                    </div >\
                                                </div>');
        }
        this.scrollToBottom();
        this.props.sendChat(sms);
    };
    //chat
    ChattingPanel.prototype.receiveMessage = function (username, message, timestamp) {
        //update unread count
        if (!this.opened) {
            this.unreadCount++;
            $(this.props.unreadBadgeElement).html("" + this.unreadCount);
            this.showUnreadBadge(true);
        }
        //update ui
        var emoMessage = this.emonameToEmoicon(message);
        var nameColor = this.getNameColor(username);
        $("#chatconversation").append("<div class=\"chat-message-group remote\">         <div class= \"chatmessage-wrapper\" >                <div class=\"chatmessage \">                    <div class=\"replywrapper\">                        <div class=\"messagecontent\">                            <div class=\"display-name\" style=\"color:" + nameColor + "\">" + username + '</div>\
                            <div class="usermessage">' + emoMessage + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">' + this.getCurTime() + '</div>\
            </div >\
        </div>');
        this.scrollToBottom();
    };
    ChattingPanel.prototype.scrollToBottom = function () {
        var overheight = 0;
        $(".chat-message-group").each(function () {
            overheight += $(this).height();
        });
        var limit = $('#chatconversation').height();
        var pos = overheight - limit;
        $("#chatconversation").animate({ scrollTop: pos }, 200);
    };
    ChattingPanel.prototype.getCurTime = function () {
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var m_2 = ("0" + m).slice(-2);
        var h_2 = ("0" + h).slice(-2);
        var time = h_2 + ":" + m_2;
        return time;
    };
    ChattingPanel.prototype.idToEmoname = function (id) {
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
    ChattingPanel.prototype.emonameToEmoicon = function (sms) {
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
    ChattingPanel.prototype.getNameColor = function (name) {
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
    return ChattingPanel;
}());
exports.ChattingPanel = ChattingPanel;
//# sourceMappingURL=ChattingPanel.js.map