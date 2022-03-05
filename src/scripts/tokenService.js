import {hederaClient} from '../scripts/utils'
import {createIPFSMetaData, createSingleIPFSMetaData} from './fileService'

const fs = window.require('fs');

import {
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

export const singleImageMint = async (hederaMainnetEnv, token, user, setLoading) => {
  const image = document.getElementById("single-image").files;
  const client = hederaClient(hederaMainnetEnv, user)
  
  let attributes =[]

  const tokenMetaData = {
    name: token?.name,
    description: token?.description,
    creator: token?.creator,
    maxSupply: parseInt(token?.maxSupply),
    attributes: attributes,
  }

  if (parseInt(token?.numOfAttributes) > 0) {
    for (let index = 0; index < parseInt(token.numOfAttributes); index++) {
      let trait_type = token['trait_type'+index];
      let value = token['value'+index];
      let attribute = {
        trait_type: trait_type,
        value: value
      }
      attributes.push(attribute);
    }
  }
  tokenMetaData.attributes = attributes

  const metadataCIDs = await createSingleIPFSMetaData(image, tokenMetaData, user?.nftStorageAPI);
  let finalCIDS = []
  for (let j = 0; j < tokenMetaData?.maxSupply; j++) {
    finalCIDS[j] = metadataCIDs.url
  }

  token.treasuryAccountId = user.accountId
  token.renewAccountId = user.accountId
  createNFTs(client, token, finalCIDS, user.pk, hederaMainnetEnv, setLoading);
}

export const mintHashlips = async (hashlipsToken, user, hederaMainnetEnv, setLoading) => {
  const client = hederaClient(hederaMainnetEnv, user)
  const hashLipsImages = document.getElementById("hl-images").files;
  const hashLipsJSON = document.getElementById("hl-json").files;
  const metaDataPath = hashLipsJSON[0].path;
  let rawdata = fs.readFileSync(metaDataPath);
  let hashlipsMetaData = JSON.parse(rawdata);
  
  const metadataCIDs = await createIPFSMetaData(hashLipsImages, hashlipsMetaData, user.nftStorageAPI);
  console.log(hashlipsToken);
  console.log(metadataCIDs);
  console.log(user);

  createNFTs(client, hashlipsToken, metadataCIDs, user.pk, hederaMainnetEnv, setLoading);
}

const mintExisitngToken = async (client, tokenId, metadataCIDs, hederaMainnetEnv, setLoading) => {
  // TODO: Make ths DRY
  /* Mint the token */
  let nftIds = [];
  let urls = [];
  let limit_chunk = 5;
  let rawdata = localStorage.getItem('supplyKey_'+tokenId.toString()); //fs.readFileSync('./supplyKey.json');
  let supplyKey = PrivateKey.fromString(rawdata);
  const nbOfChunk = Math.ceil(metadataCIDs.length / limit_chunk);
  let supplyClone = metadataCIDs.length-1;
  let resp;

  for (let i = 0; i < nbOfChunk; i++) {
    const mintTransaction = new TokenMintTransaction().setTokenId(tokenId);
    for (let j = 0; j < limit_chunk; j++) {
      if ((supplyClone - j) < 0) {
        break
      }
      mintTransaction.addMetadata(
        Buffer.from(metadataCIDs[supplyClone-j])
      );
      urls.push(metadataCIDs[supplyClone-j])
    }
    supplyClone = supplyClone - limit_chunk;
 
    /* Sign with the supply private key of the token */
    const signTx = await mintTransaction
      .setMaxTransactionFee(new Hbar(1000))
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
  localStorage.setItem('hashlipsMintData_' + tokenId.toString() , mintData)
  setLoading(false)
}

export const createNFTs = async (client, hashlipsToken, metadataCIDs, userPk, hederaMainnetEnv, setLoading) => {
  // Init value for token ID to mint metadata
  let tokenId; 
  let adminKey;
  let supplyKey;
  let freezeKey;

  // If minting on a token ID that's already created, skip creatining initial token
  if (hashlipsToken.previousTokenId) {
    mintExisitngToken(client, hashlipsToken.previousTokenId, metadataCIDs, hederaMainnetEnv, setLoading)
    return
  }
    /* Create a royalty fee */
  const customRoyaltyFee = [];
  for (let index = 0; index < parseInt(hashlipsToken.numOfRoyaltyFees); index++) {
    let numerator = parseFloat(hashlipsToken['royalty'+index]) *100;
    const fee = new CustomRoyaltyFee()
    .setNumerator(numerator) // The numerator of the fraction
    .setDenominator(10000) // The denominator of the fraction
    .setFallbackFee(
      new CustomFixedFee().setHbarAmount(new Hbar(hashlipsToken.fallbackFee))
    ) // The fallback fee
    .setFeeCollectorAccountId(hashlipsToken['royaltyAccountId'+index]); // The account that will receive the royalty fee
    customRoyaltyFee.push(fee);
  }
  const privateKey = PrivateKey.fromString(userPk);

  adminKey = privateKey;
  
  supplyKey = PrivateKey.generate();
  
  freezeKey = PrivateKey.generate();

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
    .setMaxTransactionFee(new Hbar(1000))
    // .setAdminKey(adminKey)
    // .setFreezeKey(freezeKey)
    .freezeWith(client);
    
  // const transaction = await tx.signWithOperator(client);
  const transaction = await tx.sign(privateKey);

  /*  submit to the Hedera network */
  const response = await transaction.execute(client);

  /* Get the receipt of the transaction */
  const receipt = await response.getReceipt(client).catch((e) => console.log(e));

  /* Get the token ID from the receipt */
  tokenId = receipt.tokenId;

  console.log(tokenId);

  /* Mint the token */
  let nftIds = [];
  let urls = [];
  let limit_chunk = 5;
  metadataCIDs = metadataCIDs.reverse()
  const nbOfChunk = Math.ceil(metadataCIDs.length / limit_chunk);
  let supplyClone = metadataCIDs.length-1;
  let resp;

  for (let i = 0; i < nbOfChunk; i++) {
    const mintTransaction = new TokenMintTransaction().setTokenId(tokenId);

    for (let j = 0; j < limit_chunk; j++) {

      if ((supplyClone - j) < 0) {
        break
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
      .setMaxTransactionFee(new Hbar(1000))
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


  let saveSupplyKey = supplyKey.toString()
  let saveAdminKey = adminKey.toString()
  let saveFreezeKey = freezeKey.toString()
  // fs.appendFile(`../supplyKey.json`, saveSupplyKey, (err) => {
  //   if (err) throw err;
  //   console.log('supply key written to file');
  // });
  localStorage.setItem('supplyKey_'+tokenId.toString(), saveSupplyKey)
  localStorage.setItem('adminKey_'+tokenId.toString(), saveAdminKey)
  localStorage.setItem('freezeKey_'+tokenId.toString(), saveFreezeKey)
  setLoading(false)
  alert(`Minting Success!\n\nNewly minted token data:\n\nToken ID: ${tokenId.toString()}\n\nSupply Key: ${saveSupplyKey}\n\nSupply key has also been saved into local storage.`);
  // console.log(saveSupplyKey)
  // console.log(saveAdminKey)
  // console.log(saveFreezeKey)
  localStorage.setItem('hashlipsMintData_' + tokenId.toString() , mintData)
}
