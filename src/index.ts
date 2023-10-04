import chalk from "../node_modules/chalk/source/index";
import { List, Map } from "../node_modules/immutable/dist/immutable";
import Machine from "./machine";
import { contains, isNotEmptyEmptyArray, isNotEmptyString, isOneCharString } from "./tools";
import Transition from "./transition";
var figlet = require("figlet");

const AVAILABLE_HEAD_MOVEMENTS: Array<string> = ["LEFT", "RIGHT"];

function getTransistions(transitions: List<any>): Map<any, any> {
    return (
        Map(
            Object.entries(transitions)
        )
    );
}

function getMachine(machineRaw: Map<any, any>): Machine {
    return ({
        name: machineRaw.get("name"),
        alphabet: machineRaw.get("alphabet"),
        blank: machineRaw.get("blank"),
        states: machineRaw.get("states"),
        initial: machineRaw.get("initial"),
        finals: machineRaw.get("finals"),
        transitions: getTransistions(machineRaw.get("transitions"))
    })
}

function getIsHelpAsked(argv: Array<string>): boolean {
    return (argv[2] == "-h" || argv[2] == "--help");
}

function checkTransitions(
    machine: {
        name: string,
        alphabet: Array<string>,
        blank: string,
        states: Array<string>,
        initial: string,
        finals: string,
    },
    transitions: any
): boolean {
    const emptyTransitions = (
        Object.entries(transitions).map(
            (v: Array<any>) => {
                return (v[1].length === 0)
            }
        )
    ).filter((v) => v);
    const wrongTransitions = (
        Object.entries(transitions).map(
            (v: Array<any>) => {
                return (
                    v[1].filter((t: any) => {
                        return (
                            (
                                t.read == undefined ||
                                typeof t.read != "string" ||
                                machine.alphabet.indexOf(t.read) == -1
                            ) ||
                            (
                                t.to_state == undefined ||
                                typeof t.to_state != "string" ||
                                machine.states.indexOf(t.to_state) == -1
                            ) ||
                            (
                                t.write == undefined ||
                                typeof t.write != "string" ||
                                machine.alphabet.indexOf(t.write) == -1
                            ) ||
                            (
                                t.action == undefined ||
                                typeof t.action != "string" ||
                                AVAILABLE_HEAD_MOVEMENTS.indexOf(t.action) == -1
                            )
                        );
                    })
                );
            }
        )
    ).filter((v) => v.length > 0);
    return (emptyTransitions.length === 0 && wrongTransitions.length === 0);
}

function parseJson(rawJson: any): boolean {
    return (
        rawJson.name != undefined && isNotEmptyString(rawJson.name) &&
        rawJson.alphabet != undefined && isNotEmptyEmptyArray(rawJson.alphabet) &&
        rawJson.blank != undefined && isOneCharString(rawJson.blank) &&
        rawJson.states != undefined && isNotEmptyEmptyArray(rawJson.states) &&
        rawJson.initial != undefined && isNotEmptyString(rawJson.initial) &&
        (
            rawJson.finals != undefined &&
            isNotEmptyEmptyArray(rawJson.finals) &&
            contains<string>(rawJson.states, rawJson.finals) == true
        ) &&
        (
            rawJson.transitions != undefined &&
            typeof rawJson.transitions == "object" &&
            checkTransitions(rawJson, rawJson.transitions)
        )
    );
}

function exitJsonIncorrect() {
    console.error("Json incorrect");
    process.exit(1);
}

const HELPMESSAGE = `
./ft_turing --help
usage: ft_turing [-h] jsonfile input

positional arguments:
  jsonfile json description of the machine

  input input of the machine

optional arguments:
  -h, --help show this help message and exit
`;

function printMachine(machine: Machine) {
    console.clear();
    console.log(figlet.textSync(machine.name));
    console.log("--------------------------------------------------------");
    console.log(`Alphabet : [${machine.alphabet}]`);
    console.log(`States : [${machine.states}]`);
    console.log(`Initial : ${machine.initial}`);
    console.log(`Finals : [${machine.finals}]`);
    console.log("--------------------------------------------------------");
    machine.transitions.forEach((a: Array<Transition>, key: string) => {
        a.forEach((t: Transition) => {
            console.log(`(${key}, ${t.read}) -> (${t.to_state}, ${t.write}, ${t.action})`);
        });
    });
    console.log("--------------------------------------------------------");
}

function getStateTransitionMap(
    src: Map<string, Array<Transition>>
// ): Map<stateName, Map<readChar, Transition>> {
): Map<string, Map<string, Transition>> {
    return (
        src.map(
            (v: Array<Transition>, key: string) => {
                return (Map(v.map(obj => [obj.read, obj])));
            }
        )
    );
}

function printTape(
    machine: Machine,
    transition: Transition,
    tape: List<string>,
    tapeIndex: number,
    localIndex: number = 0,
    padding: number = 25,
) {
    if (localIndex === tape.size && padding === 0) {
        return ;
    } else if (localIndex === tape.size && padding > 0) {
        process.stdout.write(machine.blank);
        printTape(
            machine,
            transition,
            tape,
            tapeIndex,
            localIndex,
            padding - 1
        );
        return ;
    }
    if (tapeIndex === localIndex) {
        process.stdout.write(
            chalk.bgYellow(
                chalk.redBright(tape.get(localIndex))
            ) || machine.blank
        );
    } else {
        process.stdout.write(tape.get(localIndex) || machine.blank);
    }
    printTape(
        machine,
        transition,
        tape,
        tapeIndex,
        localIndex + 1,
        padding - 1
    );
}

function printCurrState(
    machine: Machine,
    currState: string,
    transition: Transition,
    tape: List<string>,
    tapeIndex: number,
) {
    process.stdout.write("[");
    printTape(
        machine,
        transition,
        tape,
        tapeIndex,
    );
    console.log(
        `] (${currState}, ${transition.read}) -> ` +
        `(${transition.to_state}, ${transition.write}, ${transition.action})`
    );
}

async function startMachine(
    machine: Machine,
    tape: List<string>,
    stateTransitionMap: Map<string, Map<string, Transition>>,
    tapeIndex = 0,
    currState = machine.initial
): Promise<void> {
    const transitions: Map<string, Transition> | undefined = (
        stateTransitionMap.get(currState)
    );
    if (transitions != undefined) {
        const currCharTape = tape.get(tapeIndex) || machine.blank;
        const transition = transitions.get(currCharTape);
        if (transition == undefined) {
            throw new Error(`For state ${currState}, reading ${currCharTape} doesn't have a transition`);
        }
        printCurrState(machine, currState, transition, tape, tapeIndex);
        if (machine.finals.includes(transition.to_state) === false) {
            // await Bun.sleep(500);
            startMachine(
                machine,
                tape.set(tapeIndex, transition.write),
                stateTransitionMap,
                tapeIndex + (
                    2 * AVAILABLE_HEAD_MOVEMENTS.indexOf(transition.action) - 1
                ),
                transition.to_state,
            );
        } else {
            console.log("--------------------------------------------------------");
            process.stdout.write("Final tape result is : [");
            tape.set(tapeIndex, transition.write).toArray().forEach(
                (v) => process.stdout.write(v)
            )
            console.log("]");
        }
    } else {
        throw new Error(`state ${currState} not found`);
    }
}

async function main(argv: Array<string>) {
    if (getIsHelpAsked(argv) == true || argv.length != 4) {
        console.log(HELPMESSAGE);
    } else {
        const file = Bun.file(argv[2]);
        const rawJson = (await file.json());
        const parseOrFail = (parseJson(rawJson)) ? getMachine : exitJsonIncorrect;
        const machine = parseOrFail(Map(rawJson));
        try {
            if (machine) {
                printMachine(machine);
                await startMachine(
                    machine,
                    List(argv[3]),
                    getStateTransitionMap(machine.transitions)
                );
            }
        } catch (error) {
            console.error(`Machine error: ${error}`);
        }
    }
}

await main(Bun.argv);
