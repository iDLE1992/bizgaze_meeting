"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReceiver = exports.FileReceiverProps = void 0;
var snippet_1 = require("../util/snippet");
var FileReceiverProps = /** @class */ (function () {
    function FileReceiverProps() {
    }
    return FileReceiverProps;
}());
exports.FileReceiverProps = FileReceiverProps;
var FileReceiver = /** @class */ (function () {
    function FileReceiver(props) {
        this.receiveBuffer = [];
        this.size = 0;
        this.props = props;
    }
    FileReceiver.prototype.show = function () {
        var receivingId = "receiving-" + this.props.meta.sessionId;
        var html = "\n            <div class=\"file-progress\" id=\"" + receivingId + "\">\n                <div class=\"fileinfo\">\n                    <a class=\"download\" href=\"#\">" + this.props.meta.name + "(" + snippet_1.getCapacityLabel(this.props.meta.size) + ")</a>\n                </div>\n                <div class=\"progress\">\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n                </div>\n            </div>";
        this.props.addChatItem(this.props.senderId, this.props.senderName, html, false);
        this.receivingElement = $("#" + receivingId);
        this.progressElement = this.receivingElement.find(".progress-bar");
        this.downloadElement = this.receivingElement.find(".download");
        this.receivingElement.closest(".usermessage").css("white-space", "nowrap");
    };
    FileReceiver.prototype.readFileData = function (data) {
        debugger;
        this.receiveBuffer.push(data);
        this.size += data.byteLength;
        var percent = Math.floor(this.size / this.props.meta.size * 100);
        this.progressElement.attr("aria-valuenow", percent);
        this.progressElement.css("width", percent + "%");
        if (this.size >= this.props.meta.size) {
            var received = new Blob(this.receiveBuffer);
            this.downloadElement.attr('href', URL.createObjectURL(received));
            this.downloadElement.attr('download', this.props.meta.name);
            this.props.onFinished(this.props.meta.sessionId, this.props.meta.name, "Receive finished");
        }
    };
    return FileReceiver;
}());
exports.FileReceiver = FileReceiver;
//# sourceMappingURL=FileReceiver.js.map