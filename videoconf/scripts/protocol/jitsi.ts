
/* SHOULD not exist same value in two enums
 */


export enum JitsiCommand {
    GRANT_HOST_ROLE = "grant-host",
    MUTE_AUDIO = "mute_audio",
    MUTE_VIDEO = "mute_video",
    ALLOW_CAMERA = "allow_video",
    ALLOW_MIC = "allow_audio",
    INIT_MEDIA_POLICY = "init_media_policy",
    ASK_RECORDING = "ask-recording",
    ASK_SCREENSHARE = "ask-screenshare",
    FILE_META = "file_meta",
    FILE_SLICE = "file_slice",
    BIZ_ID = "biz_id",
};



export enum JitsiPrivateCommand {
    MEDIA_POLICY = "media_policy",
    ALLOW_RECORDING = "allow_recording",
    ALLOW_SCREENSHARE = "allow_screenshare",
    PRIVATE_CAHT = "private_chat"
}
