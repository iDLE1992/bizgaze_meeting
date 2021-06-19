import { JitsiCommand, JitsiPrivateCommand } from "../protocol/jitsi";
import { JitsiCommandParam } from "./JitsiCommandParam";

class JitsiCommandCallback {
    command: JitsiCommand; //only for debug
    param: JitsiCommandParam;
    callback: Function;
}

export class JitsiCommandQueue {
    callbacks: Map<string, JitsiCommandCallback[]> = new Map();

    reset() {
        this.callbacks.clear();
    }

    queueCommand(jitsiId: string, command: JitsiCommand, param: JitsiCommandParam, callback: Function) {
        if (!this.callbacks.has(jitsiId)) {
            this.callbacks.set(jitsiId, []);
        }

        const cb = new JitsiCommandCallback();
        cb.command = command;
        cb.param = param;
        cb.callback = callback;

        this.callbacks.get(jitsiId).push(cb);
    }

    executeQueuedCommands(jitsiId: string) {
        if (!this.callbacks.has(jitsiId))
            return;

        const cbs = this.callbacks.get(jitsiId);
        cbs.forEach((cb, index) => {
            debugger;
            cb.callback(cb.param);
        });
        this.callbacks.delete(jitsiId);
    }
}

class JitsiPrivateCommandCallback {
    command: JitsiPrivateCommand; //only for debug
    message: any;
    callback: Function;
}

export class JitsiPrivateCommandQueue {
    callbacks: Map<string, JitsiPrivateCommandCallback[]> = new Map();

    reset() {
        this.callbacks.clear();
    }

    queueCommand(jitsiId: string, command: JitsiPrivateCommand, message:any, callback: Function) {
        if (!this.callbacks.has(jitsiId)) {
            this.callbacks.set(jitsiId, []);
        }

        const cb = new JitsiPrivateCommandCallback();
        cb.command = command;
        cb.message = message;
        cb.callback = callback;

        this.callbacks.get(jitsiId).push(cb);
    }

    executeQueuedCommands(jitsiId: string) {
        if (!this.callbacks.has(jitsiId))
            return;

        const cbs = this.callbacks.get(jitsiId);
        cbs.forEach((cb, index) => {
            cb.callback(jitsiId, cb.command, cb.message);
        });
        this.callbacks.delete(jitsiId);
    }
}