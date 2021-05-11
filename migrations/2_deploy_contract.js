const Mwdao = artifacts.require("Mwdao");
const MwdaoCharity2020 = artifacts.require("MwdaoCharity2020");

module.exports = async function(deployer) {
  await deployer.deploy(Mwdao, 100);
  await deployer.deploy(MwdaoCharity2020, Mwdao.address);
};
