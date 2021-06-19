import { getCurrentTimestamp } from "./TimeUtil";

export function randomNumber(): number {
    return randomFromInterval(1, 100000000);
}

export function randomSessonId(): string {
    return getCurrentTimestamp() + "-" + randomNumber();
}

function randomFromInterval(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from + 1) + from);
}


/*interface ProvideFeedbackFormProps {
    feedbackNature: FormikDropdownProps
    waybillNumber: FormikDropdownProps
    provideFeedback: FormikDropdownProps
    editorState?: string
    attachments?: string[]
}


interface FormikDropdownProps {
    id: number
    value: string
}

const values: ProvideFeedbackFormProps = {};
const customFields: string[] = [];

for (const property in values) {
    const customField = values[property as keyof ProvideFeedbackFormProps]
    customFields.push(customField)
}*/