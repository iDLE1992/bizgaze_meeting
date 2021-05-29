import { JitsiTrack } from "../jitsi/JitsiTrack"
import { MediaType } from "../enum/MediaType"
import { ActiveDevices } from "../model/ActiveDevices"

declare global {
    interface Window {
        JitsiMeetJS: any;
    }
    interface JQuery {
        select2: Function;
    }
}

export class SettingDialogProps {
    curDevices: ActiveDevices;
    onDeviceChange: (newDevices: ActiveDevices) => void;
}

export class SettingDialog {
    dialog: HTMLElement;
    showButton: HTMLElement;
    okButton: HTMLElement;
    closeButton: HTMLElement;

    JitsiMeetJS = window.JitsiMeetJS;

    videoPreviewElem: HTMLElement;
    audioPreviewElem: HTMLElement;

    cameraListElem: HTMLElement;
    micListElem: HTMLElement;
    speakerListElem: HTMLElement;

    cameraList: any[];
    micList: any[];
    speakerList: any[];

    audioTrackError: any = null;
    videoTrackError: any = null;

    activeCameraDeviceId: string = null;
    activeMicDeviceId: string = null;
    activeSpeakerDeviceId: string = null;

    localTracks: JitsiTrack[] = [];

    props: SettingDialogProps;

    public init(props: SettingDialogProps) {
        this.props = props;

        this.dialog = document.querySelector(".setting-dialog-wrapper");
        this.showButton = document.querySelector(".setting-dialog-wrapper>button");
        $(this.dialog).addClass("d-none");
        this.okButton = document.querySelector("#setting-dialog-ok-button");
        this.closeButton = document.querySelector("#setting-dialog-cancel-button");

        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");

        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");

        this.attachEventHandlers();
        this.refreshDeviceList();
    }

    public show() {
        $(this.dialog).removeClass("d-none");
        $(this.showButton).trigger("click");
    }

    attachEventHandlers() {
        const _this = this;
        $(this.cameraListElem).off('change').on('change', function () {
            _this.onCameraChanged($(this).val() as string);
        });
        $(this.micListElem).off('change').on('change', function () {
            _this.onMicChanged($(this).val() as string);
        });
        $(this.speakerListElem).off('change').on('change', function () {
            _this.onSpeakerChanged($(this).val() as string);
        });
        $(this.okButton).off('click').on('click', () => {
            this.onOK();
        });
    }

    refreshDeviceList() {
        this.JitsiMeetJS.mediaDevices.enumerateDevices((devices: any) => {
            this.cameraList = devices.filter((d: any) => d.kind === 'videoinput');
            this.micList = devices.filter((d: any) => d.kind === 'audioinput');
            this.speakerList = devices.filter((d: any) => d.kind === 'audiooutput');
            this.renderDevices();
        });
    }

    renderDevices() {

        this.activeCameraDeviceId = this.props.curDevices.cameraId;
        this.activeMicDeviceId = this.props.curDevices.micId;
        this.activeSpeakerDeviceId = this.props.curDevices.speakerId;


        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach((camera: any) => {
            const selected = (this.activeCameraDeviceId && camera.deviceId === this.activeCameraDeviceId)
                ? "selected" : "";
            $(this.cameraListElem).append(`<option value="${camera.deviceId}" ${selected}>${camera.label}</option>`);

        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach((mic: any) => {
            const selected = (this.activeMicDeviceId && mic.deviceId === this.activeMicDeviceId)
                ? "selected" : "";
            $(this.micListElem).append(`<option value="${mic.deviceId}" ${selected}>${mic.label}</option>`);
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach((speaker: any) => {
            const selected = (this.activeSpeakerDeviceId && speaker.deviceId === this.activeSpeakerDeviceId)
                ? "selected" : "";
            $(this.speakerListElem).append(`<option value="${speaker.deviceId}" ${selected}>${speaker.label}</option>`);
        });

        $(".form-select").select2();

        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.VIDEO) {
                        t.attach(this.videoPreviewElem);
                    } else if (t.getType() === MediaType.AUDIO) {
                        t.attach(this.audioPreviewElem);
                    }
                });
                this.localTracks = tracks;
            });
    }

    initCurrentDevices() {
        const _this = this;
        $("option", this.cameraListElem).each(_ => {
            if ($(this).val() === _this.props.curDevices.micId) $(this).attr("selected", "selected");

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

    createAudioTrack(micDeviceId: string): Promise<JitsiTrack[]> {
        return (
            this.JitsiMeetJS.createLocalTracks({
                devices: ['audio'],
                cameraDeviceId: null,
                micDeviceId
            })
                .catch((error: any) => {
                    this.audioTrackError = error;
                    return Promise.resolve([]);
                }));
    }

    onCameraChanged(cameraDeviceId: string) {
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then((tracks: JitsiTrack[]) => {
                let newTrack = tracks.find(t => t.getType() === MediaType.VIDEO);

                //remove existing track
                const oldTrack = this.localTracks.find(t => t.getType() === MediaType.VIDEO);
                if (oldTrack) {
                    oldTrack.dispose();
                    this.localTracks.splice(this.localTracks.indexOf(oldTrack), 1);
                }

                if (newTrack) {
                    this.localTracks.push(newTrack);
                    newTrack.attach(this.videoPreviewElem);
                }
            });
    }

    onMicChanged(micDeviceId: string) {
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then((tracks: JitsiTrack[]) => {
                let newTrack = tracks.find(t => t.getType() === MediaType.AUDIO);

                //remove existing track
                const oldTrack = this.localTracks.find(t => t.getType() === MediaType.AUDIO);
                if (oldTrack) {
                    oldTrack.dispose();
                    this.localTracks.splice(this.localTracks.indexOf(oldTrack), 1);
                }

                if (newTrack) {
                    this.localTracks.push(newTrack);
                    newTrack.attach(this.audioPreviewElem);
                }
            });
    }

    onSpeakerChanged(speakerDeviceId: string) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        };
    }

    onOK() {
        this.closeDialog();

        let newDevices = new ActiveDevices();
        newDevices.cameraId = this.activeCameraDeviceId;
        newDevices.micId = this.activeMicDeviceId;
        newDevices.speakerId = this.activeSpeakerDeviceId;

        this.props.onDeviceChange(newDevices);
    }

    closeDialog() {
        $(this.closeButton).trigger("click");
        this.localTracks.forEach((track: JitsiTrack) => {
            track.dispose();
        });
    }
}