import { FileMeta } from "../file/FileMeta";
import { FileReceiver, FileReceiverProps } from "../file/FileReceiver";
import { FileSender, FileSenderProps } from "../file/FileSender";
import { randomSessonId } from "../util/random";
import { random } from "../util/snippet";
import { getCurTime } from "../util/TimeUtil";

export class ChattingPanelProps {
    openCallback: Function;
    sendChat: (msg: string) => void;
    sendPrivateChat: (jitsiId: string, msg: string) => void;
    sendFileMeta: (meta: FileMeta) => {};
    sendFileData: (sessionId: string, data: ArrayBuffer) => {};
    onFileSendErrror: (filename: string, message: string) => {};
    onFileSendFinished: (filename: string, message: string) => {};
    onFileReceiveError: (filename: string, message: string) => {};
    onFileReceiveFinished: (filename: string, message: string) => {};
    showUnreadBadge: (show: boolean) => {};
    setUnreadCount: (count: number)=>{};
}

export class ChattingWidget {
    //controls
    root: HTMLElement;
    inputField: HTMLElement;
    sendButton: HTMLElement;
    filesendButton: HTMLElement;
    closeButton: HTMLElement;

    fileElement: HTMLInputElement;
    fileSendingPanel: HTMLElement;

    privatePanel: HTMLElement;
    privateLabelElement: HTMLElement;
    privateCloseElement: HTMLElement;

    //state
    opened: boolean;
    unreadCount: number = 0;
    privateSenderId: string;
    privateSenderName: string;
    isPrivate: boolean = false;

    //props
    props: ChattingPanelProps;

    nameColors: string[] = [];
    remainColors: string[] = [];
    nameColorMap: Map<string, string>;


    fileSendingPool: Map<string, FileSender> = new Map();
    fileReceivingPool: Map<string, FileReceiver> = new Map();

    init(props: ChattingPanelProps) {
        this.props = props;

        this.root = document.getElementById("sideToolbarContainer");
        this.closeButton = document.querySelector(".chat-close-button");
        this.inputField = document.querySelector("#chat-input #usermsg");
        this.sendButton = document.querySelector(".send-button");
        this.filesendButton = document.querySelector(".file-share-button");
        this.fileElement = document.getElementById("file-selector") as HTMLInputElement;
        this.fileSendingPanel = document.getElementById("file-sending");
        this.privatePanel = document.querySelector("#chat-recipient");
        this.privateLabelElement = $(this.privatePanel).find(">span")[0];
        this.privateCloseElement = $(this.privatePanel).find(">div")[0];

        this.nameColors.push("#00bfff");  //deepskyblue
        this.nameColors.push("#9acd32");  //yellowgreen
        this.nameColors.push("#d2691e");  //chocolate
        this.nameColors.push("#ee82ee");  //violet
        this.nameColors.push("#6495ed");  //cornflowerblue
        this.nameColors.push("#ffd700");  //gold
        this.nameColors.push("#808000");  //olive
        this.nameColors.push("#cd853f");  //peru

        this.remainColors = [...this.nameColors];
        this.nameColorMap = new Map<string, string>();

        this.attachEventHandlers();
        this.open(this.opened);
    }

    attachEventHandlers() {
        $(this.closeButton).on('click', () => {
            this.open(false);
        });
        $(this.inputField).keypress((e: any) => {
            if ((e.keyCode || e.which) == 13) { //Enter keycode
                if (!e.shiftKey) {
                    e.preventDefault();
                    this.onSend();
                }
            }
        });
        $(this.sendButton).on('click', () => {
            this.onSend();
        });

        const _this = this;
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
            } else {
                el.removeClass("show-smileys");
                el.addClass("hide-smileys");
            }
        });

        $(this.privateCloseElement).click(_ => {
            this.clearPrivateState();
        });

        $(this.filesendButton).click(_ => {
            $(this.fileElement).click();
        });

        $(this.fileElement).on("change", _ => {
            this.sendFile();
        });
    }

    open(opened: boolean) {
        if (opened) {
            $("#video-panel").addClass("shift-right");
            $("#new-toolbox").addClass("shift-right");
            $(this.root).removeClass("invisible");
            $(this.inputField).focus();

            //$(".toolbox-icon", this.props.chatOpenButton).addClass("toggled");
        } else {
            $("#video-panel").removeClass("shift-right");
            $("#new-toolbox").removeClass("shift-right");
            $(this.root).addClass("invisible");

            //$(".toolbox-icon", this.props.chatOpenButton).removeClass("toggled");
        }

        this.unreadCount = 0;
        this.props.showUnreadBadge(false);

        this.opened = opened;

        this.props.openCallback();
    }

    clearInput() {
        $(this.inputField).val('');
    }

    toggleOpen() {
        this.opened = !this.opened;
        this.open(this.opened);
    }

    onSend() {
        let msg = $(this.inputField).val().toString().trim();
        this.clearInput();

        if (!msg) return;

        msg = this.emonameToEmoicon(msg);
        const time = getCurTime();

        const privateClass = this.isPrivate ? "private" : "";
        let privateDetail = "";
        if (this.isPrivate) {
            privateDetail = `<div style="color:#778899">private: ${this.privateSenderName}</div>`;
        } 

        var el = $(".smileys-panel");
        el.removeClass("show-smileys");
        el.addClass("hide-smileys");

        var sel = $("#chatconversation div.chat-message-group:last-child");
        if (sel.hasClass("local")) {

            sel.find(".timestamp").remove();
            sel.append(`<div class= "chatmessage-wrapper" >\
                            <div class="chatmessage ${privateClass}">\
                                <div class="replywrapper">\
                                    <div class="messagecontent">\
                                        <div class="usermessage"> ${msg} </div>\
                                        ${privateDetail}
                                    </div>\
                                </div>\
                            </div>\
                            <div class="timestamp"> ${time} </div>\
                        </div >`);

        }
        else {
            $("#chatconversation").append(
                `<div class="chat-message-group local"> \
                    <div class= "chatmessage-wrapper" >\
                        <div class="chatmessage ${privateClass}">\
                            <div class="replywrapper">\
                                <div class="messagecontent">\
                                    <div class="usermessage"> ${msg} </div>\
                                    ${privateDetail}
                                </div>\
                            </div>\
                        </div>\
                        <div class="timestamp"> ${time} </div>\
                    </div >\
                </div>`);
        }

        this.scrollToBottom();

        if (this.isPrivate) {
            this.props.sendPrivateChat(this.privateSenderId, msg);
        } else {
            this.props.sendChat(msg);
        }
        
    }

    //chat
    receiveMessage(id: string, username: string, message: string, isPrivate: boolean = false) {
        //update unread count
        if (!this.opened) {
            this.unreadCount++;
            this.props.setUnreadCount(this.unreadCount);
            this.props.showUnreadBadge(true);
        }

        //update ui
        const emoMessage = this.emonameToEmoicon(message);
        const nameColor = this.getNameColor(username);

        const privateClass = isPrivate ? "private" : "";
        let replyElem = "";
        if (isPrivate) {
            replyElem = `
                <span class="jitsi-icon" jitsi-id="${id}" jitsi-name="${username}">
                    <svg height="22" width="22" viewBox="0 0 36 36">
                        <path d="M30,29a1,1,0,0,1-.81-.41l-2.12-2.92A18.66,18.66,0,0,0,15,18.25V22a1,1,0,0,1-1.6.8l-12-9a1,1,0,0,1,0-1.6l12-9A1,1,0,0,1,15,4V8.24A19,19,0,0,1,31,27v1a1,1,0,0,1-.69.95A1.12,1.12,0,0,1,30,29ZM14,16.11h.1A20.68,20.68,0,0,1,28.69,24.5l.16.21a17,17,0,0,0-15-14.6,1,1,0,0,1-.89-1V6L3.67,13,13,20V17.11a1,1,0,0,1,.33-.74A1,1,0,0,1,14,16.11Z"></path>
                    </svg>
                </span>`;
        }

        const $chatitem = $(`<div class="chat-message-group remote"> \
        <div class= "chatmessage-wrapper" >\
                <div class="chatmessage ${privateClass}">\
                    <div class="replywrapper">\
                        <div class="messagecontent">\
                            <div class="display-name" style="color:${nameColor}">` + username + replyElem + '</div>\
                            <div class="usermessage">' + emoMessage + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">'+ getCurTime() + '</div>\
            </div >\
        </div>');

        $("#chatconversation").append($chatitem);
        if (isPrivate) {
            const _this = this;
            $chatitem.find(".jitsi-icon").click(
                function (e) {
                    const id = $(this).attr("jitsi-id");
                    const name = $(this).attr("jitsi-name");
                    _this.setPrivateState(id, name);
                }
            );
        }

        this.scrollToBottom();

        if (isPrivate)
            this.setPrivateState(id, username);
    }

    private scrollToBottom() {
        var overheight = 0;
        $(".chat-message-group").each(function () {
            overheight += $(this).height();
        })

        var limit = $('#chatconversation').height();
        var pos = overheight - limit;

        $("#chatconversation").animate({ scrollTop: pos }, 200);
    }


    

    private idToEmoname(id: string) {
        if (id == 'smiley1') return ':)';
        if (id == 'smiley2') return ':(';
        if (id == 'smiley3') return ':D';
        if (id == 'smiley4') return ':+1:';
        if (id == 'smiley5') return ':P';
        if (id == 'smiley6') return ':wave:';
        if (id == 'smiley7') return ':blush:';
        if (id == 'smiley8') return ':slightly_smiling_face:';
        if (id == 'smiley9') return ':scream:';
        if (id == 'smiley10') return ':*';
        if (id == 'smiley11') return ':-1:';
        if (id == 'smiley12') return ':mag:';
        if (id == 'smiley13') return ':heart:';
        if (id == 'smiley14') return ':innocent:';
        if (id == 'smiley15') return ':angry:';
        if (id == 'smiley16') return ':angel:';
        if (id == 'smiley17') return ';(';
        if (id == 'smiley18') return ':clap:';
        if (id == 'smiley19') return ';)';
        if (id == 'smiley20') return ':beer:';
    }

    private emonameToEmoicon(sms: string) {
        let smsout = sms;
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
    }

    getNameColor(name: string): string {
        if (this.nameColorMap.has(name))
            return this.nameColorMap.get(name);

        if (this.remainColors.length <= 0)
            this.remainColors = [...this.nameColors];

        //[min, max)
        
        const randIndex = random(0, this.remainColors.length);
        const randomColor = this.remainColors[randIndex];
        this.remainColors.splice(randIndex, 1);

        this.nameColorMap.set(name, randomColor);

        return randomColor;
    }

    setPrivateState(jitsiId: string, name: string) {
        this.isPrivate = true;
        this.privateSenderId = jitsiId;
        this.privateSenderName = name;
        this.privatePanel.style.display = "flex";
        this.privateLabelElement.innerHTML = "Private message to " + name;
    }

    clearPrivateState() {
        this.isPrivate = false;
        this.privateSenderId = null;
        this.privatePanel.style.display = "none";
    }

    sendFile() {
        const props = new FileSenderProps();
        props.fileElement = this.fileElement;
        props.fileSendingPanel = this.fileSendingPanel;
        props.sessionId = randomSessonId();
        props.onError = this.props.onFileSendErrror;
        props.onFinished = this.props.onFileSendFinished;
        props.sendFileData = this.props.sendFileData;
        props.sendFileMeta = this.props.sendFileMeta;

        const fileSender = new FileSender(props);
        fileSender.sendFile();
    }

    onFileMeta(sessionId: string, meta: FileMeta, senderId: string, senderName: string) {
        const props = new FileReceiverProps();
        props.meta = meta;
        props.senderId = senderId;
        props.senderName = senderName;
        props.onFinished = this.onFileReceiveFinished.bind(this);
        props.onError = this.onFileReceiveError.bind(this);
        props.addChatItem = this.receiveMessage.bind(this);

        const receiver = new FileReceiver(props);
        this.fileReceivingPool.set(sessionId, receiver);
        receiver.show();
    }

    onFileData(sessionId: string, data: ArrayBuffer) {
        const receiver = this.fileReceivingPool.get(sessionId);
        if (receiver)
            receiver.readFileData(data);
    }

    onFileReceiveError(sessionId: string, filename: string, message: string) {
        this.fileReceivingPool.delete(sessionId);
        this.props.onFileReceiveError(filename, message);
    }

    onFileReceiveFinished(sessionId: string, filename: string, message: string) {
        this.fileReceivingPool.delete(sessionId);
        this.props.onFileReceiveFinished(filename, message);
    }

    openPrivateChat(jitsiId: string, name: string) {
        this.open(true);
        this.setPrivateState(jitsiId, name);
    }

}
