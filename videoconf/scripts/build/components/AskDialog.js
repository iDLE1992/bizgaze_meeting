"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskDialog = exports.AskDialogProps = void 0;
var random_1 = require("../util/random");
var AskDialogProps = /** @class */ (function () {
    function AskDialogProps() {
    }
    return AskDialogProps;
}());
exports.AskDialogProps = AskDialogProps;
var AskDialog = /** @class */ (function () {
    function AskDialog(props) {
        this.props = props;
    }
    AskDialog.prototype.show = function () {
        var _this = this;
        var allowButtonId = "allow-" + random_1.randomSessonId();
        var denyButtonId = "deny-" + random_1.randomSessonId();
        var content = this.props.message + "\n            <p>\n                <a href=\"#\" id=\"" + allowButtonId + "\" class=\"btn btn-sm\">Accept</button>\n                <a href=\"#\" id=\"" + denyButtonId + "\" class=\"btn btn-sm\">Deny</button>\n            </p>";
        $.toast({
            heading: this.props.title,
            text: content,
            showHideTransition: 'slide',
            hideAfter: false,
            bgColor: this.props.isWarning ? "#800000" : "#164157",
            icon: this.props.icon,
            stack: 5,
            loader: false,
            afterShown: function () {
                _this.allowButtonElement = document.getElementById(allowButtonId);
                _this.denyButtonElement = document.getElementById(denyButtonId);
                _this.root = $(_this.allowButtonElement).closest(".jq-toast-wrap")[0];
                _this.attachHandlers();
            }
        });
    };
    AskDialog.prototype.attachHandlers = function () {
        var _this = this;
        this.allowButtonElement.addEventListener('click', function () {
            if (typeof _this.props.allowCallback === "function")
                _this.props.allowCallback(_this.props.param);
            (_this.root).remove();
        });
        this.denyButtonElement.addEventListener('click', function () {
            if (typeof _this.props.denyCallback === "function") {
                _this.props.denyCallback(_this.props.param);
            }
            $(_this.root).remove();
        });
    };
    return AskDialog;
}());
exports.AskDialog = AskDialog;
//# sourceMappingURL=AskDialog.js.map