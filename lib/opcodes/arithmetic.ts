import { Opcode } from "./common";
import { Environment, IMachineState } from "../BytecodeRunner";
import { MAX_UINT_256 } from "../utils/bytes";

export class StopOpcode extends Opcode {
  static id = 0x00;
  static type = "STOP";

  run(_env: Environment, state: IMachineState): void {
    state.stopped = true;
  }
}

export class AddOpcode extends Opcode {
  static id = 0x01;
  static type = "ADD";

  run(_env: Environment, state: IMachineState): void {
    const arg1 = state.stack.pop();
    const arg2 = state.stack.pop();

    if (arg1 === null || arg1 === undefined) {
      throw new Error("Error while adding. Arg1 is undefined!");
    }

    if (arg2 === null || arg2 === undefined) {
      throw new Error("Error while adding. Arg2 is undefined!");
    }

    const result = arg1.add(arg2).mod(MAX_UINT_256);

    state.pc += 1;
    state.stack.push(result);
  }
}

export class MulOpcode extends Opcode {
  static id = 0x02;
  static type: "MUL";

  run(_env: Environment, state: IMachineState): void {
    const arg1 = state.stack.pop();
    const arg2 = state.stack.pop();

    if (arg1 === null || arg1 === undefined) {
      throw new Error("Error while adding. Arg1 is undefined!");
    }

    if (arg2 === null || arg2 === undefined) {
      throw new Error("Error while adding. Arg2 is undefined!");
    }

    const result = arg1.mul(arg2).mod(MAX_UINT_256);

    state.pc += 1;
    state.stack.push(result);
  }
}
