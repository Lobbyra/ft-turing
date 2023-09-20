let usageMsg = "
./ft_turing --help
usage: ft_turing [-h] jsonfile input

positional arguments:
  jsonfile json description of the machine

  input input of the machine

optional arguments:
  -h, --help show this help message and exit
"

open Core
open Yojson.Basic.Util

(* Define a type for a transition *)
(* type transition = {
  read: string;
  to_state: string;
  write: string;
  action: string;
} *)

(* Define a type for the transitions associated with a state *)
(* type state_transitions = transition list *)

(* Define a type for the transitions mapping from state names to state transitions *)
(* type transitions_map = (string * state_transitions) list *)


let isHelpArg = ref false
let input = ref ""
let machinePath = ref ""

let anonFun arg =
  match !machinePath, !input with
  | "", _ -> machinePath := arg
  | _, "" -> input := arg
  | _ -> raise (Failure ("Unknown argument [" ^ arg ^ "]"))

let speclist = [
  ("-h", Arg.Set isHelpArg, "Display the usage message");
  ("--help", Arg.Set isHelpArg, "Display the usage message");
]

let name = ref ""
let alphabet = ref []
let blank = ref ""
let states = ref []
let initial = ref ""
let finals = ref []
(* let transitions = ref *)

let turing () = Printf.printf "MACHIIIIIIIIIINE"

let parseJsonFile () =
  let json = Yojson.Basic.from_file !machinePath in
  let nameJs = json |> member "name" |> to_string in
  let alphabetJs = json |> member "alphabet" |> to_list |> filter_string in
  let blankJs = json |> member "blank" |> to_string in
  let statesJs = json |> member "states" |> to_list |> filter_string in
  let initialJs = json |> member "initial" |> to_string in
  let finalsJs = json |> member "finals" |> to_list |> filter_string in
  (* let transitionsJs = json |> member "transitions" in *)
  name := nameJs;
  alphabet := alphabetJs;
  blank := blankJs;
  states := statesJs;
  initial := initialJs;
  finals := finalsJs
  (* let transitions = transitionsJs
    |> to_assoc
    |> List.map (fun (state, transitionsJs) -> (state, List.map (fun transitionsJs -> transitionsJs |> to_record) transitionsJs) ) *)

let logFileData () =
  Printf.printf "Machine name: [%s]\n" !name;
  Printf.printf "Alphabet: [%s]\n" (String.concat ~sep:", " !alphabet);
  Printf.printf "Blank: [%s]\n" !blank;
  Printf.printf "States: [%s]\n" (String.concat ~sep:", " !states);
  Printf.printf "Initial: [%s]\n" !initial;
  Printf.printf "Finals: [%s]\n" (String.concat ~sep:", " !finals)

let () =
  try
    Arg.parse speclist anonFun usageMsg;
    if !isHelpArg then
      Printf.printf "%s" usageMsg
    else
      parseJsonFile();
      logFileData();
      turing()
  with
  | Failure msg ->
    Printf.printf "ERROR: %s\n" msg;
  | Sys_error msg ->
    Printf.printf "ERROR [FILE ERROR]: %s\n" msg;
  | Yojson.Json_error msg ->
    Printf.printf "ERROR [JSON PARSING]: %s\n" msg;
  | Yojson.Basic.Util.Type_error (msg, _) ->
    Printf.printf "ERROR [JSON TYPE ERROR]: %s\n" msg;
  | _ ->
    Printf.printf "Unexpected error";
