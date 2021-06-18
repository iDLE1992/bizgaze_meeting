"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfo = void 0;
var UserInfo = /** @class */ (function () {
    function UserInfo() {
        this.Id = ""; //connectionId
        //BG_Id: string;
        this.Jitsi_Id = "";
        this.Name = "";
        this.IsHost = false;
        this.IsAnonymous = false;
        this.mediaPolicy = { useCamera: false, useMic: false };
    }
    return UserInfo;
}());
exports.UserInfo = UserInfo;
//# sourceMappingURL=BGUser.js.map