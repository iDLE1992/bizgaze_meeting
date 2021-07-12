"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingDescriptionWidget = void 0;
var MeetingDescriptionWidget = /** @class */ (function () {
    function MeetingDescriptionWidget() {
        //state
        this.firstUpdate = true;
        this.time = "";
        this.subject = "";
        this.root = document.querySelector(".subject");
        this.subjectElement = document.querySelector(".subject-text");
        this.timestampElement = document.querySelector(".subject-timer");
    }
    MeetingDescriptionWidget.prototype.updateTime = function (time) {
        this.time = time.trim();
        this.timestampElement.innerHTML = this.time;
        this.showOnInit();
    };
    MeetingDescriptionWidget.prototype.setSubject = function (subject, hostName) {
        this.subject = subject.trim();
        var subjectLabel = this.subject;
        if (hostName && hostName.trim().length > 0)
            subjectLabel += "(" + hostName.trim() + ")";
        this.subjectElement.innerHTML = subjectLabel;
        this.showOnInit();
    };
    MeetingDescriptionWidget.prototype.showOnInit = function () {
        if (this.firstUpdate && this.time.length > 0 && this.subject.length > 0) {
            this.firstUpdate = false;
            this.fadeIn();
        }
    };
    MeetingDescriptionWidget.prototype.fadeIn = function () {
        $(this.root).addClass("visible");
    };
    MeetingDescriptionWidget.prototype.fadeOut = function () {
        $(this.root).removeClass("visible");
    };
    return MeetingDescriptionWidget;
}());
exports.MeetingDescriptionWidget = MeetingDescriptionWidget;
//# sourceMappingURL=MeetingDescriptionWidget.js.map