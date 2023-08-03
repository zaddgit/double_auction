/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const path = require('path');
const { buildCCPOrg1, buildCCPOrg2, buildWallet, prettyJSONString } = require('../../test-application/javascript/AppUtil');

const myChannel = 'mychannel';
const myChaincodeName = 'auction';

async function createAuction(ccp, wallet, user, auctionID, item) {
    try {

        const gateway = new Gateway();

        // Connect using Discovery enabled
        await gateway.connect(ccp,
            { wallet: wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(myChannel);
        const contract = network.getContract(myChaincodeName);

        let statefulTxn = contract.createTransaction('CreateAuction');

        console.log('\n--> Submit Transaction: Propose a new auction');
        await statefulTxn.submit(auctionID, item);
        console.log('*** Result: committed');

        console.log('\n--> Evaluate Transaction: query the auction that was just created');
        let result = await contract.evaluateTransaction('QueryAuction', auctionID);
        console.log('*** Result: Auction: ' + prettyJSONString(result.toString()));

        gateway.disconnect();
    } catch (error) {
        console.error(`******** FAILED to submit bid: ${error}`);
    }
}

/**
 * Workload module for the benchmark round.
 */
class CreateAuctionWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     * @param {*} bcAdapter The blockchain adapter.
     * @param {*} sutAdapter The SUT adapter.
     */
    constructor(bcAdapter, sutAdapter) {
        super(bcAdapter, sutAdapter);
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        const org = this.sutAdapter.getOrgID();
        const user = this.sutAdapter.getUserID();
        const auctionID = `Auction${this.workerIndex}_ID${this.txIndex}`;
        const item = `Item${this.workerIndex}_ID${this.txIndex}`;

        try {
            if (org === 'Org1') {
                const ccp = buildCCPOrg1();
                const walletPath = path.join(__dirname, 'wallet/org1');
                const wallet = await buildWallet(Wallets, walletPath);
                await createAuction(ccp, wallet, user, auctionID, item);
            } else if (org === 'Org2') {
                const ccp = buildCCPOrg2();
                const walletPath = path.join(__dirname, 'wallet/org2');
                const wallet = await buildWallet(Wallets, walletPath);
                await createAuction(ccp, wallet, user, auctionID, item);
            } else {
                console.error('Invalid organization:', org);
            }
        } catch (error) {
            console.error(`******** FAILED to run the application: ${error}`);
        }
    }
}

/**
 * Create a new instance of the workload module.
 * @param {*} bcAdapter The blockchain adapter.
 * @param {*} sutAdapter The SUT adapter.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule(bcAdapter, sutAdapter) {
    return new CreateAuctionWorkload(bcAdapter, sutAdapter);
}

module.exports.createWorkloadModule = createWorkloadModule;

