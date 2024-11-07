import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ContractsModule = buildModule("EcoCollectModule", (m) => {

  const name = "EcoToken";
  const symbol = "ETK";
  const initialSupply = 1000000;
  const owner = "0x40feacdeee6f017fA2Bc1a8FB38b393Cf9022d71"

  const token = m.contract("EcoToken", [name, symbol, initialSupply]);

  const contractAddr = m.contract("EcoCollect", [token, owner]);



  return { token, contractAddr };
});

export default ContractsModule;
