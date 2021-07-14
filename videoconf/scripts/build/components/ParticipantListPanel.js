"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantListWidget = exports.ParticipantListPanelProps = void 0;
var snippet_1 = require("../util/snippet");
var vector_icon_1 = require("./vector_icon");
var ParticipantItemProps = /** @class */ (function () {
    function ParticipantItemProps() {
    }
    return ParticipantItemProps;
}());
var ParticipantItem = /** @class */ (function () {
    function ParticipantItem(props) {
        this.props = props;
        this.useCamera = this.props.useCamera;
        this.useMic = this.props.useMic;
        this.init();
    }
    ParticipantItem.prototype.init = function () {
        var _this = this;
        var body = "\n            <div class=\"jitsi-participant\">\n                <div class=\"participant-avatar\">\n                    <div class=\"avatar  userAvatar w-40px h-40px\" style=\"background-color: rgba(234, 255, 128, 0.4);\">\n                        <svg class=\"avatar-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                            <text dominant-baseline=\"central\" fill=\"rgba(255,255,255,.6)\" font-size=\"40pt\" text-anchor=\"middle\" x=\"50\" y=\"50\">?</text>\n                        </svg>\n                    </div>\n                </div>\n                <div class=\"participant-content\">\n                    <span class=\"name\" class=\"fs-2 fw-bolder\">?</span>\n                    <span class=\"spacer\"></span>\n                    <div class=\"jitsi-icon camera-toggle-button\">\n                        <svg id=\"camera-disabled\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n                            <path d=\"\"></path>\n                        </svg>\n                    </div>\n                    <div class=\"jitsi-icon mic-toggle-button\">\n                        <svg id=\"mic-disabled\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n                            <path d=\"\"></path>\n                        </svg>\n                    </div>\n                </div>\n            </div>\n        ";
        var $root = $(body);
        this.rootElement = $root[0];
        this.avatarElement = $root.find(".avatar")[0];
        this.avatarTextElement = $(this.avatarElement).find("text")[0];
        this.nameElement = $root.find(".name")[0];
        this.cameraButtonElement = $root.find(".camera-toggle-button")[0];
        this.micButtonElement = $root.find(".mic-toggle-button")[0];
        this.cameraIconElement = $(this.cameraButtonElement).find("path")[0];
        this.micIconElement = $(this.micButtonElement).find("path")[0];
        //avatar
        this.avatarTextElement.innerHTML = snippet_1.avatarName(this.props.name);
        var avatarColors = [
            "rgba(234, 255, 128, 0.4)",
            "rgba(114, 91, 60, 1.0)",
            "rgba(63, 65, 113, 1.0)",
            "rgba(56, 105, 91, 1.0)"
        ];
        $(this.avatarElement).css("background-color", avatarColors[snippet_1.random(0, avatarColors.length)]);
        //name
        if (this.props.me)
            $(this.nameElement).html(this.props.name + " (Me)");
        else
            $(this.nameElement).html(this.props.name);
        //icon
        this.updateCameraIcon();
        this.updateMicIcon();
        $(this.cameraButtonElement).on('click', function (_) {
            _this.onToggleCamera();
        });
        $(this.micButtonElement).on('click', function (_) {
            _this.onToggleMic();
        });
    };
    ParticipantItem.prototype.element = function () {
        return this.rootElement;
    };
    ParticipantItem.prototype.removeSelf = function () {
        $(this.rootElement).remove();
    };
    ParticipantItem.prototype.onToggleCamera = function () {
        if (!this.isHost)
            return;
        this.useCamera = !this.useCamera;
        this.updateCameraIcon();
        this.props.onUseCamera(this.props.jitsiId, this.useCamera);
    };
    ParticipantItem.prototype.onToggleMic = function () {
        if (!this.isHost)
            return;
        this.useMic = !this.useMic;
        this.updateMicIcon();
        this.props.onUseMic(this.props.jitsiId, this.useMic);
    };
    ParticipantItem.prototype.blockMic = function () {
        if (this.useMic)
            this.onToggleMic();
    };
    ParticipantItem.prototype.setMicState = function (use) {
        this.useMic = use;
        this.updateMicIcon();
    };
    ParticipantItem.prototype.setCameraState = function (use) {
        this.useCamera = use;
        this.updateCameraIcon();
    };
    ParticipantItem.prototype.setRole = function (isHost) {
        this.isHost = isHost;
    };
    ParticipantItem.prototype.updateCameraIcon = function () {
        var icon = this.useCamera ? vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON : vector_icon_1.VectorIcon.VIDEO_MUTE_ICON;
        $(this.cameraIconElement).attr("d", icon);
    };
    ParticipantItem.prototype.updateMicIcon = function () {
        var icon = this.useMic ? vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON : vector_icon_1.VectorIcon.AUDIO_MUTE_ICON;
        $(this.micIconElement).attr("d", icon);
    };
    return ParticipantItem;
}());
var ParticipantListPanelProps = /** @class */ (function () {
    function ParticipantListPanelProps() {
    }
    return ParticipantListPanelProps;
}());
exports.ParticipantListPanelProps = ParticipantListPanelProps;
var ParticipantListWidget = /** @class */ (function () {
    function ParticipantListWidget() {
        //states
        this.participantItemMap = new Map();
        this.isHost = false;
        this.rootElement = document.getElementById("participants-list");
        var $root = $(this.rootElement);
        this.participantCountElement = $root.find("#participant-count")[0];
        this.participantListElement = $root.find("#participants-list-body")[0];
        this.muteAllButtonElement = $root.find("#participants-list-footer>.btn")[0];
        this.toggleCopyJoiningInfoElement = document.querySelector("#copy-joining-info");
        this.joiningInfoElement = document.querySelector("#joining-info");
    }
    ParticipantListWidget.prototype.init = function (props) {
        this.props = props;
        this.updateParticipantCount();
        this.attachHandlers();
    };
    ParticipantListWidget.prototype.attachHandlers = function () {
        var _this = this;
        $(this.muteAllButtonElement).on('click', function () {
            if (_this.isHost)
                _this.participantItemMap.forEach(function (participantItem, key) {
                    participantItem.blockMic();
                });
        });
        $(this.toggleCopyJoiningInfoElement).on('click', function (_) {
            _this.props.toggleCopyJoiningInfo();
        });
    };
    ParticipantListWidget.prototype.addParticipant = function (jitsiId, name, me, useCamera, useMic) {
        if (this.participantItemMap.has(jitsiId)) {
            this.removeParticipant(jitsiId);
        }
        var props = new ParticipantItemProps();
        props.jitsiId = jitsiId;
        props.name = name;
        props.me = me;
        props.useCamera = useCamera;
        props.useMic = useMic;
        props.onUseCamera = this.props.onUseCamera;
        props.onUseMic = this.props.onUseMic;
        var item = new ParticipantItem(props);
        item.setRole(this.isHost);
        this.participantItemMap.set(jitsiId, item);
        this.updateParticipantCount();
        if (me) {
            $(this.participantListElement).prepend(item.element());
        }
        else {
            $(this.participantListElement).append(item.element());
        }
    };
    ParticipantListWidget.prototype.removeParticipant = function (jitsiId) {
        if (!this.participantItemMap.has(jitsiId))
            return;
        this.participantItemMap.get(jitsiId).removeSelf();
        this.participantItemMap.delete(jitsiId);
        this.updateParticipantCount();
    };
    ParticipantListWidget.prototype.updateJoiningInfo = function (info) {
        this.joiningInfoElement.innerHTML = info;
    };
    ParticipantListWidget.prototype.updateParticipantCount = function () {
        this.participantCountElement.innerHTML = "" + this.participantItemMap.size;
    };
    ParticipantListWidget.prototype.setCameraMediaPolicy = function (jitsiId, useCamera) {
        var item = this.participantItemMap.get(jitsiId);
        if (item)
            item.setCameraState(useCamera);
    };
    ParticipantListWidget.prototype.setMicMediaPolicy = function (jitsiId, useMic) {
        var item = this.participantItemMap.get(jitsiId);
        if (item)
            item.setMicState(useMic);
    };
    ParticipantListWidget.prototype.updateByRole = function (isHost) {
        this.isHost = isHost;
        if (isHost)
            $(this.rootElement).addClass("is-host");
        else
            $(this.rootElement).removeClass("is-host");
        this.muteAllButtonElement.style.visibility = isHost ? "visible" : "hidden";
        this.participantItemMap.forEach(function (participantItem, key) {
            participantItem.setRole(isHost);
        });
    };
    return ParticipantListWidget;
}());
exports.ParticipantListWidget = ParticipantListWidget;
//# sourceMappingURL=ParticipantListPanel.js.map