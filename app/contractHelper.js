const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function getContractInstance(org) {
	
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-iit.yaml
	gateway = new Gateway();
	
	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user USERS_ADMIN was initially added to this wallet.
	const wallet = new FileSystemWallet('./identity/'+org);
	console.log(wallet);
	
	// What is the username of this Client user accessing the network?
	const fabricUserName = org+'_admin';
	console.log(fabricUserName);
	
	const file = './connection-profile-'+org+'.yaml';
	console.log(file);
	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};
	console.log('.....Connecting to Fabric Gateway');
        
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access property registration channel
	console.log('.....Connecting to channel - registrationchannel');
	const channel = await gateway.getNetwork('registrationchannel');
	
	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to regnet Smart Contract');
	const contract = 'org.property-registration-network.regnet-'+org;
	return channel.getContract('regnet', contract);
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;
