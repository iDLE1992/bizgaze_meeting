import { VideoPanel, VideoPanelProps } from "./VideoPanel";

export class VideoPanelGridProps {
    grantModeratorRole: (jistId: string) => void;
    muteUserAudio: (jitsiId: string, mute: boolean) => void;
    muteUserVideo: (jitsiId: string, mute: boolean) => void;
    muteMyVideo: (mute: boolean) => void;
    muteMyAudio: (mute: boolean) => void;
    openPrivateChat: (jitsiId: string, name: string) => void;
}

export class VideoPanelGrid {
    root: HTMLElement = null;
    props: VideoPanelGridProps;

    videoPanelMap: Map<number, VideoPanel> = new Map();

    panelClass: string = "videocontainer";
    fullscreenClass: string = "video-fullscreen";
    popupMenuClass: string = "popup-menu";

    constructor(props: VideoPanelGridProps) {
        this.props = props;
        this.root = document.getElementById("video-grid");

        this.attachHandlers();
    }

    attachHandlers() {
        document.addEventListener('click', (e) => {
            let inside = $(e.target).closest(`.${this.popupMenuClass}`).length > 0;
            if (!inside) {
                $(`.${this.popupMenuClass}`).removeClass("visible");
            }
        });
        $(document).ready(() => {
            this.redrawGrid();
        });

        $(window).resize(() => {
            this.redrawGrid();
        });
    }

    getNewVideoPanel(): VideoPanel {
        const props = new VideoPanelProps();
        props.refreshGrid = this.redrawGrid.bind(this);
        props.grantModeratorRole = this.props.grantModeratorRole;
        props.muteUserVideo = this.props.muteUserVideo;
        props.muteUserAudio = this.props.muteUserAudio;
        props.muteMyVideo = this.props.muteMyVideo;
        props.muteMyAudio = this.props.muteMyAudio;
        props.openPrivateChat = this.props.openPrivateChat;
        props.panelClass = this.panelClass;
        props.fullscreenClass = this.fullscreenClass;
        props.popupMenuClass = this.popupMenuClass;

        const videoPanel = new VideoPanel(props);

        $(this.root).append(videoPanel.root);
        videoPanel.attachHandlers();

        //add to map
        this.videoPanelMap.set(videoPanel.Id, videoPanel);

        //refresh layout
        this.redrawGrid();

        return videoPanel;
    }

    public freeVideoPanel(Id: number) {
        const videoPanel = this.videoPanelMap.get(Id);
        if (videoPanel) {
            $(videoPanel.root).remove();
            this.videoPanelMap.delete(Id);
            this.redrawGrid();
        }
    }

    redrawGrid() {
        //margin
        const gutter = 40;

        let width = $("#content").width() - gutter;
        let height = $("#content").height() - gutter;

        //number of video panels
        const panelCount = $(`.${this.panelClass}`).length;

        //chatting dialog
        const chattingWidth = 315;
        if ($(this.root).hasClass("shift-right")) {
            width -= chattingWidth;
        }

        //width, height of each video panel
        let w: number, h: number;

        //if fullscreen mode, hide other video panels
        if ($(`.${this.panelClass}`).hasClass(this.fullscreenClass)) {
            $(`.${this.panelClass}`).css("display", "none");
            $("." + this.fullscreenClass).css("display", "inline-block").css("height", height + gutter - 6).css("width", width + gutter);
            return;
        }

        //show all video panels
        $(`.${this.panelClass}`).css("display", "inline-block");

        let columnCount = 1;
        let rowCount = 1;

        const SM = 576;
        const MD = 768;
        const LG = 992;
        const XL = 1200;
        const XXL = 1400;

        if (width < SM) {
            columnCount = 1;
        } else if (width < LG) {
            if (panelCount <= 1) columnCount = 1;
            else columnCount = 2;
        } else {
            if (panelCount == 1) {
                if (width < XXL)
                    columnCount = 1;
                else
                    columnCount = 2;
            }
            else if (panelCount <= 4) columnCount = 2;
            else if (panelCount <= 9) columnCount = 3;
            else if (panelCount <= 16) columnCount = 4;
            else if (panelCount <= 20) columnCount = 5;
            else columnCount = 6;
        }

        rowCount = Math.floor((panelCount - 1) / columnCount) + 1;
        if (width < 576) {
            w = width;
            h = w * 9 / 16;
        }
        else {
            // 
            if (width * rowCount * 9 > height * columnCount * 16) {
                h = height / rowCount;
                w = h * 16 / 9;
            }
            //
            else {
                w = width / columnCount;
                h = w * 9 / 16;
            }
        }

        $(`.${this.panelClass}`)
            .css("width", w)
            .css("height", h)
            .find(".avatar-container")
            .css("width", h / 2)
            .css("height", h / 2);
    }

    hightlightPanel(targetId: number) {
        this.videoPanelMap.forEach((panel, Id) => {
            panel.setHighlight(targetId === Id);
        });
    }

}