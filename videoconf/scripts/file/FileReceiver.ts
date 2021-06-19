import { getCapacityLabel } from "../util/snippet";
import { FileMeta } from "./FileMeta";

export class FileReceiverProps {
    meta: FileMeta;
    senderId: string;
    senderName: string;
    addChatItem: (id: string, username: string, message: string, isPrivate: boolean) => { };
    onFinished: (sessionId: string, filename:string, message: string) => {};
    onError: (sessionId: string, filename:string, message: string) => {};
}

export class FileReceiver {
    props: FileReceiverProps;

    //state    
    receivingElement: JQuery;
    progressElement: JQuery;
    downloadElement: JQuery;

    receiveBuffer: ArrayBuffer[] = [];
    size = 0;

    constructor(props: FileReceiverProps) {
        this.props = props;
    }

    show() {
        const receivingId = `receiving-${this.props.meta.sessionId}`;
        const html = `
            <div class="file-progress" id="${receivingId}">
                <div class="fileinfo">
                    <a class="download" href="#">${this.props.meta.name}(${getCapacityLabel(this.props.meta.size)})</a>
                </div>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>`;
        this.props.addChatItem(this.props.senderId, this.props.senderName, html, false);

        this.receivingElement = $("#" + receivingId);
        this.progressElement = this.receivingElement.find(".progress-bar");
        this.downloadElement = this.receivingElement.find(".download");
        this.receivingElement.closest(".usermessage").css("white-space", "nowrap");
    }

    readFileData(data: ArrayBuffer) {
        debugger;
        this.receiveBuffer.push(data);
        this.size += data.byteLength;

        const percent = Math.floor(this.size / this.props.meta.size * 100);
        this.progressElement.attr("aria-valuenow", percent);
        this.progressElement.css("width", percent + "%");

        if (this.size >= this.props.meta.size) {
            const received = new Blob(this.receiveBuffer);
            this.downloadElement.attr('href', URL.createObjectURL(received));
            this.downloadElement.attr('download', this.props.meta.name);

            this.props.onFinished(
                this.props.meta.sessionId,
                this.props.meta.name,
                "Receive finished");
        }
    }

}