"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapacityLabel = exports.random = exports.avatarName = exports.stripHTMLTags = void 0;
function stripHTMLTags(text) {
    return text.replace(/(<([^>]+)>)/gi, "");
}
exports.stripHTMLTags = stripHTMLTags;
/*
 ajax example
 $.ajax({
        url: "http://localhost/myproject/ajax_url",
        type: "POST",
        data: $("#my-form").serialize(),
        dataType: 'json', // lowercase is always preferered though jQuery does it, too.
        success: function(){}
});
 
 
 */
function avatarName(name) {
    var unknown = "?";
    if (!name || name.length <= 0)
        return unknown;
    var nameParts = name.split(" ");
    var res = "";
    nameParts.forEach(function (p) {
        if (p.length > 0)
            res += p[0];
    });
    if (res.length <= 0)
        unknown;
    return res.toUpperCase().substr(0, 2);
}
exports.avatarName = avatarName;
var random = function (min, max) { return Math.floor(Math.random() * (max - min)) + min; };
exports.random = random;
function getCapacityLabel(bytes) {
    if (bytes < 1024)
        return bytes + " bytes";
    else if (bytes < 1024 * 1024) {
        var kb = bytes / 1024;
        return kb.toFixed(2) + " KB";
    }
    else {
        var mb = bytes / (1024 * 1024);
        return mb.toFixed(2) + " MB";
    }
}
exports.getCapacityLabel = getCapacityLabel;
//# sourceMappingURL=snippet.js.map