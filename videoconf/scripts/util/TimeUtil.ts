export function TsToDateFormat(tsInMillisecond:number): string {

    const sec = Math.floor(tsInMillisecond / 1000);
    // Hours part from the timestamp
    const hours = Math.floor(sec / 3600);
    // Minutes part from the timestamp
    const minutes = "0" + (Math.floor(sec / 60) - (hours * 60));
    // Seconds part from the timestamp
    const seconds = "0" + (sec % 60);

    // Will display time in 10:30:23 format
    const formattedTime = ("0" + hours).substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

export function getCurTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var m_2 = ("0" + m).slice(-2);
    var h_2 = ("0" + h).slice(-2);
    var time = h_2 + ":" + m_2;
    return time;
}

export function getCurrentTimestamp() {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    return timestamp;
}