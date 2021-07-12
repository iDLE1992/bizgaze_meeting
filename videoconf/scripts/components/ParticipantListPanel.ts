import { avatarName, random } from "../util/snippet";
import { VectorIcon } from "./vector_icon";


class ParticipantItemProps {
    jitsiId: string;
    name: string;
    me: boolean;
    useCamera: boolean;
    useMic: boolean;
    onUseCamera: (jitsiId: string, use:boolean) => {};
    onUseMic: (jitsiId: string, use: boolean) => {};
}

class ParticipantItem {
    rootElement: HTMLElement;
    avatarElement: HTMLElement;
    avatarTextElement: SVGTextElement;
    nameElement: HTMLElement;
    cameraButtonElement: HTMLElement;
    micButtonElement: HTMLElement;

    cameraIconElement: SVGPathElement;
    micIconElement: SVGPathElement;

    //state
    useCamera: boolean;
    useMic: boolean;
    isHost: boolean;

    //props
    props: ParticipantItemProps;

    constructor(props: ParticipantItemProps) {
        this.props = props;
        this.useCamera = this.props.useCamera;
        this.useMic = this.props.useMic;

        this.init();
    }

    init() {
        const body = `
            <div class="jitsi-participant">
                <div class="participant-avatar">
                    <div class="avatar  userAvatar w-40px h-40px" style="background-color: rgba(234, 255, 128, 0.4);">
                        <svg class="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <text dominant-baseline="central" fill="rgba(255,255,255,.6)" font-size="40pt" text-anchor="middle" x="50" y="50">?</text>
                        </svg>
                    </div>
                </div>
                <div class="participant-content">
                    <span class="name" class="fs-2 fw-bolder">?</span>
                    <span class="spacer"></span>
                    <div class="jitsi-icon camera-toggle-button">
                        <svg id="camera-disabled" width="20" height="20" viewBox="0 0 20 20">
                            <path d=""></path>
                        </svg>
                    </div>
                    <div class="jitsi-icon mic-toggle-button">
                        <svg id="mic-disabled" width="20" height="20" viewBox="0 0 20 20">
                            <path d=""></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        const $root = $(body);
        this.rootElement = $root[0];

        this.avatarElement = $root.find(".avatar")[0];
        this.avatarTextElement = $(this.avatarElement).find("text")[0];
        this.nameElement = $root.find(".name")[0];
        this.cameraButtonElement = $root.find(".camera-toggle-button")[0];
        this.micButtonElement = $root.find(".mic-toggle-button")[0];
        this.cameraIconElement = $(this.cameraButtonElement).find("path")[0];
        this.micIconElement = $(this.micButtonElement).find("path")[0];


        //avatar
        this.avatarTextElement.innerHTML = avatarName(this.props.name);
        const avatarColors = [
            "rgba(234, 255, 128, 0.4)",
            "rgba(114, 91, 60, 1.0)",
            "rgba(63, 65, 113, 1.0)",
            "rgba(56, 105, 91, 1.0)"];
        $(this.avatarElement).css(
            "background-color",
            avatarColors[random(0, avatarColors.length)]);

        //name
        if (this.props.me)
            $(this.nameElement).html(this.props.name + " (Me)");
        else 
            $(this.nameElement).html(this.props.name);

        //icon
        this.updateCameraIcon();
        this.updateMicIcon();

        $(this.cameraButtonElement).on('click', _ => {
            this.onToggleCamera();
        });
        $(this.micButtonElement).on('click', _ => {
            this.onToggleMic();
        });
    }

    element(): HTMLElement {
        return this.rootElement;
    }

    removeSelf() {
        $(this.rootElement).remove();
    }

    onToggleCamera() {
        if (!this.isHost)
            return;
        this.useCamera = !this.useCamera;
        this.updateCameraIcon();
        this.props.onUseCamera(this.props.jitsiId, this.useCamera);
    }
    onToggleMic() {
        if (!this.isHost)
            return;
        this.useMic = !this.useMic;
        this.updateMicIcon();
        this.props.onUseMic(this.props.jitsiId, this.useMic);
    }

    blockMic() {
        if (this.useMic)
            this.onToggleMic();
    }

    setMicState(use: boolean) {
        this.useMic = use;
        this.updateMicIcon();
    }

    setCameraState(use: boolean) {
        this.useCamera = use;
        this.updateCameraIcon();
    }

    setRole(isHost: boolean) {
        this.isHost = isHost;
    }

    updateCameraIcon() {
        const icon = this.useCamera ? VectorIcon.VIDEO_UNMUTE_ICON : VectorIcon.VIDEO_MUTE_ICON;
        $(this.cameraIconElement).attr("d", icon);
    }

    updateMicIcon() {
        const icon = this.useMic ? VectorIcon.AUDIO_UNMUTE_ICON : VectorIcon.AUDIO_MUTE_ICON;
        $(this.micIconElement).attr("d", icon);
    }
}

export class ParticipantListPanelProps {
    onUseCamera: (jitsiId: string, use: boolean) => {};
    onUseMic: (jitsiId: string, use: boolean) => {};
}


export class ParticipantListWidget {
    rootElement: HTMLElement;
    participantCountElement: HTMLElement;
    participantListElement: HTMLElement;
    muteAllButtonElement: HTMLElement;

    //states
    participantItemMap: Map<string, ParticipantItem> = new Map();
    isHost: boolean = false;

    //props
    props: ParticipantListPanelProps;

    constructor() {
        this.rootElement = document.getElementById("participants-list");
        const $root = $(this.rootElement);
        this.participantCountElement = $root.find("#participant-count")[0];
        this.participantListElement = $root.find("#participants-list-body")[0];
        this.muteAllButtonElement = $root.find("#participants-list-footer>.btn")[0];
    }

    init(props: ParticipantListPanelProps) {
        this.props = props;
        this.updateParticipantCount();
        this.attachHandlers();
    }

    attachHandlers() {
        $(this.muteAllButtonElement).on('click', () => {
            if (this.isHost) 
            this.participantItemMap.forEach((participantItem, key) => {
                participantItem.blockMic();
            });
        });
    }

    addParticipant(jitsiId: string, name: string, me: boolean, useCamera: boolean, useMic: boolean) {
        if (this.participantItemMap.has(jitsiId)) {
            this.removeParticipant(jitsiId);
        }

        let props = new ParticipantItemProps();
        props.jitsiId = jitsiId;
        props.name = name;
        props.me = me;
        props.useCamera = useCamera;
        props.useMic = useMic;
        props.onUseCamera = this.props.onUseCamera;
        props.onUseMic = this.props.onUseMic;

        const item = new ParticipantItem(props);
        item.setRole(this.isHost);

        this.participantItemMap.set(jitsiId, item);
        this.updateParticipantCount();

        if (me) {
            $(this.participantListElement).prepend(item.element());
        } else {
            $(this.participantListElement).append(item.element());
        }
        
    }

    removeParticipant(jitsiId: string) {
        if (!this.participantItemMap.has(jitsiId))
            return;

        this.participantItemMap.get(jitsiId).removeSelf();
        this.participantItemMap.delete(jitsiId);
        this.updateParticipantCount();
    }

    updateParticipantCount() {
        this.participantCountElement.innerHTML = `${this.participantItemMap.size}`;
    }
   
    setCameraMediaPolicy(jitsiId: string, useCamera: boolean) {
        const item = this.participantItemMap.get(jitsiId);
        if (item) 
            item.setCameraState(useCamera);
    }

    setMicMediaPolicy(jitsiId: string, useMic: boolean) {
        const item = this.participantItemMap.get(jitsiId);
        if (item)
            item.setMicState(useMic);
    }

    updateByRole(isHost: boolean) {
        this.isHost = isHost;

        if (isHost)
            $(this.rootElement).addClass("is-host");
        else
            $(this.rootElement).removeClass("is-host");
        this.muteAllButtonElement.style.visibility = isHost ? "visible" : "hidden";
        this.participantItemMap.forEach((participantItem, key) => {
            participantItem.setRole(isHost);
        });
    }
}