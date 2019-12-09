const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const requestNewUser = require('./2_requestNewUser');
const approveNewUser = require('./3_approveNewUser');
const viewUser = require('./4_viewUser');
const rechargeAccount = require('./5_rechargeAccount');
const propertyRegistrationRequest = require('./6_propertyRegistrationRequest');
const approvePropertyRegistration = require('./7_approvePropertyRegistration');
const updateProperty = require('./8_updateProperty');
const purchaseProperty = require('./9_purchaseProperty');
const viewProperty = require('./10_viewProperty');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Property Registration App');

app.get('/', (req, res) => res.send('Hello Registrar'));

app.post('/addToWallet', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath, req.body.org).then (() => {
        console.log('User Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/requestNewUser', (req, res) => {
    requestNewUser.execute(req.body.name, req.body.email, req.body.phone, req.body.aadharNo, req.body.org).then(() => {
        console.log('New User Request submitted on the Network');
        const result = {
            status: 'success',
            message: 'New User Request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    }); 
});

app.post('/approveNewUser', (req, res) => {
    approveNewUser.execute(req.body.name, req.body.aadharNo,req.body.org).then (() => {
        console.log('Approve New User request submitted on the Network');
        const result = {
            status: 'success',
            message: 'Approve New User request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewUser', (req, res) => {
    viewUser.execute(req.body.name, req.body.aadharNo, req.body.org).then (() => {
        console.log('View User request submitted on the Network');
        const result = {
            status: 'success',
            message: 'View User request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/approvePropertyRegistration', (req, res) => {
    approvePropertyRegistration.execute(req.body.propertyID).then (() => {
        console.log('Approve Property Registration request submitted on the Network');
        const result = {
            status: 'success',
            message: 'Approve Property Registration request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewProperty', (req, res) => {
    viewProperty.execute(req.body.propertyID).then (() => {
        console.log('View Property request submitted on the Network');
        const result = {
            status: 'success',
            message: 'View Property request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.listen(port, () => console.log(`Distributed App listening on port ${port}!`));
