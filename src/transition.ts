export default class Transition {
    readonly read: string;
    readonly to_state: string;
    readonly write: string;
    readonly action: string;

    constructor (c: Transition) {
        this.read = c.read;
        this.to_state = c.to_state;
        this.write = c.write;
        this.action = c.action;
    }
}
