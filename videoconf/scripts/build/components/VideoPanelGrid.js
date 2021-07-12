"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPanelGrid = exports.VideoPanelGridProps = void 0;
var VideoPanel_1 = require("./VideoPanel");
var VideoPanelGridProps = /** @class */ (function () {
    function VideoPanelGridProps() {
    }
    return VideoPanelGridProps;
}());
exports.VideoPanelGridProps = VideoPanelGridProps;
var VideoPanelGrid = /** @class */ (function () {
    function VideoPanelGrid(props) {
        this.root = null;
        this.videoPanelMap = new Map();
        this.panelClass = "videocontainer";
        this.fullscreenClass = "video-fullscreen";
        this.popupMenuClass = "popup-menu";
        this.props = props;
        this.root = document.getElementById("video-grid");
        this.attachHandlers();
    }
    VideoPanelGrid.prototype.attachHandlers = function () {
        var _this = this;
        document.addEventListener('click', function (e) {
            var inside = $(e.target).closest("." + _this.popupMenuClass).length > 0;
            if (!inside) {
                $("." + _this.popupMenuClass).removeClass("visible");
            }
        });
        $(document).ready(function () {
            _this.redrawGrid();
        });
        $(window).resize(function () {
            _this.redrawGrid();
        });
    };
    VideoPanelGrid.prototype.getNewVideoPanel = function () {
        var props = new VideoPanel_1.VideoPanelProps();
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
        var videoPanel = new VideoPanel_1.VideoPanel(props);
        $(this.root).append(videoPanel.root);
        videoPanel.attachHandlers();
        //add to map
        this.videoPanelMap.set(videoPanel.Id, videoPanel);
        //refresh layout
        this.redrawGrid();
        return videoPanel;
    };
    VideoPanelGrid.prototype.freeVideoPanel = function (Id) {
        var videoPanel = this.videoPanelMap.get(Id);
        if (videoPanel) {
            $(videoPanel.root).remove();
            this.videoPanelMap.delete(Id);
            this.redrawGrid();
        }
    };
    VideoPanelGrid.prototype.redrawGrid = function () {
        //margin
        var gutter = 40;
        var width = $("#content").width() - gutter;
        var height = $("#content").height() - gutter;
        //number of video panels
        var panelCount = $("." + this.panelClass).length;
        //chatting dialog
        var chattingWidth = 315;
        if ($(this.root).hasClass("shift-right")) {
            width -= chattingWidth;
        }
        //width, height of each video panel
        var w, h;
        //if fullscreen mode, hide other video panels
        if ($("." + this.panelClass).hasClass(this.fullscreenClass)) {
            $("." + this.panelClass).css("display", "none");
            $("." + this.fullscreenClass).css("display", "inline-block").css("height", height + gutter - 6).css("width", width + gutter);
            return;
        }
        //show all video panels
        $("." + this.panelClass).css("display", "inline-block");
        var columnCount = 1;
        var rowCount = 1;
        var SM = 576;
        var MD = 768;
        var LG = 992;
        var XL = 1200;
        var XXL = 1400;
        if (width < SM) {
            columnCount = 1;
        }
        else if (width < LG) {
            if (panelCount <= 1)
                columnCount = 1;
            else
                columnCount = 2;
        }
        else {
            if (panelCount == 1) {
                if (width < XXL)
                    columnCount = 1;
                else
                    columnCount = 2;
            }
            else if (panelCount <= 4)
                columnCount = 2;
            else if (panelCount <= 9)
                columnCount = 3;
            else if (panelCount <= 16)
                columnCount = 4;
            else if (panelCount <= 20)
                columnCount = 5;
            else
                columnCount = 6;
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
        $("." + this.panelClass)
            .css("width", w)
            .css("height", h)
            .find(".avatar-container")
            .css("width", h / 2)
            .css("height", h / 2);
    };
    VideoPanelGrid.prototype.hightlightPanel = function (targetId) {
        this.videoPanelMap.forEach(function (panel, Id) {
            panel.setHighlight(targetId === Id);
        });
    };
    return VideoPanelGrid;
}());
exports.VideoPanelGrid = VideoPanelGrid;
//# sourceMappingURL=VideoPanelGrid.js.map