"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSender = exports.FileSenderProps = void 0;
var snippet_1 = require("../util/snippet");
var FileSenderProps = /** @class */ (function () {
    function FileSenderProps() {
    }
    return FileSenderProps;
}());
exports.FileSenderProps = FileSenderProps;
var FileSender = /** @class */ (function () {
    function FileSender(props) {
        this.props = props;
    }
    FileSender.prototype.sendFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file, sendingId, html, $progressElem, chunkSize, fileReader, offset, readSlice;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.props.fileElement.files.length <= 0) {
                    //this.props.onError("No file", "Please select a file to share");
                    return [2 /*return*/];
                }
                file = this.props.fileElement.files[0];
                if (file.size <= 0) {
                    this.props.onError(file.name, "You choosed empty file");
                    return [2 /*return*/];
                }
                this.file = file;
                sendingId = "sending-" + this.props.sessionId;
                html = "\n            <div class=\"file-progress\" id=\"" + sendingId + "\">\n                <div class=\"fileinfo\">\n                    " + file.name + "(" + snippet_1.getCapacityLabel(file.size) + ")\n                </div>\n                <div class=\"progress\">\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n                </div>\n            </div>";
                $(this.props.fileSendingPanel).append(html);
                this.sendingElement = $("#" + sendingId);
                $progressElem = this.sendingElement.find(".progress-bar");
                this.props.sendFileMeta({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    sessionId: this.props.sessionId
                });
                chunkSize = 16384;
                fileReader = new FileReader();
                offset = 0;
                fileReader.addEventListener('error', function (error) {
                    _this.removeSelf();
                    _this.props.onError(file.name, "Error happened while reading ");
                });
                fileReader.addEventListener('abort', function (event) {
                    _this.removeSelf();
                    _this.props.onError(file.name, "Reading was aborted");
                });
                readSlice = function (o) {
                    var slice = file.slice(offset, o + chunkSize);
                    fileReader.readAsArrayBuffer(slice);
                };
                fileReader.addEventListener('load', function (e) {
                    var blob = e.target.result;
                    _this.props.sendFileData(_this.props.sessionId, blob);
                    offset += blob.byteLength;
                    //update progress
                    var percent = Math.floor((offset * 100) / file.size);
                    $progressElem.attr("aria-valuenow", percent);
                    $progressElem.css("width", percent + "%");
                    if (offset < file.size) {
                        setTimeout(function (_) {
                            readSlice(offset);
                        }, 100);
                        //readSlice(offset);
                    }
                    else {
                        _this.removeSelf();
                        _this.props.onFinished(file.name, "Sending finished");
                    }
                });
                readSlice(0);
                return [2 /*return*/];
            });
        });
    };
    FileSender.prototype.removeSelf = function () {
        this.sendingElement.remove();
    };
    return FileSender;
}());
exports.FileSender = FileSender;
//# sourceMappingURL=FileSender.js.map