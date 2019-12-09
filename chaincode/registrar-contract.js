'use strict';

const {Contract} = require('fabric-contract-api');
const utilsclass = require('./utils');

class RegistrarContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet-registrar');
		global.utils = new utilsclass();

        //These Global variables are used to store the organisation names of the organisations participating in the network.
		global.usersOrg = 'users.pharma-network.com';
		global.registrarOrg = 'registrar.pharma-network.com'
	}
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('pharmanet-Registrar Smart Contract Instantiated');
    }
    
    	/**
	 * Create a request to registrar for registering on the network
	 * @param ctx - The transaction Context object
	 * @param name - Name of the user who is initiating the request
	 * @param aadharNo - Aadhar Number of the user
	 */
	async approveNewUser(ctx, name, aadharNo)
	{
		utils.validateInitiator(ctx, registrarOrg);
		const requestKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users.requests', [name,aadharNo]);
		const newUserKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
		let requestObject = await utils.getData(ctx, requestKey);
		let newUserObject={
			requestID: requestKey,
			name: requestObject.name,
			email: requestObject.email,
			aadharNo: requestObject.aadharNo,
			phone: requestObject.phone,
			upgradCoins: 0,
			createdAt: new Date()
		};
		console.log(newUserObject);
		await utils.putData(ctx, newUserKey, newUserObject);
		return newUserObject;
    }

    /**
     * 
     * @param {*} ctx  The Transaction Context
     * @param {*} name Name of the user
     * @param {*} aadharNo Aadhar no of the user
     */
    
	async viewUser(ctx, name, aadharNo)
	{
		const userKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
        let userObject= await utils.getData(ctx, userKey);
        console.log(userObject);
        return userObject;
	}
    
    /**
     * 
     * @param {*} ctx The Transaction Context
     * @param {*} propertyID Property ID which has to be approved by the registrar
     */

    async approvePropertyRegistration(ctx, propertyID)
	{
		utils.validateInitiator(ctx, registrarOrg);
		const requestKey= ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property.requests', [propertyID]);
		const propertyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property', [propertyID]);	
		let requestObject = await utils.getData(ctx, requestKey);
		if (requestObject !== undefined)
		{
			let newPropertyObject={
				propertyID: propertyKey,
				owner: requestObject.owner,
				price: requestObject.price,
				status: 'registered'
			};
			await utils.putData(ctx, propertyKey, newPropertyObject);
		}
		else
			throw new Error('Request for PropertyID: '+ propertyID + ' not registered');
    }

    /**
     * 
     * @param {*} ctx Transaction Context
     * @param {*} propertyID Property ID of the property which has to be viewed
     */
    
    async viewProperty(ctx, propertyID)
	{
		const propertyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property', [propertyID]);
		let propertyObject= await utils.getData(ctx, propertyKey);
		return propertyObject;
	}
}

module.exports = RegistrarContract;