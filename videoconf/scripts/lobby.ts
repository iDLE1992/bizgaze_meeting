import { JitsiTrack } from "./jitsi/JitsiTrack"
import { MediaType } from "./enum/MediaType"
import { stripHTMLTags } from "./util/snippet"
import { BGMeeting } from "./model/BGMeeting";
import { ParticipantType } from "./enum/ParticipantType";
import { MeetingType } from "./enum/MeetingType";

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

    videoPreviewElem: HTMLMediaElement;
    audioPreviewElem: HTMLMediaElement;

    cameraListElem: HTMLInputElement;
    micListElem: HTMLInputElement;
    speakerListElem: HTMLInputElement;

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

    localVideoTrack: JitsiTrack = null;
    localAudioTrack: JitsiTrack = null;

    constructor() {
        this.videoPreviewElem = document.getElementById("camera-preview") as HTMLMediaElement;
        this.audioPreviewElem = document.getElementById("mic-preview") as HTMLMediaElement;

        this.cameraListElem = document.getElementById("camera-list") as HTMLInputElement;
        this.micListElem = document.getElementById("mic-list") as HTMLInputElement;
        this.speakerListElem = document.getElementById("speaker-list") as HTMLInputElement;

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
            this.videoMuteElem.checked = false;
            this.audioMuteElem.checked = false;
            this.videoMuteElem.disabled = true;
            this.audioMuteElem.disabled = true;

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
        $(this.videoMuteElem).on('change', function () {
            _this.onEnableVideo(this.checked);
        });
        $(this.audioMuteElem).on('change', function () {
            _this.onEnableAudio(this.checked);
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
                this.initOnTracks(tracks);
            });
    }

    initOnTracks(tracks: JitsiTrack[]) {
        tracks.forEach(t => {
            if (t.getType() === MediaType.VIDEO) {
                this.localVideoTrack = t;
                this.attachVideoTrackToElem(t, this.videoPreviewElem);
                this.showCamera(true);
            } else if (t.getType() === MediaType.AUDIO) {
                this.localAudioTrack = t;
                t.attach(this.audioPreviewElem);
            }
        });


        if (this.activeCameraDeviceId === null) {
            this.showCamera(false);
            this.videoMuteElem.disabled = true;
            this.videoMuteElem.checked = false;
            this.cameraListElem.disabled = true;
        } else {
            this.showCamera(true);
            this.videoMuteElem.disabled = false;
            this.videoMuteElem.checked = true;
            this.cameraListElem.disabled = false;
        }

        if (this.activeMicDeviceId === null) {
            this.audioMuteElem.disabled = true;
            this.audioMuteElem.checked = false;
            this.micListElem.disabled = true;
        } else {
            this.audioMuteElem.disabled = false;
            this.audioMuteElem.checked = true;
            this.micListElem.disabled = false;
        }
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

        this.removeVideoTrack();
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.VIDEO) {
                        this.localVideoTrack = t;
                        this.attachVideoTrackToElem(t, this.videoPreviewElem);
                        this.showCamera(true);
                    }
                });
            });
    }

    onMicChanged(micDeviceId: string) {
        this.activeMicDeviceId = micDeviceId;

        this.removeAudioTrack();
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then((tracks: JitsiTrack[]) => {
                tracks.forEach(t => {
                    if (t.getType() === MediaType.AUDIO) {
                        this.localAudioTrack = t;
                        t.attach(this.audioPreviewElem);
                    }
                });
            });
    }

    removeVideoTrack() {
        if (this.localVideoTrack) {
            this.localVideoTrack.dispose();
            this.localVideoTrack = null;
        }
    }

    removeAudioTrack() {
        if (this.localAudioTrack) {
            this.localAudioTrack.dispose();
            this.localAudioTrack = null;
        }
    }

    onSpeakerChanged(speakerDeviceId: string) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        };
    }


    onEnableVideo(enable: boolean) {
        if (enable) {
            this.onCameraChanged(this.activeCameraDeviceId);
            this.cameraListElem.disabled = false;
        } else {
            this.removeVideoTrack();
            this.showCamera(false);
            this.cameraListElem.disabled = true;
        }
    }

    onEnableAudio(enable: boolean) {
        if (enable) {
            this.onMicChanged(this.activeMicDeviceId);
            this.micListElem.disabled = false;
        } else {
            this.removeAudioTrack();
            this.micListElem.disabled = true;
        }
    }

    showCamera(show: boolean) {
        if (show) {
            $(this.videoPreviewElem).removeClass("d-none");
            $("#no-camera-icon").addClass("d-none");
        } else {
            $(this.videoPreviewElem).addClass("d-none");
            $("#no-camera-icon").removeClass("d-none");
        }
    }

    attachVideoTrackToElem(track: JitsiTrack, elem: HTMLMediaElement) {
        track.attach(elem);
        this.resizeCameraView();
    }

    resizeCameraView() {
        const $container = $("#camera-preview-container");
        const w = $container.width();
        let h = w * 9 / 16;

        if (this.localVideoTrack) {
            const rawTrack = this.localVideoTrack.getTrack();
            const { height, width } = rawTrack.getSettings() ?? rawTrack.getConstraints();
            const Height = height as number;
            const Width = width as number;
            if (width && height) {
                h = w * Height / Width;
            }
        }

        $container.css("height", h);
        $container.css("min-height", h);
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

    validateUser(meeting: BGMeeting): boolean {
        if (this.isAnonymousUser()) {
            return meeting.ConferenceType === MeetingType.Open;
        }
        else {
            const user = meeting.Participants.filter(p => p.ParticipantId.toString() === this.userId);
            return user.length > 0;
        }
    }

    onMeetingResult(meeting: BGMeeting) {
        if (!this.validateUser(meeting)) {
            location.href = "/noaccess";
            return;
        }

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