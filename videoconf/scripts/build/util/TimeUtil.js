"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestamp = exports.getCurTime = exports.TsToDateFormat = void 0;
function TsToDateFormat(tsInMillisecond) {
    var sec = Math.floor(tsInMillisecond / 1000);
    // Hours part from the timestamp
    var hours = Math.floor(sec / 3600);
    // Minutes part from the timestamp
    var minutes = "0" + (Math.floor(sec / 60) - (hours * 60));
    // Seconds part from the timestamp
    var seconds = "0" + (sec % 60);
    // Will display time in 10:30:23 format
    var formattedTime = ("0" + hours).substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}
exports.TsToDateFormat = TsToDateFormat;
function getCurTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var m_2 = ("0" + m).slice(-2);
    var h_2 = ("0" + h).slice(-2);
    var time = h_2 + ":" + m_2;
    return time;
}
exports.getCurTime = getCurTime;
function getCurrentTimestamp() {
    var currentDate = new Date();
    var timestamp = currentDate.getTime();
    return timestamp;
}
exports.getCurrentTimestamp = getCurrentTimestamp;
//# sourceMappingURL=TimeUtil.js.map