"use strict";
import * as signalR from "@microsoft/signalr";
import { MeetingUI } from "./meeting_ui";

export class BizGazeConnection
{   
    channel: signalR.HubConnection = null;
    sourceId: string = "";
    destId: string = "";

    peerConnection: RTCPeerConnection = null;
    senderList: RTCRtpSender[] = [];

    signalingReady: boolean = false;
    started: boolean = false;
    turnDone: boolean = false;

    initiator: boolean = false;  //create offer/answer role


    msgQueue: object[] = [];

    isAudioMuted: boolean = false;
    isVideoMuted: boolean = false;
    stereo: boolean = false;

    remoteStream: MediaStream = null;
    localStream: MediaStream = null;

    pcConfig: any = null;
    offerConstraints: object = null;
    mediaConstraints: object = null;
    sdpConstraints: object = null;

    remoteVideoContainer: string = "";
    remoteVideoClass: string = "";
    remoteVideoElem: HTMLMediaElement = null;

    hasCamera: boolean = false;
    hasMic: boolean = false;

    meetingUI: MeetingUI = new MeetingUI();

    constructor(channel: signalR.HubConnection, pcConfig: object, offerConstraints: object, mediaConstraints: object, sdpConstraints: object,
        sourceId: string, destId: string, initiator: boolean, stereo: boolean, localStream: MediaStream, remoteVideoContainer: string, remoteVideoClass: string) {

        this.remoteStream = null;
        this.peerConnection = null;
        this.started = false;
        this.turnDone = false;
        this.msgQueue = [];

        this.isAudioMuted = false;
        this.isVideoMuted = false;

        this.channel = channel;
        this.pcConfig = pcConfig;

        this.offerConstraints = offerConstraints;
        this.mediaConstraints = mediaConstraints;
        this.sdpConstraints = sdpConstraints;

        this.sourceId = sourceId;
        this.destId = destId; //peer partner
        this.initiator = initiator; //boolean value (offer/answer role)'

        this.stereo = stereo;
        this.signalingReady = initiator;

        this.localStream = localStream;

        this.remoteVideoContainer = remoteVideoContainer;
        this.remoteVideoClass = remoteVideoClass;
        this.remoteVideoElem = null;

        this.initUI();
        this.initialize();
    }

    initUI() {
        /*navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                this.hasCamera ||= devices.some(function (d) { return d.kind == "videoinput"; });
                this.hasMic ||= devices.some(function (d) { return d.kind == "audioinput"; });

            });
        
        this.__muteVideoPanel(!this.hasCamera);
        this.__muteAudioPanel(!this.hasCamera);*/
    }

    initialize() {
        console.log('Initializing;');
        this.resetStatus();
        this.requestTurn();
    }

    requestTurn() {
        for (var i = 0, len = this.pcConfig.iceServers.length; i < len; i++) {
            if (this.pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
                console.log('maybeRequestTurn - 2');
                this.turnDone = true;
                return;
            }
        }

        console.log('Complete to make turn information.');
        this.turnDone = true;
        this.startNegotiate();

    }

    startNegotiate() {
        console.log('started: ' + this.started);
        console.log('localStream: ' + this.localStream);
        console.log('turnDone: ' + this.turnDone);
        if (!this.started && this.signalingReady && this.turnDone) {
            this.setStatus('Connecting...');

            console.log('Creating PeerConnection.');
            this.createPeerConnection();

            console.log('Adding local stream.');
            this.senderList = [];
            if (this.localStream != null)
            for (const track of this.localStream.getTracks()) {
                this.senderList.push(this.peerConnection.addTrack(track));
            }
            this.started = true;

            if (this.initiator)
                this.doCall();
            else
                this.calleeStart();
        } else {
            console.log('could not start negotiating with peer');
        }
    }

    createPeerConnection() {
        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
            this.peerConnection = new RTCPeerConnection(this.pcConfig);
            this.peerConnection.onicecandidate = this.onIceCandidate;
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object; \
                    WebRTC is not supported by this browser.');
            return;
        }

        this.peerConnection.ontrack = this.onRemoteStreamAdded;
        this.peerConnection.oniceconnectionstatechange = this.onIceConnectionStateChagne;
    }

    closePeerConnection() {
        let N: number = this.senderList == null ? 0 : this.senderList.length;
        for (let i = 0; i < N; i++) {
            this.peerConnection.removeTrack(this.senderList[i]);
        }
        this.peerConnection.close();
        this.__removeRemoteVideo();
    }

    setStatus = function (state: string) {
        // document.getElementById('footer').innerHTML = state;
    }

    resetStatus() {
        if (!this.initiator) {
            this.setStatus('Waiting for someone to join:');
        } else {
            this.setStatus('Initializing...');
        }
    }

    doCall() {
        //let options = { offerToReceiveVideo: true, offerToSendVideo: true };
        this.peerConnection.createOffer().then( (offer) => {
            return this.peerConnection.setLocalDescription(offer);
        }).then(() => {
            this.sendSignalingMessage(this.peerConnection.localDescription);
        }).catch(function (reason) {
            // An error occurred, so handle the failure to connect
            console.log(reason.toString());
        });
    }

    calleeStart() {
        // Callee starts to process cached offer and other messages.
        while (this.msgQueue.length > 0) {
            this.processSignalingMessage(this.msgQueue.shift());
        }
    }

    doAnswer() {
        console.log('Sending answer to peer.');
        //let options = { offerToReceiveVideo: true, offerToSendVideo: true };
        this.peerConnection.createAnswer().then((answer) => {
            return this.peerConnection.setLocalDescription(answer);
        }).then( () => {
                // Send the answer to the remote peer through the signaling server.
            this.sendSignalingMessage(this.peerConnection.localDescription);
        }).catch();
    }

    mergeConstraints = function (cons1: any, cons2: any) {
        var merged = cons1;
        for (var name in cons2.mandatory) {
            merged.mandatory[name] = cons2.mandatory[name];
        }
        merged.optional.concat(cons2.optional);
        return merged;
    }

    sendSignalingMessage(msg: any) {
        this.channel.invoke("SignalingMessage", this.sourceId, this.destId, JSON.stringify(msg)).catch((err: any) => {
            return console.error(err.toString());
        });
    }
    sendSignalingRoomMessage(msg: any) {
        this.channel.invoke("SignalingMessage", this.sourceId, "room", JSON.stringify(msg)).catch((err: any) => {
            return console.error(err.toString());
        });
    }

    onSignalingMessage = (strMsg: any) => {
        try { //json parse 
            let msg = JSON.parse(strMsg);
            if (!this.initiator && !this.started) {
                if (msg.type === 'offer') {
                    console.log('got offer');
                    this.msgQueue.unshift(msg);
                    this.signalingReady = true;
                    this.startNegotiate();
                } else {
                    this.msgQueue.push(msg);
                }
            } else {
                this.processSignalingMessage(msg);
            }
        } catch (err) { }
    }

    processSignalingMessage = (message: any) => {
        console.log('processSignalingMessage');
        if (!this.started) {
            console.log('peerConnection has not been created yet!');
            return;
        }

        if (message.type === 'offer') {
            console.log('processing message - offer');
            if (this.stereo) {
                message.sdp = this.addStereo(message.sdp);
            }
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
            this.doAnswer();

        } else if (message.type === 'answer') {
            console.log('processing message - answer');
            if (this.stereo) {
                message.sdp = this.addStereo(message.sdp);
            }
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));

        } else if (message.type === 'candidate') {
            console.log('processing message - candidate');
            var candidate = new RTCIceCandidate({ sdpMLineIndex: message.label, candidate: message.candidate });
            this.peerConnection.addIceCandidate(candidate);
        } else if (message.type === 'mute') {
            //receive mute request
            this.muteAudio(this.sourceId, message.onoff);
        } else if (message.type === 'muted') {
            this.__muteAudioPanel(message.onff);
        }
    }

    onIceCandidate = (event: any) => {
        console.log('onIceCandidate()');
        if (event.candidate) {

            this.sendSignalingMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    onRemoteStreamAdded = (event: any) => {
        console.log('onRemoteStreamAdded(): Remote stream added.');

        this.remoteVideoElem = this.__getRemoteVideoPanel();

        if (event.streams && event.streams[0]) {
            this.remoteVideoElem.srcObject = event.streams[0];
            this.remoteStream = event.stream;
        } else {
            let inboundStream = new MediaStream();
            inboundStream.addTrack(event.track);
            this.remoteVideoElem.srcObject = inboundStream;
            this.remoteStream = inboundStream;
        }

        //update ui
        this.waitForRemoteVideo();
    }

    __removeRemoteVideo() {
        this.meetingUI.freeVideoPanel(this.remoteVideoElem);
        this.remoteStream = null;
        this.remoteVideoElem = null;
    }

    __getRemoteVideoPanel(): HTMLMediaElement {
        if (this.remoteVideoElem == null)
            return this.meetingUI.getEmptyVideoPanel();
        else
            return this.remoteVideoElem;
    }

    __muteAudioPanel(ononff: boolean) {

    }

    __muteVideoPanel(onoff: boolean) {

    }

    onRemoteStreamRemoved = (event: any) => {
        console.log('onRemoteStreamRemoved(): Remote stream removed.');
    }

    //important callback for deciding peer connection establish
    onIceConnectionStateChagne = (event: any) => {
        //    if (this.iceConnectionState == 'disconnected') {
        //    }
        console.log('onIceConnectionStateChange()');
        //    printObject('pc', this);
        //    started = false;
        //    maybeStart();
    }

    muteAudio = (userId: string, onff: boolean) => {
        if (userId == this.sourceId) {
            if (this.localStream != null) {
                let localAudioTracks = this.localStream.getAudioTracks();
                if (localAudioTracks[0])
                    localAudioTracks[0].enabled = !!onff;

                this.__muteAudioPanel(onff);
                this.sendSignalingRoomMessage({
                    type: 'muted',
                    onoff: onff
                });
            }
        } else {
            this.sendSignalingMessage({
                type: 'mute',
                onoff: onff
            });
        }
    }

    onHangup() {
        console.log('Hanging up.');
        this.transitionToDone();
        this.stop();
    }

    onRemoteHangup() {
        console.log('Session terminated.');
        this.transitionToWaiting();
        this.stop();
    }

    stop() {
        console.log('stop()');
        //todo remove
        this.__removeRemoteVideo();
        this.initUI();
        this.started = false;
        this.isAudioMuted = false;
        this.isVideoMuted = false;
        this.signalingReady = true;
        this.initiator = false;
        this.peerConnection.close();
        this.peerConnection= null;
        this.msgQueue.length = 0;
    }

    waitForRemoteVideo() {
        console.log('waitForRemoteVideo()');
        if (this.remoteStream == null || this.remoteVideoElem == null) {
            return;
        }

        let videoTracks = this.remoteStream.getVideoTracks();
        let audioTracks = this.remoteStream.getAudioTracks();
        //nothing to update
        if (videoTracks.length === 0 && audioTracks.length === 0)
            return;

        if (this.remoteVideoElem.currentTime > 0) {
            this.__muteVideoPanel(videoTracks.length <= 0);
            this.__muteAudioPanel(audioTracks.length <= 0);
            return;
        }
        
        setTimeout(this.waitForRemoteVideo, 100);
    }

    transitionToWaiting() {
    }

    transitionToDone() {
    }

    enterFullScreen() {
        // container.webkitRequestFullScreen();
    }

    // Set Opus as the default audio codec if it's present.
    preferOpus = (sdp: string) => {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex = null;

        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null)
            return sdp;

        // If Opus is available, set it as the default in m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = this.removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    // Set Opus in stereo if stereo is enabled.
    addStereo = (sdp: string) => {
        var sdpLines = sdp.split('\r\n');
        var fmtpLineIndex = null;

        // Find opus payload.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                break;
            }
        }

        // Find the payload in fmtp line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('a=fmtp') !== -1) {
                var payload = this.extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
                if (payload === opusPayload) {
                    fmtpLineIndex = i;
                    break;
                }
            }
        }
        // No fmtp line found.
        if (fmtpLineIndex === null)
            return sdp;

        // Append stereo=1 to fmtp line.
        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    extractSdp = (sdpLine: string, pattern: RegExp) => {
        var result = sdpLine.match(pattern);
        return (result && result.length == 2) ? result[1] : null;
    }

    // Set the selected codec to the first in m line.
    setDefaultCodec = (mLine: string, payload: string) => {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            if (elements[i] !== payload)
                newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    // Strip CN from sdp before CN constraints is ready.
    removeCN = (sdpLines: string[], mLineIndex: number) => {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }
}
