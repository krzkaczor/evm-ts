import * as fs from "fs";
import { join } from "path";
import * as Web3 from "web3";
const web3 = new Web3();

import {
  compareWithReferentialImpl,
  compareTransactionsWithReferentialImpl,
} from "./helpers/compareWithReferentialImpl";

function loadContract(fullName: string): { bin: string; abi: any; contract: any; instance: any } {
  const bin = fs.readFileSync(join(__dirname, "./contracts-compiled/", `${fullName}.bin`), "utf-8");
  const abi = JSON.parse(fs.readFileSync(join(__dirname, "./contracts-compiled", `${fullName}.abi`), "utf-8"));
  const contract = web3.eth.contract(abi);
  const instance = contract.at("0x0"); // used only to run getData so it's fine

  return { bin, abi, contract, instance };
}

describe("integration", () => {
  it("should work", () => compareWithReferentialImpl("60606040523415600e"));

  it("should work with 'simple' contract", () => {
    const { bin, instance } = loadContract("simple/Simple");

    return compareTransactionsWithReferentialImpl(async vm => {
      const deploymentResult = await vm.runTx({ data: bin });
      const contractAddress = deploymentResult.accountCreated;

      const callTestFunctionData: string = instance.test.getData().slice(2);
      await vm.runTx({ data: callTestFunctionData, to: contractAddress });
      await vm.runTx({ data: callTestFunctionData, to: contractAddress });
    });
  });

  it("should work with 'calls' contracts", () => {
    const counter = loadContract("calls/Counter");
    const caller = loadContract("calls/Caller");

    return compareTransactionsWithReferentialImpl(async vm => {
      const counterAddress = (await vm.runTx({ data: counter.bin })).accountCreated!;
      const callerConstructorData = caller.contract.new.getData(counterAddress, { data: caller.bin });

      const callerAddress = (await vm.runTx({
        data: callerConstructorData,
      })).accountCreated!;

      await vm.runTx({ to: callerAddress, data: caller.instance.performCall.getData().slice(2) });
      await vm.runTx({ to: callerAddress, data: caller.instance.performCallAndSaveReturn.getData().slice(2) });
    });
  });

  it("should work with 'various-calls' contracts", () => {
    const Caller = loadContract("various-calls/Caller");
    const Code = loadContract("various-calls/Code");

    return compareTransactionsWithReferentialImpl(async vm => {
      const codeAddress = (await vm.runTx({ data: Code.bin })).accountCreated!;

      const callerConstructorData = Caller.contract.new.getData(codeAddress, { data: Caller.bin });
      const callerAddress = (await vm.runTx({
        data: callerConstructorData,
      })).accountCreated!;

      await vm.runTx({ to: callerAddress, data: Caller.instance.callSetN.getData(1, false).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.delegatecallSetN.getData(2, false).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.callcodeSetN.getData(3, false).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.solCallSetN.getData(4, false).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.trampoline.getData(5, false).slice(2) });
    });
  });

  it("should work with 'various-calls' contracts when rejecting", () => {
    const Caller = loadContract("various-calls/Caller");
    const Code = loadContract("various-calls/Code");

    return compareTransactionsWithReferentialImpl(async vm => {
      const codeAddress = (await vm.runTx({ data: Code.bin })).accountCreated!;

      const callerConstructorData = Caller.contract.new.getData(codeAddress, { data: Caller.bin });
      const callerAddress = (await vm.runTx({
        data: callerConstructorData,
      })).accountCreated!;

      await vm.runTx({ to: callerAddress, data: Caller.instance.callSetN.getData(1, true).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.delegatecallSetN.getData(2, true).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.callcodeSetN.getData(3, true).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.solCallSetN.getData(4, true).slice(2) });
      await vm.runTx({ to: callerAddress, data: Caller.instance.trampoline.getData(5, true).slice(2) });
    });
  });
});
