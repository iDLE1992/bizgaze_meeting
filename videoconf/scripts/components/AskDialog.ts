import { NotificationType } from "../enum/NotificationType";
import { JitsiCommand } from "../protocol/jitsi";
import { randomNumber, randomSessonId } from "../util/random";

export class AskDialogProps {
    title: string;
    message: string;
    icon: NotificationType;
    allowCallback: Function;
    denyCallback: Function;
    param: any;
    isWarning: boolean;
}

export class AskDialog {
    props: AskDialogProps;

    allowButtonElement: HTMLElement;
    denyButtonElement: HTMLElement;
    root: HTMLElement;

    constructor(props: AskDialogProps) {
        this.props = props;
    }

    show() {
        const allowButtonId = "allow-" + randomSessonId();
        const denyButtonId = "deny-" + randomSessonId();

        const content = `${this.props.message}
            <p>
                <a href="#" id="${allowButtonId}" class="btn btn-sm">Accept</button>
                <a href="#" id="${denyButtonId}" class="btn btn-sm">Deny</button>
            </p>`;

        $.toast({
            heading: this.props.title,
            text: content,
            showHideTransition: 'slide',
            hideAfter: false,
            bgColor: this.props.isWarning ? "#800000" : "#164157",
            icon: this.props.icon,
            stack: 5,
            loader: false,
            afterShown: ()=>{
                this.allowButtonElement = document.getElementById(allowButtonId);
                this.denyButtonElement = document.getElementById(denyButtonId);
                this.root = $(this.allowButtonElement).closest(".jq-toast-wrap")[0];
                this.attachHandlers();
            }
        });
    }

    attachHandlers() {
        this.allowButtonElement.addEventListener('click', () => {
            if (typeof this.props.allowCallback === "function")
                this.props.allowCallback(this.props.param);
            (this.root).remove();
        });
        this.denyButtonElement.addEventListener('click', () => {
            if (typeof this.props.denyCallback === "function") {
                this.props.denyCallback(this.props.param);
            }
            $(this.root).remove();
        });
    }

}