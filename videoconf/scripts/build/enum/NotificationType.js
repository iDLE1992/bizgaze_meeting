"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDuration = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["User"] = "user";
    NotificationType["GrantHost"] = "host";
    NotificationType["Video"] = "video";
    NotificationType["VideoMute"] = "video-mute";
    NotificationType["Audio"] = "audio";
    NotificationType["AudioMute"] = "audio-mute";
    NotificationType["Recording"] = "recording";
    NotificationType["Screensharing"] = "screensharing";
    NotificationType["HandRaise"] = "handraise";
    NotificationType["Chat"] = "chat";
    NotificationType["FileTransfer"] = "file-tranfer";
    NotificationType["FileReceive"] = "file-receive";
    NotificationType["Info"] = "info";
    NotificationType["Warning"] = "warning";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
;
var NotificationDuration;
(function (NotificationDuration) {
    NotificationDuration["Permanent"] = "permanent";
    NotificationDuration["HideAuto"] = "hide-auto";
})(NotificationDuration = exports.NotificationDuration || (exports.NotificationDuration = {}));
//# sourceMappingURL=NotificationType.js.map