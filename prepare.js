const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: nodejs prepare.js required_confirmations partner1_eth partner2_eth [partner3_eth ...]'); // eslint-disable-line no-console
  process.exit(1);
}

const amount = new web3.BigNumber(web3.toWei(args[0], 'ether'));

for (let i = 1; i < args.length; i += 1) {
  if (!web3.isAddress(args[i])) {
    console.log(`Invalid address: ${args[i]}`); // eslint-disable-line no-console
    process.exit(1);
  }
}
const code = fs.readFileSync('contracts/MultiSigWallet.sol', 'utf8');
const output = solc.compile(code, 1);

console.log(`Using solc ${solc.version()}, optimization on.`); // eslint-disable-line no-console

const contract = output.contracts[':MultiSigWallet'];
const factory = web3.eth.contract(JSON.parse(contract.interface));

const byteCode = factory.new.getData(args.slice(1), amount, { data: contract.runtimeBytecode });
const params = byteCode.substr(contract.runtimeBytecode.length, byteCode.length - contract.runtimeBytecode.length);
fs.writeFileSync('bytecode.txt', byteCode);
fs.writeFileSync('arguments.txt', params);
console.log('Files created: bytecode.txt and arguments.txt.'); // eslint-disable-line no-console
