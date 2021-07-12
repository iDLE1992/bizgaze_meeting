export enum NotificationType {
    User = "user",
    GrantHost = "host",
    Video = "video",
    VideoMute = "video-mute",
    Audio = "audio",
    AudioMute = "audio-mute",
    Recording = "recording",
    Screensharing = "screensharing",
    Chat = "chat",
    FileTransfer = "file-tranfer",
    FileReceive = "file-receive",
    Info = "info",
    Warning = "warning",
};

export enum NotificationDuration {
    Permanent = "permanent",
    HideAuto = "hide-auto",
}