"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitsiPrivateCommandQueue = exports.JitsiCommandQueue = void 0;
var JitsiCommandCallback = /** @class */ (function () {
    function JitsiCommandCallback() {
    }
    return JitsiCommandCallback;
}());
var JitsiCommandQueue = /** @class */ (function () {
    function JitsiCommandQueue() {
        this.callbacks = new Map();
    }
    JitsiCommandQueue.prototype.reset = function () {
        this.callbacks.clear();
    };
    JitsiCommandQueue.prototype.queueCommand = function (jitsiId, command, param, callback) {
        if (!this.callbacks.has(jitsiId)) {
            this.callbacks.set(jitsiId, []);
        }
        var cb = new JitsiCommandCallback();
        cb.command = command;
        cb.param = param;
        cb.callback = callback;
        this.callbacks.get(jitsiId).push(cb);
    };
    JitsiCommandQueue.prototype.executeQueuedCommands = function (jitsiId) {
        if (!this.callbacks.has(jitsiId))
            return;
        var cbs = this.callbacks.get(jitsiId);
        cbs.forEach(function (cb, index) {
            debugger;
            cb.callback(cb.param);
        });
        this.callbacks.delete(jitsiId);
    };
    return JitsiCommandQueue;
}());
exports.JitsiCommandQueue = JitsiCommandQueue;
var JitsiPrivateCommandCallback = /** @class */ (function () {
    function JitsiPrivateCommandCallback() {
    }
    return JitsiPrivateCommandCallback;
}());
var JitsiPrivateCommandQueue = /** @class */ (function () {
    function JitsiPrivateCommandQueue() {
        this.callbacks = new Map();
    }
    JitsiPrivateCommandQueue.prototype.reset = function () {
        this.callbacks.clear();
    };
    JitsiPrivateCommandQueue.prototype.queueCommand = function (jitsiId, command, message, callback) {
        if (!this.callbacks.has(jitsiId)) {
            this.callbacks.set(jitsiId, []);
        }
        var cb = new JitsiPrivateCommandCallback();
        cb.command = command;
        cb.message = message;
        cb.callback = callback;
        this.callbacks.get(jitsiId).push(cb);
    };
    JitsiPrivateCommandQueue.prototype.executeQueuedCommands = function (jitsiId) {
        if (!this.callbacks.has(jitsiId))
            return;
        var cbs = this.callbacks.get(jitsiId);
        cbs.forEach(function (cb, index) {
            cb.callback(jitsiId, cb.command, cb.message);
        });
        this.callbacks.delete(jitsiId);
    };
    return JitsiPrivateCommandQueue;
}());
exports.JitsiPrivateCommandQueue = JitsiPrivateCommandQueue;
//# sourceMappingURL=JitsiCommandQueue.js.map