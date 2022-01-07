
import {
  Hbar,
  Client,
  AccountId
} from "@hashgraph/sdk";

export const checkProvided = (environmentVariable) => {
    if (environmentVariable === null) {
      return false;
    }
    if (typeof environmentVariable === "undefined") {
      return false;
    }
    return true;
}

export const hederaClient = (hederaMainnetEnv) => {
  const operatorAccount = hederaMainnetEnv ? process.env.REACT_APP_MY_ACCOUNT_ID_MAINNET : process.env.REACT_APP_MY_ACCOUNT_ID_TESTNET; 
  const operatorPrivateKey = hederaMainnetEnv ? process.env.REACT_APP_MY_PRIVATE_KEY_MAINNET : process.env.REACT_APP_MY_PRIVATE_KEY_TESTNET;

  console.log(hederaMainnetEnv);
  console.log(operatorPrivateKey);
  console.log(operatorAccount);
  
  if (!checkProvided(operatorPrivateKey) || !checkProvided(operatorAccount)) {
    throw new Error(
      "environment variables REACT_APP_MY_PRIVATE_KEY and REACT_APP_MY_ACCOUNT_ID must be present"
    );
  }
  return hederaClientLocal(operatorAccount, operatorPrivateKey, hederaMainnetEnv);
}

export const hederaClientLocal = (operatorAccount, operatorPrivateKey, hederaMainnetEnv) => {
  let client;

  // hederaMainnetEnv ? client = Client.forMainnet() : client = Client.forTestnet();
  client = Client.forTestnet();

  client.setOperator(operatorAccount, operatorPrivateKey);

  if ((typeof(process.env.REACT_APP_MAX_TX_FEE) !== undefined) && (process.env.REACT_APP_MAX_TX_FEE !== "")) {
    client.setMaxTransactionFee(new Hbar(process.env.REACT_APP_MAX_TX_FEE));
  }

  if ((typeof(process.env.REACT_APP_MAX_QUERY_PAYMENT) !== undefined) && (process.env.REACT_APP_MAX_QUERY_PAYMENT !== "")) {
    client.setMaxQueryPayment(new Hbar(process.env.REACT_APP_MAX_QUERY_PAYMENT));
  }
  
  return client;
}