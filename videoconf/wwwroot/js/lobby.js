
const videoElem = document.getElementById("camera-preview");
const cameraListElem = document.getElementById("camera-list");

let localTracks = [];
let localVideoTracks = [];
let localAudioTracks = [];

let cameraList = [];
let micList = [];
let speakerList = [];


const initOptions = {
    disableAudioLevels: true
};


JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] })
    .then(onLocalTracks)
    .catch(error => {
        throw error;
    });


function onLocalTracks(tracks) {
    localTracks = tracks;
    localVideoTracks = [];
    localAudioTracks = [];

    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            audioLevel => console.log(`Audio Level local: ${audioLevel}`));
        
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
            deviceId =>
                console.log(
                    `track audio output device was changed to ${deviceId}`));

        if (localTracks[i].getType() === 'video') {
            localVideoTracks.push(localTracks[i]);
        } else {
            localAudioTracks.push(localAudioTracks[i]);
        }
    }
}

function getMediaDevices() {
    JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
        cameraList = devices.filter(d => d.kind === 'videoinput');
        micList = devices.filter(d => d.kind === 'audioinput');
        speakerList = devices.filter(d => d.kind === 'audiooutput');

        renderDevices();
    });
}


function renderDevices() {

    while (cameraListElem.firstChild) {
        cameraListElem.removeChild(cameraListElem.firstChild);
    }

    cameraList.forEach(camera => {
        cameraListElem.appendChild(document.createElement(`<option id="${camera.deviceId}">${camera.label}</option>`))
    });
}


JitsiMeetJS.init(initOptions);
getMediaDevices();