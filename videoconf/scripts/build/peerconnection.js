"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BizGazeConnection = void 0;
var BizGazeConnection = /** @class */ (function () {
    function BizGazeConnection(channel, pcConfig, offerConstraints, mediaConstraints, sdpConstraints, sourceId, destId, initiator, stereo, localStream, myInfo, peerInfo, meetingUI) {
        var _this = this;
        this.channel = null;
        this.sourceId = "";
        this.destId = "";
        this.peerConnection = null;
        this.senderList = [];
        this.signalingReady = false;
        this.started = false;
        this.turnDone = false;
        this.initiator = false; //create offer/answer role
        this.msgQueue = [];
        this.isAudioMuted = false;
        this.isVideoMuted = false;
        this.stereo = false;
        this.remoteStream = null;
        this.localStream = null;
        this.pcConfig = null;
        this.offerConstraints = null;
        this.mediaConstraints = null;
        this.sdpConstraints = null;
        this.remoteVideoElem = null;
        this.myInfo = null;
        this.peerInfo = null;
        this.meetingUI = null;
        this.setStatus = function (state) {
            // document.getElementById('footer').innerHTML = state;
        };
        this.mergeConstraints = function (cons1, cons2) {
            var merged = cons1;
            for (var name in cons2.mandatory) {
                merged.mandatory[name] = cons2.mandatory[name];
            }
            merged.optional.concat(cons2.optional);
            return merged;
        };
        this.onSignalingMessage = function (msg) {
            try { //json parse 
                if (!_this.initiator && !_this.started) {
                    if (msg.type === 'offer') {
                        console.log('got offer');
                        _this.msgQueue.unshift(msg);
                        _this.signalingReady = true;
                        _this.startNegotiate();
                    }
                    else {
                        _this.msgQueue.push(msg);
                    }
                }
                else {
                    _this.processSignalingMessage(msg);
                }
            }
            catch (err) { }
        };
        this.processSignalingMessage = function (message) {
            console.log('processSignalingMessage');
            if (!_this.started) {
                console.log('peerConnection has not been created yet!');
                return;
            }
            if (message.type === 'offer') {
                console.log('processing message - offer');
                if (_this.stereo) {
                    message.sdp = _this.addStereo(message.sdp);
                }
                _this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                _this.doAnswer();
            }
            else if (message.type === 'answer') {
                console.log('processing message - answer');
                if (_this.stereo) {
                    message.sdp = _this.addStereo(message.sdp);
                }
                _this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
            }
            else if (message.type === 'candidate') {
                console.log('processing message - candidate');
                var candidate = new RTCIceCandidate({ sdpMLineIndex: message.label, candidate: message.candidate });
                _this.peerConnection.addIceCandidate(candidate);
            }
            else if (message.type === 'mute') {
                //receive mute request
                _this.muteAudio(_this.sourceId, message.onoff);
            }
            else if (message.type === 'muted') {
                _this.__muteAudioPanel(message.onff);
            }
        };
        this.onIceCandidate = function (event) {
            console.log('onIceCandidate()');
            if (event.candidate) {
                _this.sendSignalingMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            }
            else {
                console.log('End of candidates.');
            }
        };
        this.onRemoteStreamAdded = function (event) {
            console.log('onRemoteStreamAdded(): Remote stream added.');
            _this.remoteVideoElem = _this.__getRemoteVideoPanel();
            _this.updatePanelUI();
            if (event.streams && event.streams[0]) {
                _this.remoteVideoElem.srcObject = event.streams[0];
                _this.remoteStream = event.stream;
            }
            else {
                var inboundStream = new MediaStream();
                inboundStream.addTrack(event.track);
                _this.remoteVideoElem.srcObject = inboundStream;
                _this.remoteStream = inboundStream;
            }
            //update ui
            _this.waitForRemoteVideo();
        };
        this.onRemoteStreamRemoved = function (event) {
            console.log('onRemoteStreamRemoved(): Remote stream removed.');
        };
        //important callback for deciding peer connection establish
        this.onIceConnectionStateChagne = function (event) {
            //    if (this.iceConnectionState == 'disconnected') {
            //    }
            console.log('onIceConnectionStateChange()');
            //    printObject('pc', this);
            //    started = false;
            //    maybeStart();
        };
        this.muteAudio = function (userId, onff) {
            if (userId == _this.sourceId) {
                if (_this.localStream != null) {
                    var localAudioTracks = _this.localStream.getAudioTracks();
                    if (localAudioTracks[0])
                        localAudioTracks[0].enabled = !!onff;
                    _this.__muteAudioPanel(onff);
                    _this.sendSignalingRoomMessage({
                        type: 'muted',
                        onoff: onff
                    });
                }
            }
            else {
                _this.sendSignalingMessage({
                    type: 'mute',
                    onoff: onff
                });
            }
        };
        // Set Opus as the default audio codec if it's present.
        this.preferOpus = function (sdp) {
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
                    var opusPayload = _this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    if (opusPayload) {
                        sdpLines[mLineIndex] = _this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                    }
                    break;
                }
            }
            // Remove CN in m line and sdp.
            sdpLines = _this.removeCN(sdpLines, mLineIndex);
            sdp = sdpLines.join('\r\n');
            return sdp;
        };
        // Set Opus in stereo if stereo is enabled.
        this.addStereo = function (sdp) {
            var sdpLines = sdp.split('\r\n');
            var fmtpLineIndex = null;
            // Find opus payload.
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayload = _this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    break;
                }
            }
            // Find the payload in fmtp line.
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('a=fmtp') !== -1) {
                    var payload = _this.extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
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
        };
        this.extractSdp = function (sdpLine, pattern) {
            var result = sdpLine.match(pattern);
            return (result && result.length == 2) ? result[1] : null;
        };
        // Set the selected codec to the first in m line.
        this.setDefaultCodec = function (mLine, payload) {
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
        };
        // Strip CN from sdp before CN constraints is ready.
        this.removeCN = function (sdpLines, mLineIndex) {
            var mLineElements = sdpLines[mLineIndex].split(' ');
            // Scan from end for the convenience of removing an item.
            for (var i = sdpLines.length - 1; i >= 0; i--) {
                var payload = _this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
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
        };
        this.Log("creating BizGazeConnection");
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
        this.remoteVideoElem = null;
        this.myInfo = myInfo;
        this.peerInfo = peerInfo;
        this.meetingUI = meetingUI;
        this.initUI();
        this.initialize();
    }
    BizGazeConnection.prototype.initUI = function () {
    };
    BizGazeConnection.prototype.initialize = function () {
        this.resetStatus();
        this.requestTurn();
    };
    BizGazeConnection.prototype.requestTurn = function () {
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
    };
    BizGazeConnection.prototype.startNegotiate = function () {
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
                for (var _i = 0, _a = this.localStream.getTracks(); _i < _a.length; _i++) {
                    var track = _a[_i];
                    this.senderList.push(this.peerConnection.addTrack(track));
                }
            this.started = true;
            if (this.initiator)
                this.doCall();
            else
                this.calleeStart();
        }
        else {
            console.log('could not start negotiating with peer');
        }
    };
    BizGazeConnection.prototype.createPeerConnection = function () {
        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
            this.peerConnection = new RTCPeerConnection(this.pcConfig);
            this.peerConnection.onicecandidate = this.onIceCandidate;
        }
        catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object; \
                    WebRTC is not supported by this browser.');
            return;
        }
        this.peerConnection.ontrack = this.onRemoteStreamAdded;
        this.peerConnection.oniceconnectionstatechange = this.onIceConnectionStateChagne;
    };
    BizGazeConnection.prototype.closePeerConnection = function () {
        var N = this.senderList == null ? 0 : this.senderList.length;
        for (var i = 0; i < N; i++) {
            this.peerConnection.removeTrack(this.senderList[i]);
        }
        this.peerConnection.close();
        this.__removeRemoteVideo();
    };
    BizGazeConnection.prototype.resetStatus = function () {
        if (!this.initiator) {
            this.setStatus('Waiting for someone to join:');
        }
        else {
            this.setStatus('Initializing...');
        }
    };
    BizGazeConnection.prototype.doCall = function () {
        var _this = this;
        var options = {};
        if (!this.myInfo.hasMediaDevice.hasCamera && this.peerInfo.hasMediaDevice.hasCamera)
            options.offerToReceiveVideo = true;
        if (!this.myInfo.hasMediaDevice.hasMic && this.peerInfo.hasMediaDevice.hasMic)
            options.offerToReceiveAudio = true;
        this.peerConnection.createOffer(options).then(function (offer) {
            return _this.peerConnection.setLocalDescription(offer);
        }).then(function () {
            _this.sendSignalingMessage(_this.peerConnection.localDescription);
        }).catch(function (reason) {
            // An error occurred, so handle the failure to connect
            _this.Log("could not createOffer");
            console.log(reason.toString());
        });
    };
    BizGazeConnection.prototype.calleeStart = function () {
        // Callee starts to process cached offer and other messages.
        while (this.msgQueue.length > 0) {
            this.processSignalingMessage(this.msgQueue.shift());
        }
    };
    BizGazeConnection.prototype.doAnswer = function () {
        var _this = this;
        console.log('Sending answer to peer.');
        var options = {};
        if (!this.myInfo.hasMediaDevice.hasCamera && this.peerInfo.hasMediaDevice.hasCamera)
            options.offerToReceiveVideo = true;
        if (!this.myInfo.hasMediaDevice.hasMic && this.peerInfo.hasMediaDevice.hasMic)
            options.offerToReceiveAudio = true;
        this.peerConnection.createAnswer(options).then(function (answer) {
            return _this.peerConnection.setLocalDescription(answer);
        }).then(function () {
            // Send the answer to the remote peer through the signaling server.
            _this.sendSignalingMessage(_this.peerConnection.localDescription);
        }).catch(function (reason) {
            _this.Log("could not createAnswer");
            console.log(reason.toString());
        });
    };
    BizGazeConnection.prototype.sendSignalingMessage = function (msg) {
        this.channel.invoke("SignalingMessage", this.sourceId, this.destId, JSON.stringify(msg)).catch(function (err) {
            return console.error(err.toString());
        });
    };
    BizGazeConnection.prototype.sendSignalingRoomMessage = function (msg) {
        this.channel.invoke("SignalingMessage", this.sourceId, "room", JSON.stringify(msg)).catch(function (err) {
            return console.error(err.toString());
        });
    };
    BizGazeConnection.prototype.updatePanelUI = function () {
        //this.meetingUI.updatePanelOnMyBGUser(this.remoteVideoElem, this.myInfo);
    };
    BizGazeConnection.prototype.__removeRemoteVideo = function () {
        this.meetingUI.freeVideoPanel(this.remoteVideoElem);
        this.remoteStream = null;
        this.remoteVideoElem = null;
    };
    BizGazeConnection.prototype.__getRemoteVideoPanel = function () {
        if (this.remoteVideoElem == null)
            return this.meetingUI.getEmptyVideoPanel();
        else
            return this.remoteVideoElem;
    };
    BizGazeConnection.prototype.__muteAudioPanel = function (ononff) {
    };
    BizGazeConnection.prototype.__muteVideoPanel = function (onoff) {
    };
    BizGazeConnection.prototype.onHangup = function () {
        console.log('Hanging up.');
        this.transitionToDone();
        this.stop();
    };
    BizGazeConnection.prototype.onRemoteHangup = function () {
        console.log('Session terminated.');
        this.transitionToWaiting();
        this.stop();
    };
    BizGazeConnection.prototype.stop = function () {
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
        this.peerConnection = null;
        this.msgQueue.length = 0;
    };
    BizGazeConnection.prototype.waitForRemoteVideo = function () {
        console.log('waitForRemoteVideo()');
        if (this.remoteStream == null || this.remoteVideoElem == null) {
            return;
        }
        var videoTracks = this.remoteStream.getVideoTracks();
        var audioTracks = this.remoteStream.getAudioTracks();
        //nothing to update
        if (videoTracks.length === 0 && audioTracks.length === 0)
            return;
        if (this.remoteVideoElem.currentTime > 0) {
            this.__muteVideoPanel(videoTracks.length <= 0);
            this.__muteAudioPanel(audioTracks.length <= 0);
            return;
        }
        setTimeout(this.waitForRemoteVideo, 100);
    };
    BizGazeConnection.prototype.transitionToWaiting = function () {
    };
    BizGazeConnection.prototype.transitionToDone = function () {
    };
    BizGazeConnection.prototype.enterFullScreen = function () {
        // container.webkitRequestFullScreen();
    };
    BizGazeConnection.prototype.Log = function (message) {
        console.log(message);
        if (this.meetingUI != null)
            this.meetingUI.Log(message);
    };
    return BizGazeConnection;
}());
exports.BizGazeConnection = BizGazeConnection;
//# sourceMappingURL=peerconnection.js.map