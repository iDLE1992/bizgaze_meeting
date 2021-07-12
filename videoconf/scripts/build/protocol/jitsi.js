"use strict";
/* SHOULD not exist same value in two enums
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitsiPrivateCommand = exports.JitsiCommand = void 0;
var JitsiCommand;
(function (JitsiCommand) {
    JitsiCommand["GRANT_HOST_ROLE"] = "grant-host";
    JitsiCommand["MUTE_AUDIO"] = "mute_audio";
    JitsiCommand["MUTE_VIDEO"] = "mute_video";
    JitsiCommand["ALLOW_CAMERA"] = "allow_video";
    JitsiCommand["ALLOW_MIC"] = "allow_audio";
    JitsiCommand["INIT_MEDIA_POLICY"] = "init_media_policy";
    JitsiCommand["ASK_RECORDING"] = "ask-recording";
    JitsiCommand["ASK_SCREENSHARE"] = "ask-screenshare";
    JitsiCommand["FILE_META"] = "file_meta";
    JitsiCommand["FILE_SLICE"] = "file_slice";
    JitsiCommand["BIZ_ID"] = "biz_id";
})(JitsiCommand = exports.JitsiCommand || (exports.JitsiCommand = {}));
;
var JitsiPrivateCommand;
(function (JitsiPrivateCommand) {
    JitsiPrivateCommand["MEDIA_POLICY"] = "media_policy";
    JitsiPrivateCommand["ALLOW_RECORDING"] = "allow_recording";
    JitsiPrivateCommand["ALLOW_SCREENSHARE"] = "allow_screenshare";
    JitsiPrivateCommand["PRIVATE_CAHT"] = "private_chat";
})(JitsiPrivateCommand = exports.JitsiPrivateCommand || (exports.JitsiPrivateCommand = {}));
//# sourceMappingURL=jitsi.js.map