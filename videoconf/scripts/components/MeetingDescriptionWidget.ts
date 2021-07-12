
export class MeetingDescriptionWidget {
    root: HTMLElement;
    subjectElement: HTMLElement;
    timestampElement: HTMLElement;

    //state
    firstUpdate: boolean = true;
    time: string = "";
    subject: string = "";

    constructor() {
        this.root = document.querySelector(".subject");
        this.subjectElement = document.querySelector(".subject-text");
        this.timestampElement = document.querySelector(".subject-timer");
    }

    updateTime(time: string) {
        this.time = time.trim();
        this.timestampElement.innerHTML = this.time;
        this.showOnInit();
    }

    setSubject(subject: string, hostName: string) {
        this.subject = subject.trim();

        let subjectLabel = this.subject;
        if (hostName && hostName.trim().length > 0)
            subjectLabel += `(${hostName.trim()})`;

        this.subjectElement.innerHTML = subjectLabel;

        this.showOnInit();
    }

    showOnInit() {
        if (this.firstUpdate && this.time.length > 0 && this.subject.length > 0) {
            this.firstUpdate = false;
            this.fadeIn();
        }
    }

    fadeIn() {
        $(this.root).addClass("visible");
    }

    fadeOut() {
        $(this.root).removeClass("visible");
    }
}