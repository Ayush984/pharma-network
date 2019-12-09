'use strict';

const {Contract} = require('fabric-contract-api');
const utilsclass = require('./utils');
class UsersContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet-users');
        global.utils = new utilsclass();
        //These Global variables are used to store the organisation names of the organisations participating in the network.
		global.usersOrg = 'users.pharma-network.com';
		global.registrarOrg = 'registrar.pharma-network.com'
    }
    

	async instantiate(ctx) {
		console.log('pharmanet-Users Smart Contract Instantiated');
    }
    /**
	 * Create a request to registrar for registering on the network
	 * @param ctx - The transaction Context object
	 * @param name - Name of the user who is initiating the request
	 * @param email - Email Id of the user
	 * @param phone - Phone number of the user
	 * @param aadharNo - Aadhar Number of the user
	 * @param accoutNumber- Bank account Number of the user
	 */
	async requestNewUser(ctx, name, email, phone, aadharNo)
	{
		// Create a new composite key for the new request
		const requestKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users.requests', [name,aadharNo]);
		// Create a request object for creation of new 
		//utils.validateInitiator(ctx,'users.pharma-network.com');
		console.log(requestKey);
		let newRequestObject={
			requestID: requestKey,
			name: name,
			email: email,
			aadharNo: aadharNo,
			phone: phone,
			createdAt: new Date()
		};
        utils.putData(ctx, requestKey, newRequestObject);
		// Return value of new student account created to user
		return newRequestObject;
    }
    


/**
 * rechargeAccount() is used to recharge the user's account with upgradCoins
 * @param ctx - context object
 * @param bankTransactionID -  Proof that the transaction is done of the requisite amount
 * @param name - Name of the user 
 * verifyTransactionfromBank() function is called within this function to validate the bankTransactionID passed as input parameter
 */

	async rechargeAccount(ctx, name, aadharNo, bankTransactionID)
	{
		//utils.validateInitiator(ctx, this.usersOrg);
		const userKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
		let userObject= await utils.getData(ctx, userKey);
		let numUpgradCoins= utils.verifyTransactionfromBank(bankTransactionID);

		if (numUpgradCoins != -1)
		{
			userObject.upgradCoins= userObject.upgradCoins+numUpgradCoins;
            await utils.putData(ctx, userKey,userObject);
		}
		else{
			throw new Error('Not allowed to update balance: Invalid Bank Transaction ID' );
		}
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
     * Request to register the property on the system
     * @param {*} ctx Transaction Context
     * @param {*} name Name of the owner of the proeprty
     * @param {*} aadharNo Aadhar number of the owner of the property
     * @param {*} propertyID Property ID of the property
     * @param {*} price Price of the property
     */
	async propertyRegistrationRequest(ctx, name, aadharNo, propertyID, price)
	{
		//utils.validateInitiator(ctx, this.usersOrg);
		const requestKey= ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property.requests', [propertyID]);
		const userKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
		let userBuffer= await ctx.stub.getState(userKey).catch(err => console.log(err));
		if (userBuffer.length === 0)
			throw new Error('Not allowed to register Property: User not registered on the system' );
		else
		{
			let newRequestObject={
				requestID: requestKey,
				owner: userKey,
				price: parseInt(price),
				status: 'registered'
			};
            await utils.putData(ctx, requestKey,newRequestObject);
			return newRequestObject;
		}
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

    /**
     * Function to change the status of the property 
     * @param {*} ctx Transaction Context
     * @param {*} propertyID Property ID of the property
     * @param {*} name Name of the owner
     * @param {*} aadharNo Aadhar number of the owner
     * @param {*} status New status of the property
     */
	async updateProperty(ctx, propertyID, name, aadharNo, status)
	{
		//utils.validateInitiator(ctx, this.usersOrg);
		const owner= ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
		const propertyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property', [propertyID]);
		let propertyObject= await utils.getData(ctx,propertyKey);
		if (propertyObject.owner == owner)
		{
			propertyObject.status= status;
            await utils.putData(ctx, propertyKey, propertyObject);
		}
		else
			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not authorised to make this transaction');
    }
    
    /**
     * 
     * @param {*} ctx Transaction Context
     * @param {*} propertyID Property ID of the property
     * @param {*} name Name of the Buyer
     * @param {*} aadharNo Aadhar Number of the buyer
     */

	async purchaseProperty(ctx, propertyID, name, aadharNo)
	{
		//utils.validateInitiator(ctx, this.usersOrg);
		const buyerKey= ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.users', [name,aadharNo]);
		let buyerObject = await utils.getData(ctx, buyerKey);
		console.log(buyerObject);
		const propertyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.property', [propertyID]);
		let propertyObject= await utils.getData(ctx,propertyKey);
		let sellerKey= propertyObject.owner;
		let sellerBuffer = await ctx.stub.getState(sellerKey).catch(err => console.log(err));
		let sellerObject= JSON.parse(sellerBuffer.toString());

		if (buyerObject === undefined)
			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not registered on the property registration network');
		if (propertyObject.status !== 'onSale')
			throw new Error('Property with PropertyID: '+ propertyID + 'not registered for sale. Please contact the owner of the property. :)');
		
		if (buyerObject.upgradCoins >= propertyObject.price)
		{
			propertyObject.owner=buyerKey;
			propertyObject.status = 'registered';
			sellerObject.upgradCoins += propertyObject.price;
			buyerObject.upgradCoins -= propertyObject.price;
            await utils.putData(ctx, propertyKey, propertyObject);
            await utils.putData(ctx, sellerKey, sellerObject);
            await utils.putData(ctx, buyerKey, buyerObject);
		}
		else
			throw new Error('Buyer has insufficient funds');
	}	

}
module.exports = UsersContract;
