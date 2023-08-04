

## Deploy the chaincode

```
cd fabric-samples/test-network
```

You can then run the following command to deploy the test network.
```
./network.sh up createChannel -ca
```

 the `-ca` flag to deploy the network using certificate authorities. We will use the CA to register and enroll our sellers and buyers.

```
./network.sh deployCC -ccn auction -ccp ../auction-simple/chaincode-go/ -ccl go -ccep "OR('Org1MSP.peer','Org2MSP.peer')"

```

## Install the application dependencies

```
cd fabric-samples/auction-simple/application-javascript
```

From this directory, run the following
```
npm install
```

## Register and enroll the application identities

To interact with the network, you will need to enroll the Certificate Authority administrators of Org1 and Org2. You can use the `enrollAdmin.js` program for this task. 
```
node enrollAdmin.js org1
```
CA admin of Org2:
```
node enrollAdmin.js org2
```


Run the following command to register and enroll the seller identity that will create the auction. The seller will belong to Org1.
```
node registerEnrollUser.js org1 seller
```
#seller
node registerEnrollUser.js org1 seller
You should see the logs of the seller wallet being created as well.
```
node registerEnrollUser.js org2 badr
node registerEnrollUser.js org1 mounim
node registerEnrollUser.js org2 jean
node registerEnrollUser.js org2 eric
node registerEnrollUser.js org1 adrian
```

## Create the auction


node createAuction.js org1 seller TradingEnergy1 item1
```

After the transaction is complete, the `createAuction.js` application will query the auction stored in the public channel ledger:
```
*** Result: Auction: {
  "objectType": "auction",
  "item": "TradingEnergy1",
  "seller": "x509::CN=seller,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US",
  "organizations": [
    "Org1MSP"
  ],
  "privateBids": {},
  "revealedBids": {},
  "winner": "",
  "price": 0,
  "status": "open"
}

The smart contract uses the `GetClientIdentity().GetID()` API to read the identity that creates the auction and defines that identity as the auction `"seller"`. The seller is identified by the name and issuer of the seller's certificate.

## Bid on the auction


Bidder1 will create a bid to purchase the painting for 800 dollars.
```
node bid.js org1 mounim TradingEnergy1 800
```

The application will query the bid after it is created:
```
*** Result:  Bid: {
  "objectType": "bid",
  "price": 800,
  "org": "Org1MSP",
  "bidder": "x509::CN=mounim,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US"
}
```


The `bid.js` application also prints the bidID:
```
*** Result ***SAVE THIS VALUE*** BidID: 67d85ef08e32de20994c816362d0952fe5c2ae3f2d1083600c3ac61f65a89f60
```

The BidID acts as the unique identifier for the bid. This ID allows you to query the bid using the `queryBid.js` program and add the bid to the auction. Save the bidID returned by the application as an environment variable in your terminal:
```
export MOUNIM_BID_ID=67d85ef08e32de20994c816362d0952fe5c2ae3f2d1083600c3ac61f65a89f60


node submitBid.js org1 mounim TradingEnergy1 $MOUNIM_BID_ID


```
*** Result: Auction: {
  "objectType": "auction",
  "item": "item1",
  "seller": "x509::CN=mounim,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US",
  "organizations": [
    "Org1MSP"
  ],
  "privateBids": {
    "\u0000bid\u0000TradingEnergy1\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "org": "Org1MSP",
      "hash": "0b8bbdb96b1d252e71ac1ed71df3580f7a0e31a743a4a09bbf5196dffef426b2"
    }
  },
  "revealedBids": {},
  "winner": "",
  "price": 0,
  "status": "open"
}


### Bid as jean

Let's submit another bid. jean would like to purchase the painting for 500 dollars.
```
node bid.js org1 jean TradingEnergy1 500
```

Save the Bid ID returned by the application:
```
export JEAN_BID_ID=0fa8b3b15923966f205a1f5ebd163d2707d069ffa055105114fc654d225f511d
```

Submit jean's bid to the auction:
```
node submitBid.js org1 jean TradingEnergy1 $JEAN_BID_ID
```

### Bid as eric from Org2

eric will bid 700 dollars for the kwh :
```
node bid.js org2 eric TradingEnergy1 700
```

Save the Bid ID returned by the application:
```
export ERIC_BID_ID=cda8bb2849fc0553efb036c56ea86d82791a695b5641941dac797dc6e2d75768
```

Add eric's bid to the auction:
```
node submitBid.js org2 eric TradingEnergy1 $ERIC_BID_ID
```
badr will bid 800 dollars for the kwh :
```
node bid.js org1 badr TradingEnergy1 900
```

Save the Bid ID returned by the application:
```
export BADR_BID_ID=cda8bb2849fc0553efb036c56ea86d82791a695b5641941dac797dc6e2d75768
```

Add BADR's bid to the auction:
```
node submitBid.js org1 badr TradingEnergy1 $BADR_BID_ID


Because eric belongs to Org2, submitting the bid will add Org2 to the list of participating organizations. You can see the Org2 MSP ID has been added to the list of `"organizations"` in the updated auction returned by the application:
```
*** Result: Auction: {
  "objectType": "auction",
  "item": "item1",
  "seller": "x509::CN=eric,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US",
  "organizations": [
    "Org1MSP",
    "Org2MSP"
  ],
  "privateBids": {
    "\u0000bid\u0000TradingEnergy1\u00001b9dc0006fef10413df5cca927cabdf73ab854fe92b7a7b2eebfa00961fdac67\u0000": {
      "org": "Org1MSP",
      "hash": "15cd9a3e12825017f3e758499ac6138ebbe1adec4c49cc6ea6a0973fc6514666"
    },
    "\u0000bid\u0000TradingEnergy1\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "org": "Org1MSP",
      "hash": "0b8bbdb96b1d252e71ac1ed71df3580f7a0e31a743a4a09bbf5196dffef426b2"
    },
    "\u0000bid\u0000TradingEnergy1\u00005ee4fa53b54ea0821e57a6884a1ada5eb04f136ee222e92d7399bcdf47556ea1\u0000": {
      "org": "Org2MSP",
      "hash": "14d47d17acceceb483e87c14a4349844874fce549d71c6a23457d953ed8ffbd3"
    }
  },
  "revealedBids": {},
  "winner": "",
  "price": 0,
  "status": "open"
}
```

Now we can even create other auctions like:
node createAuction.js org1 mounim TradingEnergy2 item2

```
same thing to do for the seconde auction ,more players can bid on the auction ,submit the bid's ,after close the Auction so can player reveal there bids 


## Close the auction

Now that all four bidders have joined the auction, the seller would like to close the auction and allow buyers to reveal their bids. The seller identity that created the auction needs to submit the transaction:
```
node closeAuction.js org1 seller TradingEnergy1
```

The application will query the auction to allow you to verify that the auction status has changed to closed. As a test, you can try to create and submit a new bid to verify that no new bids can be added to the auction.

## Reveal bids

After the auction is closed, bidders can try to win the auction by revealing their bids. The transaction to reveal a bid needs to pass four checks:
1. The auction is closed.
2. The transaction was submitted by the identity that created the bid.
3. The hash of the revealed bid matches the hash of the bid on the channel ledger. This confirms that the bid is the same as the bid that is stored in the private data collection.
4. The hash of the revealed bid matches the hash that was submitted to the auction. This confirms that the bid was not altered after the auction was closed.

Use the `revealBid.js` application to reveal the bid of Bidder1:
```
node revealBid.js org1 mounim TradingEnergy1 $MOUNIM_BID_ID
```

The full bid details, including the price, are now visible:
```
*** Result: Auction: {
  "objectType": "auction",
  "item": "item1",
  "seller": "x509::CN=seller,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US",
  "organizations": [
    "Org1MSP",
    "Org2MSP"
  ],
  "privateBids": {
    "\u0000bid\u0000TradingEnergy1\u000019a7a0dd2c5456a3f79c2f9ccb09dddd0f1c9ece514dfea7cbea06e7cbc79855\u0000": {
      "org": "Org2MSP",
      "hash": "08db66c6cc226577a3153dadeb0b77d3834162fcf5f008b344058a1bc5c1b3a4"
    },
    "\u0000bid\u0000TradingEnergy1\u00001b9dc0006fef10413df5cca927cabdf73ab854fe92b7a7b2eebfa00961fdac67\u0000": {
      "org": "Org1MSP",
      "hash": "15cd9a3e12825017f3e758499ac6138ebbe1adec4c49cc6ea6a0973fc6514666"
    },
    "\u0000bid\u0000TradingEnergy1\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "org": "Org1MSP",
      "hash": "0b8bbdb96b1d252e71ac1ed71df3580f7a0e31a743a4a09bbf5196dffef426b2"
    },
    "\u0000bid\u0000TradingEnergy1\u00005ee4fa53b54ea0821e57a6884a1ada5eb04f136ee222e92d7399bcdf47556ea1\u0000": {
      "org": "Org2MSP",
      "hash": "14d47d17acceceb483e87c14a4349844874fce549d71c6a23457d953ed8ffbd3"
    }
  },
  "revealedBids": {
    "\u0000bid\u0000TradingEnergy1\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "objectType": "bid",
      "price": 800,
      "org": "Org1MSP",
      "bidder": "x509::CN=mounim,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US"
    }
  },
  "winner": "",
  "price": 0,
  "status": "closed"
}
```

adrian from Org2 will also reveal their bid:
```
node revealBid.js org2 jean TradingEnergy1 $JEAN_BID_ID
```

If the auction ended now, mounim would win. Let's try to end the auction using the seller identity and see what happens.

```
node endAuction.js org1 seller TradingEnergy1
```

The output should look something like the following:

```
--> Submit the transaction to end the auction
2021-01-28T16:47:27.501Z - error: [DiscoveryHandler]: compareProposalResponseResults[undefined] - read/writes result sets do not match index=1
2021-01-28T16:47:27.503Z - error: [Transaction]: Error: No valid responses from any peers. Errors:
    peer=undefined, status=grpc, message=Peer endorsements do not match
******** FAILED to submit bid: Error: No valid responses from any peers. Errors:
    peer=undefined, status=grpc, message=Peer endorsements do not match
```

Instead of ending the auction, the transaction results in an endorsement policy failure. The end of the auction needs to be endorsed by Org2. Before endorsing the transaction, the Org2 peer queries its private data collection for any winning bids that have not yet been revealed. Because Bidder4 created a bid that is above the winning price, the Org2 peer refuses to endorse the transaction that would end the auction.

Before we can end the auction, we need to reveal the bid from ERIC.
```
node revealBid.js org2 badr TradingEnergy1 $badr_BID_ID
```


## End the auction

Now that the winning bids have been revealed, we can end the auction:
```
node endAuction org1 seller TradingEnergy1
```

The transaction was successfully endorsed by both Org1 and Org2, who both calculated the same price and winner. The winning bidder is listed along with the price:
```
*** Result: Auction: {
  "objectType": "auction",
  "item": "item1",
  "seller": "x509::CN=seller,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US",
  "organizations": [
    "Org1MSP",
    "Org2MSP"
  ],
  "privateBids": {
    "\u0000bid\u0000PaintingAuction\u000019a7a0dd2c5456a3f79c2f9ccb09dddd0f1c9ece514dfea7cbea06e7cbc79855\u0000": {
      "org": "Org2MSP",
      "hash": "08db66c6cc226577a3153dadeb0b77d3834162fcf5f008b344058a1bc5c1b3a4"
    },
    "\u0000bid\u0000PaintingAuction\u00001b9dc0006fef10413df5cca927cabdf73ab854fe92b7a7b2eebfa00961fdac67\u0000": {
      "org": "Org1MSP",
      "hash": "15cd9a3e12825017f3e758499ac6138ebbe1adec4c49cc6ea6a0973fc6514666"
    },
    "\u0000bid\u0000PaintingAuction\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "org": "Org1MSP",
      "hash": "0b8bbdb96b1d252e71ac1ed71df3580f7a0e31a743a4a09bbf5196dffef426b2"
    },
    "\u0000bid\u0000PaintingAuction\u00005ee4fa53b54ea0821e57a6884a1ada5eb04f136ee222e92d7399bcdf47556ea1\u0000": {
      "org": "Org2MSP",
      "hash": "14d47d17acceceb483e87c14a4349844874fce549d71c6a23457d953ed8ffbd3"
    }
  },
  "revealedBids": {
    "\u0000bid\u0000PaintingAuction\u000019a7a0dd2c5456a3f79c2f9ccb09dddd0f1c9ece514dfea7cbea06e7cbc79855\u0000": {
      "objectType": "bid",
      "price": 900,
      "org": "Org2MSP",
      "bidder": "x509::CN=eric,OU=client+OU=org2+OU=department1::CN=ca.org2.example.com,O=org2.example.com,L=Hursley,ST=Hampshire,C=UK"
    },
    "\u0000bid\u0000PaintingAuction\u00005c049b0b4552d34c88e0f8fb5abca31fa04472b7e1336a16650ac8cfb0b16472\u0000": {
      "objectType": "bid",
      "price": 800,
      "org": "Org1MSP",
      "bidder": "x509::CN=mounim,OU=client+OU=org1+OU=department1::CN=ca.org1.example.com,O=org1.example.com,L=Durham,ST=North Carolina,C=US"
    },
    "\u0000bid\u0000PaintingAuction\u00005ee4fa53b54ea0821e57a6884a1ada5eb04f136ee222e92d7399bcdf47556ea1\u0000": {
      "objectType": "bid",
      "price": 700,
      "org": "Org2MSP",
      "bidder": "x509::CN=adrian,OU=client+OU=org2+OU=department1::CN=ca.org2.example.com,O=org2.example.com,L=Hursley,ST=Hampshire,C=UK"
    }
  },
  "winner": "x509::CN=badr,OU=client+OU=org2+OU=department1::CN=ca.org2.example.com,O=org2.example.com,L=Hursley,ST=Hampshire,C=UK",
  "price": 900,
  "status": "ended"
}
```

## Clean up

When your are done using the auction smart contract, you can bring down the network and clean up the environment. 
rm -rf wallet
```

You can then navigate to the test network directory and bring down the network:
````
cd ../../test-network/
./network.sh down
````
