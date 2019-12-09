'use strict';

const {Contract} = require('fabric-contract-api');
const utilsClasss = require('./utils');
class PharmanetContract extends Contract{
    constructor(){
        super('org.pharma-network.pharmanet');
        global.utils = new utilsClasss();
        global.manufacturerOrg = 'manufacturer.pharma-network.com';
        global.distributorOrg = 'distributor.pharma-network.com';
        global.retailerOrg = 'retailer.pharma-network.com';
        global.transporterOrg = 'transporter.pharma-network.com';
    }
    async instantiate(ctx){
        console.log('Pharmanet Smart Contract Instantiaited');   
    }

    /**
    * Register a new company on the network
    * @param {*} ctx - The transaction context object
    * @param {*} companyCRN - Company Registration Number of the Company that is being registered
    * @param {*} companyName - Name of the Comapny
    * @param {*} location - Location of the Company
    * @param {*} organisationRole - Role of the organisation to which the company belongs. It can be one of the following:
    * Manufacturer, Distributor, Retailer, Transporter
    */

   async registerCompany(ctx, companyCRN, companyName, location, organisationRole){

       // Create a new composite key for the company
       const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [companyCRN, companyName]);
       
       // Assign this company a hierarchy key based on the organisation role
       let key = await utils.assignKey(organisationRole);
       //console.log(key);

       // If the organisation role is Transporter then it will not have a hierarchy key
       if(key === 0 ){
        var companyObject = {
            name: companyName,
            location: location,
            organisationRole: organisationRole,
        }
       }
       else{
        var companyObject = {
            name: companyName,
            location: location,
            organisationRole: organisationRole,
            hierarchyKey: key
        }
       }
       // Convert JSON object to Buffer
       let dataBuffer = Buffer.from(JSON.stringify(companyObject));
       
       // Send the Buffer to blockchain for storage
       await ctx.stub.putState(companyKey, dataBuffer);
       console.log(companyObject);
       
       // Create a composite key to store the campany name
       var crnKey = ctx.stub.createCompositeKey('company.',[companyCRN]);
       var companyBuffer = Buffer.from(companyName);
       await ctx.stub.putState(crnKey, companyBuffer);
       var testBuffer = await ctx.stub.getState(crnKey);
       var testName = testBuffer.toString();
       console.log(testName);
       
       // Return value of the company object created to the user
       return companyObject;
   }

   /**
    * It is used by the manufacturer to register a new drug on the ledger.
    * @param {*} ctx 
    * @param {*} drugName 
    * @param {*} serialNo 
    * @param {*} mfgDate 
    * @param {*} expDate 
    * @param {*} companyCRN 
    */

   async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
       // Validate that the organisation issuing this transaction is a manufacturer
       // utils.validateInitiator(ctx, manufacturerOrg);
       
       // Create a new composite key for the drug
       const drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, serialNo]);
       
       // Fetch the name of the company using the companyCRN
       var companyName = utils.fetchCompanyName(ctx, companyCRN);
       
       // Create a composite key to be stored as manufacturerOrg inside the drugObject
       var companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [companyCRN, companyName]);
       
       // Create a drug object
       var drugObject = {
           name: drugName,
           manufacturerOrg: companyKey,
           manufacturingDate: mfgDate,
           expiryDate: expDate,
           owner: companyKey,
           shipment: []
       }

       // Convert the JSON object to buffer
       let drugBuffer = Buffer.from(JSON.stringify(drugObject));
       
       // Send the buffer to blockchain for storage
       await ctx.stub.putState(drugKey, drugBuffer);
       console.log(drugObject);
       
       // Return the drug object created to the user
       return drugObject;
   }

   /**
    * This function is used to create a purchase order
    * @param {*} buyerCRN 
    * @param {*} sellerCRN 
    * @param {*} drugName 
    * @param {*} quantity 
    */
   async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity){
       // Validate that this has been invoked by distributor or retailer

       /** const initiatorID = ctx.clientIdentity.getX509Certificate();
       if(initiatorID.issuer.organizationName.trim() !== distributorOrg || initiatorID.issuer.organizationName.trim() !== retailerOrg){
			throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
        }*/
        
       // Create a new composite key for the Purchase Order
       const purchaseOrderKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseorder.', [buyerCRN, drugName]);
       
       // Fetch the buyer company name
       var buyerName = utils.fetchCompanyName(ctx, buyerCRN);
       
       // Create a composite key for the buyer company
       var buyerCompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [buyerCRN, buyerName]);
       
       // Fetch the seller company name 
       var sellerName = utils.fetchCompanyName(ctx, sellerCRN);

       // Create a composite key for the seller company
       var sellerCompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [sellerCRN, sellerName]);
       
       const purchaseOrderObject = {
           drugName: drugName,
           quantity: quantity,
           buyer: buyerCompanyKey,
           seller: sellerCompanyKey
       }

       // Convert the JSON to buffer
       const purchaseOrderBuffer = Buffer.from(JSON.stringify(purchaseOrderObject));
       
       // Send the buffer to blockchain to buffer for storage
       await ctx.stub.putState(purchaseOrderKey, purchaseOrderBuffer);

       // Return the purchase object order created back to the user
       return purchaseOrderObject;
   }

   /**
    * This function is used to create a shipment
    * @param {*} ctx
    * @param {*} buyerCRN 
    * @param {*} drugName 
    * @param {*} listOfAssets 
    * @param {*} transporterCRN 
    */

   async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN){
    
    //utils.validateInitiator(ctx,sellerOrg);
    // The list of assets is taken as string. Individual assets are extracted from it and stored inside assetArray 
    var i;
    var assetArray = [];
    for(i=0;i<listOfAssets.length;i+=3){
    var a = x.slice(i,i+3);
    assetArray.push(a);
    }

    // Create a shipment key
    var shipmentKey = await ctx.stub.createCompositeKey(buyerCRN, drugName);

    // Quantity, buyer and seller is being retrieved from the purchase order
    var purchaseOrderKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseorder.', [buyerCRN, drugName]);
    var purchaseOrderBuffer = await ctx.stub.getState(purchaseOrderKey);
    var purchaseOrderObject = JSON.parse(purchaseOrderBuffer.toString());
    var quantity = purchaseOrderObject.quantity;
    var buyer = purchaseOrderObject.buyer;
    var seller = purchaseOrderObject.seller;

    // Buyer company key is cretaed to compare it with the buyer fetched from the purchase order
    var buyerName = utils.fetchCompanyName(ctx, buyerCRN);
    var buyerCompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [buyerCRN, buyerName]);
    
    // Fetch the company name of the transporter
    var transporterName = utils.fetchCompanyName(ctx, transporterCRN);

    // Create a key for the transporter
    var transporterKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [transporterCRN, transporterName]);

    // Check is done to make sure that the length of the assetArray is same as quantity specified in the purchase order
    // Check is also carried out that the buyer is same as the one for which the purchase order was created
    if(assetArray.length === quantity && buyer === buyerCompanyKey){
        // Composite keys of the assets are being created
        var assetKeysList = [];
        var j;
        for(j=0;j<assetArray.length;j++){
            var assetKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, assetArray[j]]);
            assetKeysList.push(assetKey);
        }
        
        var shipmentObject = {
            creator: seller,
            assets: assetKeysList,
            transporter: transporterKey,
            status: 'in-transit'
        }

        var shipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));
        await ctx.stub.putState(shipmentKey, shipmentBuffer);

        return shipmentObject;

    }
    else{
        throw new Error('The quantity in the purchase order is not the same as the quantity being placed in the shipment.');
    }
   }

   /**
    * This function is used to update the status of the shipment
    * @param {*} buyerCRN 
    * @param {*} drugName 
    * @param {*} transporterCRN 
    */
   async updateShipment(ctx, buyerCRN, drugName, transporterCRN){
    // ctx.validateInitiator(ctx, transporterOrg);

    // Fetch the shipment object
    var shipmentKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment.',[buyerCRN, drugName]);
    var shipmentBuffer = await ctx.stub.getState(shipmentKey);
    var shipmentObject = JSON.parse(shipmentBuffer.toString());

    // Update the status to delivered 
    shipmentObject.status = 'delivered';

    // Update the shipment details on the ledger
    var newShipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));
    await ctx.stub.putState(shipmentKey, newShipmentBuffer);

    // Fetch all the assets keys from the shipment object
    var assetsArray = shipmentObject.assets;
    
    // Fetch buyer company name
    var buyerCompany = utils.fetchCompanyName(ctx, buyerCRN);

    // Create the buyer composite key. This key will be the value associated with the owner filed of each asset
    var buyerCompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [buyerCRN, buyerCompany]);
    
    // Update the owner field of each asset to the buyerCompanyKey
    var i;
    for(i=0;i<assetsArray.lenth;i++){
        var key = assetsArray[i];

        // Fetch the drug details corresponding to the key
        var drugBuffer = await ctx.stub.getState(key);
        var drugObject = JSON.parse(drugBuffer.toString());

        // Update the owner
        drugObject.owner = buyerCompanyKey;

        // Add the shipment id to the shipment array
        drugObject.shipment.push(shipmentKey);

        var newDrugBuffer = Buffer.from(JSON.stringify(drugObject));
        await ctx.stub.putState(key, newDrugBuffer);
    }

    // This function is incomplete need to complete it
   }

   /**
    * This function is used by the retailer to sell the drug to a customer
    * @param {*} drugName 
    * @param {*} serialNo 
    * @param {*} retailerCRN 
    * @param {*} customerAadhar 
    */
   async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar){
       // ctx.validateInitiator(ctx, retailerOrg);
       var retailCompany = utils.fetchCompanyName(ctx, retailerCRN);
       var retailCompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.',[retailerCRN,retailCompany]);
       var drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmnet.drug.', [drugName, serialNo]);
       var drugBuffer = await ctx.stub.getState(drugKey);
       var drugObject = JSON.parse(drugBuffer.toString());
       drugObject.owner = customerAadhar;
       await ctx.stub.putState(drugKey, drugObject);
       return drugObject;
   }

   /**
    * This transaction is used to view the history of the drug
    * @param {*} ctx 
    * @param {*} drugName 
    * @param {*} serialNo 
    */
   async viewHistory(ctx, drugName, serialNo)
    {
        const drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.medicine.', [drugName, serialNo]);
        let complete_history=[];
        let history = await ctx.stub.getHistoryForKey(drugKey);
        //console.log(history.next());
        let result= await history.next();
        //console.log(result.done);
        while(!result.done)
            {
 
                let jsonHistory={};
                jsonHistory.TxId = result.value.tx_id;
                jsonHistory.Timestamp = result.value.timestamp;
                jsonHistory.IsDelete = result.value.is_delete.toString();
                jsonHistory.Value = JSON.parse(result.value.value.toString('utf8'));
                complete_history.push(jsonHistory);
                result= await history.next();
            }
            await history.close();
            console.log(complete_history);
            return (complete_history);
    }

   /**
    * This function is used to view the current state of the drug
    * @param {*} drugName 
    * @param {*} serialNo 
    */
   async viewDrugCurrentState(ctx,drugName, serialNo){
       var drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.',[drugName, serialNo]);
       var drugBuffer = await ctx.stub.getState(drugKey);
       var drugObject = JSON.parse(drugBuffer.toString());
       return drugObject;
   }
}
module.exports = PharmanetContract;