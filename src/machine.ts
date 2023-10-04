import { List, Map } from "../node_modules/immutable/dist/immutable";
import Transition from "./transition";

export default class Machine {
    readonly name: string;
    readonly alphabet: List<string>;
    readonly blank: string;
    readonly states: List<string>;
    readonly initial: string;
    readonly finals: List<string>;
    readonly transitions: Map<string, Array<Transition>>;

    constructor(c: Machine) {
        this.name = c.name;
        this.alphabet = c.alphabet;
        this.blank = c.blank;
        this.states = c.states;
        this.initial = c.initial;
        this.finals = c.finals;
        this.transitions = c.transitions;
    }
}
