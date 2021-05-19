import { JitsiTrack } from "./jitsi/JitsiTrack"
import { MediaType } from "./jitsi/MediaType"

declare global {
    interface Window {
        JitsiMeetJS: any;
    }
}

export class Lobby {
    JitsiMeetJS = window.JitsiMeetJS;
    videoPreviewElem: HTMLElement;
    audioPreviewElem: HTMLElement;

    cameraListElem: HTMLElement;
    micListElem: HTMLElement;
    speakerListElem: HTMLElement;
    startSessionButton: HTMLElement;

    cameraList: any[];
    micList: any[];
    speakerList: any[];

    audioTrackError:any = null;
    videoTrackError: any = null;

    activeCameraDeviceId: string = null;
    activeMicDeviceId: string = null;
    activeSpeakerDeviceId: string = null;


    constructor() {
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");

        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");
        this.startSessionButton = document.getElementById("start-session");
    }

    start() {
        const initOptions = {
            disableAudioLevels: true
        };

        this.JitsiMeetJS.init(initOptions);

        $(document).ready(() => {
            this.attachEventHandlers();
            this.refreshDeviceList();
        });
    }

    attachEventHandlers() {
        const _this = this;
        $(this.cameraListElem).on('change', function() {
            _this.onCameraChanged($(this).val() as string);
        });
        $(this.micListElem).on('change', function () {
            _this.onMicChanged($(this).val() as string);
        });
        $(this.speakerListElem).on('change', function () {
            _this.onSpeakerChanged($(this).val() as string);
        });

        $(this.startSessionButton).on('click', () => {
            this.startSession();
        })
    }

    refreshDeviceList() {
        this.JitsiMeetJS.mediaDevices.enumerateDevices((devices: any) => {
            this.cameraList = devices.filter((d:any) => d.kind === 'videoinput');
            this.micList = devices.filter((d: any) => d.kind === 'audioinput');
            this.speakerList = devices.filter((d: any) => d.kind === 'audiooutput');
            this.renderDevices();
        });
    }

    renderDevices() {
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach((camera: any) => {
            $(this.cameraListElem).append(`<option value="${camera.deviceId}">${camera.label}</option>`);
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach((mic: any) => {
            $(this.micListElem).append(`<option value="${mic.deviceId}">${mic.label}</option>`);
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach((speaker: any) => {
            $(this.speakerListElem).append(`<option value="${speaker.deviceId}">${speaker.label}</option>`);
        });

        this.activeCameraDeviceId = this.cameraList.length > 0 ? this.cameraList[0].deviceId : null;
        this.activeMicDeviceId = this.micList.length > 0 ? this.micList[0].deviceId : null;
        this.activeSpeakerDeviceId = this.speakerList.length > 0 ? this.speakerList[0].deviceId : null;

        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.VIDEO) {
                        t.attach(this.videoPreviewElem);
                    } else if (t.getType() === MediaType.AUDIO) {
                        t.attach(this.audioPreviewElem);
                    }
                });
            });
    }

    clearDOMElement(elem: HTMLElement) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    }

    createLocalTracks(cameraDeviceId: string, micDeviceId: string): Promise<JitsiTrack[]> {

        this.videoTrackError = null;
        this.audioTrackError = null;

        if (cameraDeviceId != null && micDeviceId != null) {
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['audio', 'video'],
                cameraDeviceId,
                micDeviceId
            }).catch(() => Promise.all([
                this.createAudioTrack(micDeviceId).then(([stream]) => stream),
                this.createVideoTrack(cameraDeviceId).then(([stream]) => stream)
            ])).then((tracks: JitsiTrack[]) => {
                if (this.audioTrackError) {
                    //display error
                }

                if (this.videoTrackError) {
                    //display error
                }

                return tracks.filter(t => typeof t !== 'undefined');
            });
        } else if (cameraDeviceId != null) {
            return this.createVideoTrack(cameraDeviceId);
        } else if (micDeviceId != null) {
            return this.createAudioTrack(micDeviceId);
        }

        return Promise.resolve([]);
    }

    createVideoTrack(cameraDeviceId: string): Promise<JitsiTrack[]> {
        
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['video'],
                cameraDeviceId,
                micDeviceId: null
            })
                .catch((error: any) => {
                    this.videoTrackError = error;
                    return Promise.resolve([]);
                });
    }

    createAudioTrack(micDeviceId: string): Promise<JitsiTrack[]>  {
        return (
            this.JitsiMeetJS.createLocalTracks({
                devices: ['audio'],
                cameraDeviceId: null,
                micDeviceId
            })
                .catch((error:any) => {
                    this.audioTrackError = error;
                    return Promise.resolve([]);
                }));
    }

    onCameraChanged(cameraDeviceId: string) {
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.VIDEO) {
                        t.attach(this.videoPreviewElem);
                    }
                });
            });
    }

    onMicChanged(micDeviceId: string) {
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.AUDIO) {
                        t.attach(this.audioPreviewElem);
                    }
                });
            });
    }

    onSpeakerChanged(speakerDeviceId: string) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        };
    }

    startSession() {
        if (!!this.activeCameraDeviceId)
            $("[name=cameraId]").val(this.activeCameraDeviceId);
        if (!!this.activeMicDeviceId)
            $("[name=micId]").val(this.activeMicDeviceId);
        if (!!this.activeSpeakerDeviceId)
            $("[name=speakerId]").val(this.activeSpeakerDeviceId);
        $("form").submit();
    }
}

const lobby: Lobby = new Lobby();
lobby.start();