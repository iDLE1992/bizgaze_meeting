import { JitsiTrack } from "./jitsi/JitsiTrack"
import { MediaType } from "./enum/MediaType"
import { stripHTMLTags } from "./util/snippet"
import { BGMeeting } from "./model/BGMeeting";
import { ParticipantType } from "./enum/ParticipantType";

declare global {
    interface Window {
        JitsiMeetJS: any;
        conferenceId: number;
        userId: string;
    }
}

class LobbySeetings {
}

export class Lobby {
    JitsiMeetJS = window.JitsiMeetJS;
    videoPreviewElem: HTMLElement;
    audioPreviewElem: HTMLElement;

    cameraListElem: HTMLElement;
    micListElem: HTMLElement;
    speakerListElem: HTMLElement;

    videoMuteElem: HTMLInputElement;
    audioMuteElem: HTMLInputElement;

    anonymousNameFiled: HTMLInputElement;
    startSessionButton: HTMLElement;

    cameraList: any[];
    micList: any[];
    speakerList: any[];

    audioTrackError:any = null;
    videoTrackError: any = null;

    activeCameraDeviceId: string = null;
    activeMicDeviceId: string = null;
    activeSpeakerDeviceId: string = null;

    conferenceId: number = window.conferenceId;
    userId: string = window.userId;


    constructor() {
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");

        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");

        this.videoMuteElem = document.getElementById("videoMute") as HTMLInputElement;
        this.audioMuteElem = document.getElementById("audioMute") as HTMLInputElement;

        this.anonymousNameFiled = document.getElementById("anonymous-name") as HTMLInputElement;
        this.startSessionButton = document.getElementById("start-session");
    }

    start() {
        const initOptions = {
            disableAudioLevels: true
        };

        this.JitsiMeetJS.init(initOptions);

        $(document).ready(() => {
            this.resizeCameraView();
            this.attachEventHandlers();
            this.refreshDeviceList();

            $(this.startSessionButton).prop('disabled', true);
            this.videoMuteElem.checked = true;
            this.audioMuteElem.checked = true;

            $.ajax({
                url: "/api/Meeting/" + this.conferenceId,
                type: "GET",
                data: "",
                dataType: 'json',
                success: (res: any) => {
                    this.onMeetingResult(res);
                },
                error: (xhr, status, error) => {
                    this.onMeetingErrorResult(error);
                }
            });
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
        $(window).resize(() => {
            this.resizeCameraView();
        });
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

    resizeCameraView() {
        const w = $("#camera-preview").width();
        const h = w * 9 / 16;
        $("#camera-preview").css("height", h);
        $("#camera-preview").css("min-height", h);
    }

    startSession() {
        if (this.isAnonymousUser() && this.anonymousNameFiled.value.trim().length <= 0)
            return;

        $("[name=cameraId]").val(this.activeCameraDeviceId);
        $("[name=micId]").val(this.activeMicDeviceId);
        $("[name=speakerId]").val(this.activeSpeakerDeviceId);
        $("[name=anonymousUserName]").val(this.anonymousNameFiled.value.trim());
        $("[name=videoMute]").val(this.videoMuteElem.checked+"");
        $("[name=audioMute]").val(this.audioMuteElem.checked+"");

        $("form").submit();
    }

    onMeetingResult(meeting: BGMeeting) {
        const hosts = meeting.Participants.filter(p => p.ParticipantType === ParticipantType.Host);
        if (hosts.length === 1)
            this.setOrganizerName(hosts[0].ParticipantName);
        else
            this.setOrganizerName("No organizer");

        //anonymous
        if (this.isAnonymousUser()) {
            $(this.anonymousNameFiled)
                .show()
                .focus()
                .keyup(_ => {
                    $(this.startSessionButton).prop('disabled', this.anonymousNameFiled.value.trim().length <= 0);
                }).keypress((e: any) => {
                    if ((e.keyCode || e.which) == 13) { //Enter keycode
                        e.preventDefault();
                        this.startSession();
                    }
                });
        } else {
            $(this.anonymousNameFiled).hide();
            $(this.startSessionButton).prop('disabled', false);
        }

        this.hidePreloader();
    }

    onMeetingErrorResult(err: string) {
        location.href = "/";
    }

    isAnonymousUser() {
        return !this.userId || !parseInt(this.userId);
    }


    /***********************************************************************************
    
                    Lobby UI methods
          (not introduced seperate UI class as this is simple class)
                           
    ************************************************************************************/
    setOrganizerName(name: string) {
        $("#host-name").html(stripHTMLTags(name));
    }

    hidePreloader() {
        $("#preloader").css("display", "none");
        $("#main-wrapper").addClass("show");
    }
}

const lobby: Lobby = new Lobby();
lobby.start();