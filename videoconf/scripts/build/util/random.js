"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSessonId = exports.randomNumber = void 0;
var TimeUtil_1 = require("./TimeUtil");
function randomNumber() {
    return randomFromInterval(1, 100000000);
}
exports.randomNumber = randomNumber;
function randomSessonId() {
    return TimeUtil_1.getCurrentTimestamp() + "-" + randomNumber();
}
exports.randomSessonId = randomSessonId;
function randomFromInterval(from, to) {
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
//# sourceMappingURL=random.js.map