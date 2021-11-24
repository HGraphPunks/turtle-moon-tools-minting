import {hederaClient} from '../scripts/utils'
import {Client} from '@xact-wallet-sdk/client'
import {
  HederaEnviroment,
  ClientNFT,
  DebugLevel,
  CategoryNFT
} from '@xact-wallet-sdk/nft'
// TODO: Add custom attributes to minting
// import {NFTJson} from '../scripts/NFTJson'
import {createIPFSMetaData} from './fileService'

const fs = window.require('fs');
// import { remote } from 'electron';

// const { ipcRenderer, remote } = require('electron');

import {
  TokenNftInfoQuery,
  TokenId,
  CustomFixedFee,
  CustomRoyaltyFee,
  Hbar,
  NftId,
  PrivateKey,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenSupplyType,
  TokenType,
} from "@hashgraph/sdk";

const readJson = (url, setMintJSON) => {
  return fetch(url)
  .then(response => {
      if (!response.ok) {
          throw new Error("HTTP error " + response.status);
      }
      return response.json();
  })
  .then(json => {
      console.log(json);
      return json;
  })
  .catch(function () {
      console.log('NFT STORAGE READ DATA ERROR')
  })
}

export const mintHashlips = async (hashlipsToken, hederaMainnetEnv) => {

  const client = hederaClient(hederaMainnetEnv)
  const hashLipsImages = document.getElementById("hl-images").files;
  const hashLipsJSON = document.getElementById("hl-json").files;
  const metaDataPath = hashLipsJSON[0].path;
  let rawdata = fs.readFileSync(metaDataPath);
  let hashlipsMetaData = JSON.parse(rawdata);
  
  const metadataCIDs = await createIPFSMetaData(hashLipsImages, hashlipsMetaData, hederaMainnetEnv);
  console.log(metadataCIDs);
  createNFTs(client, hashlipsToken, metadataCIDs, hederaMainnetEnv);
}

export const createNFTs = async (client, hashlipsToken, metadataCIDs, hederaMainnetEnv) => {
  // Init value for token ID to mint metadata
  let tokenId; 

  let adminKey;
  let supplyKey;
  let freezeKey;

  // If minting on a token ID that's already created, skip creatining initial token
  // if (!hashlipsToken.previousTokenId) {
    /* Create a royalty fee */
  const customRoyaltyFee = [];

  const fee = new CustomRoyaltyFee()
    .setNumerator(parseInt(hashlipsToken.royalty)) // The numerator of the fraction
    .setDenominator(100) // The denominator of the fraction
    .setFallbackFee(
      new CustomFixedFee().setHbarAmount(new Hbar(5))
    ) // The fallback fee
    .setFeeCollectorAccountId(hashlipsToken.treasuryAccountId); // The account that will receive the royalty fee
  customRoyaltyFee.push(fee);

  adminKey = JSON.parse(localStorage.getItem('adminKey'))
  if (!adminKey) { 
      adminKey = PrivateKey.generate();
      // localStorage.setItem('adminKey', JSON.stringify(adminKey))
  }

  supplyKey = JSON.parse(localStorage.getItem('supplyKey'))
  if (!supplyKey) { 
    supplyKey = PrivateKey.generate();
    // localStorage.setItem('supplyKey', JSON.stringify(supplyKey))
  } else {
    // supplyKey = PrivateKey.generate(supplyKey)
  }

  freezeKey = JSON.parse(localStorage.getItem('freezeKey'))
  if (!freezeKey) { 
    freezeKey = PrivateKey.generate();
      // localStorage.setItem('freezeKey', JSON.stringify(freezeKey))
  }

  const tx = await new TokenCreateTransaction()
    .setTokenType(TokenType.NonFungibleUnique)
    .setTokenName(hashlipsToken.name)
    .setTokenSymbol(hashlipsToken.symbol)
    // .setDecimals(0)
    .setInitialSupply(0)
    .setMaxSupply(hashlipsToken.maxSupply)
    .setCustomFees(customRoyaltyFee)
    .setSupplyType(TokenSupplyType.Finite)
    .setTreasuryAccountId(hashlipsToken.treasuryAccountId)
    .setAutoRenewAccountId(hashlipsToken.renewAccountId)
    .setSupplyKey(supplyKey)
    // .setAdminKey(adminKey)
    // .setFreezeKey(freezeKey)

  const transaction = await tx.signWithOperator(client);

  /*  submit to the Hedera network */
  const response = await transaction.execute(client);

  /* Get the receipt of the transaction */
  const receipt = await response.getReceipt(client);

  /* Get the token ID from the receipt */
  tokenId = receipt.tokenId;
  // } else {
  //   supplyKey = PrivateKey.generate();
  //   tokenId = hashlipsToken.previousTokenId;
  // }

  console.log(tokenId);
  /* Mint the token */
  let nftIds = [];
  let urls = [];
  let limit_chunk = 5;

  const nbOfChunk = Math.ceil(metadataCIDs.length / limit_chunk);
  let supplyClone = metadataCIDs.length-1;
  let resp;
  for (let i = 0; i < nbOfChunk; i++) {
    const mintTransaction = new TokenMintTransaction().setTokenId(tokenId);

    for (let j = 0; j < limit_chunk; j++) {
      // const modifiedCID = metadataCIDs[j].split('ipfs://')[1];
      // const finalMetadataLink = `https://cloudflare-ipfs.com/ipfs/${modifiedCID}`;

      if (supplyClone-j < 0) {
        return
      }
      mintTransaction.addMetadata(
        // Buffer.from(finalMetadataLink)
        Buffer.from(metadataCIDs[supplyClone-j])
      );
      urls.push(metadataCIDs[supplyClone-j])
    }
    supplyClone = supplyClone - limit_chunk;
 
    /* Sign with the supply private key of the token */
    const signTx = await mintTransaction
      .freezeWith(client)
      .sign(supplyKey);

    /* Submit the transaction to a Hedera network */
    resp = await signTx.execute(client);
    const receiptMint = await resp.getReceipt(client);
    /* Get the Serial Number */
    const serialNumber = receiptMint.serials;

    /* Get the NftId */
    for (const nftSerial of serialNumber.values()) {
      nftIds.push(new NftId(tokenId, nftSerial).toString());
    }
  }

  const mintData = JSON.stringify({
    urls: urls,
    txId: resp.transactionId.toString(),
    tokenId: tokenId.toString(),
    nftIds,
    mainnet: hederaMainnetEnv
  });
  console.log(mintData)
  localStorage.setItem('hashlipsMintData_' + mintData?.tokenId , mintData)
}

/* TODO: Create method for mass uploading of NFTs from Hashlips */
export const xactCreateToken  = async (accountId, client, hederaMainnetEnv, token, setLoading) => {
  setLoading(true)
  
  /* Add in confirmation step for MAINNET minting */
  if (hederaMainnetEnv) {
    const r = confirm("You are about to mint on the MAINNET. Do you want to proceed?");
    if (r !== true) {
      return alert('Minting process cancelled')
    }
  }
  
  const createAndMintObj = {
    name: token?.name,
    description: token?.description,
    category: token?.category,
    creator: token?.creator,
    media: token?.imageData,
    supply: parseInt(token?.supply),
    customRoyaltyFee: {
      numerator: parseInt(token?.royalty),
      denominator: 100,
      fallbackFee: 100,
    },
    // attributes: NFTJson?.attributes,
    // customProperties: NFTJson?.customProperties,
    fromAccountId: accountId
  }
  
  await client.createNFT(createAndMintObj);
  client.createNFTValidation().subscribe(async nft => {
    setLoading(false)
    /* Save response in local storage for debugging */
    const tmt_tokens = localStorage.getItem('tmt_tokens') ? JSON.parse(localStorage.getItem('tmt_tokens')) : [];
    const tokenJSON = await readJson(nft.url);
    const imageURL = await readJson(tokenJSON?.image?.description);

  
    tmt_tokens.push({
      nft,
      tokenJSON,
      imageURL,
      mainnet: hederaMainnetEnv
    }); 
    localStorage.setItem('tmt_tokens', JSON.stringify(tmt_tokens));
  });
}


export const tokenGetInfo = async (tokenId, accountId) => {
  // TODO - Make sure it works
  const client = hederaClient(accountId);
  const tmt_tokens = localStorage.getItem('tmt_tokens') ? JSON.parse(localStorage.getItem('tmt_tokens')) : [];
  const tokenMints = tmt_tokens.filter((tx) => {return tx.tokenId === tokenId})
  const tokenResponse = tokenMints[0]?.token;
  const tokenIdNew = new TokenId(tokenId)
  const nftID = new NftId(tokenIdNew, '1')

  try {
      const nftInfo = await new TokenNftInfoQuery()
        .setNftId(nftID)
        .execute(client);
      
      const metadata = nftInfo[0].metadata.toString();
      console.log(nftInfo)
      console.log(metadata)
      // console.log(fileMirrorURL)
  } catch (err) {
      alert(err.message);
  }
  return tokenResponse
}


export const sellNFT = async (NFTForSale, xactClient) => {
  // If we weren't able to grab it, we should throw a new error
  if (xactClient == null) {
    throw new Error("Xact connection must be present");
  }  
      
  /* Update strings to integers for endpoint */
  const obj = NFTForSale;
  obj.hbarAmount = parseInt(obj.hbarAmount);
  obj.quantity = parseInt(obj.quantity);

  const saleResponse = await xactClient.sellNFT(obj);
  console.log(saleResponse)

  /* Subscribe to new sale NFT Validation */
  xactClient.sellNFTValidation().subscribe(nft => {
    console.log('NFT successfully set in sale', nft);
    console.log(nft);
  });

  console.log('sellNFT Call Success')
}


export const removeNFTFromSale = async (tokenId, xactPrivateKey) => {
    const apiKey = xactPrivateKey;

    // If we weren't able to grab it, we should throw a new error
    if (apiKey == null) {
        throw new Error("Environment variables API_KEY must be present");
    }

    /* Create a new instance of Client */
    const client = new Client({apiKey});
    
    /* Init the connexion */
    await client.initConnexion();
    await client.deleteNFTFromSale({tokenId});
    
    /* Subscribe to new sale NFT Validation */
    client.deleteSellNFTValidation().subscribe(nft => {
        console.log('NFT successfully removed from sale', nft);
    });
}

export const getNFTQRCode = async (tokenIDQR, xactClient, hederaMainnetEnv) => {

  const res = await xactClient.getNFTForSaleByTokenId({tokenId: tokenIDQR});
  
  // TODO: Create local storage function for all objects to use.
  const tmt_qrcodes = localStorage.getItem('tmt_qrcodes') ? JSON.parse(localStorage.getItem('tmt_qrcodes')) : [];
  tmt_qrcodes.push({
    nft: res?.nft,
    qrCode: res?.qrCode,
    tokenId: res?.nft?.tokenId,
    mainnet: hederaMainnetEnv
  }); 
  localStorage.setItem('tmt_qrcodes', JSON.stringify(tmt_qrcodes));
  console.log(tmt_qrcodes);
}


export const associateToken = async (xactPrivateKey) => {
  const apiKey = xactPrivateKey;

  // Create Client
  const client = new Client({apiKey, debugLevel: DebugLevel.DEBUG});

  // If we weren't able to grab it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }
  
  /* Init the connexion */
  await client.initConnexion();

  // /* Update the fields with your informations */
  const fromAccountId = '0.0.1960117';
  const tokenId = '0.0.2778004';

  /* Request for association */
  await client.associate({fromAccountId, tokenId});

  /* Listen for Association's success */
  client.associateValidation().subscribe(token => {
      console.log('New associated token', token);
  });
}