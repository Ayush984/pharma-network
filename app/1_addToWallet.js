'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: REGISTRAR_ADMIN
 *  User Organization: REGISTRAR
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored



async function main(certificatePath, privateKeyPath, org) {

	// Main try/catch block
	try {
		// A wallet is a filesystem path that stores a collection of Identities
		const wallet = new FileSystemWallet('./identity/'+org);
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = org+'_admin';
		const msp = org+'MSP';
		const identity = X509WalletMixin.createIdentity(msp, certificate, privatekey);

		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

/*main('/home/upgrad/workspace/property-registration-network/network/crypto-config/peerOrganizations/registrar.property-registration-network.com/users/Admin@registrar.property-registration-network.com/msp/signcerts/Admin@registrar.property-registration-network.com-cert.pem', '/home/upgrad/workspace/property-registration-network/network/crypto-config/peerOrganizations/registrar.property-registration-network.com/users/Admin@registrar.property-registration-network.com/msp/keystore/f5fdf4750c6fb5b2d48f7892b861604e1068fb1e3f8389d7248c3aab5e48f8f2_sk').then(() => {
  console.log('User identity added to wallet.');
});*/

module.exports.execute = main;
