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