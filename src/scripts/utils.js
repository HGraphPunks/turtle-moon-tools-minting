
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
  const operatorPrivateKey = process.env.REACT_APP_MY_PRIVATE_KEY;
  const operatorAccount = hederaMainnetEnv ? process.env.REACT_APP_MY_ACCOUNT_ID_MAINNET : process.env.REACT_APP_MY_ACCOUNT_ID_TESTNET;
  console.log(operatorPrivateKey);
  console.log(hederaMainnetEnv);
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

  hederaMainnetEnv ? client = Client.forMainnet() : client = Client.forTestnet();

  client.setOperator(operatorAccount, operatorPrivateKey);

  if ((typeof(process.env.REACT_APP_MAX_TX_FEE) !== undefined) && (process.env.REACT_APP_MAX_TX_FEE !== "")) {
    client.setMaxTransactionFee(new Hbar(process.env.REACT_APP_MAX_TX_FEE));
  }

  if ((typeof(process.env.REACT_APP_MAX_QUERY_PAYMENT) !== undefined) && (process.env.REACT_APP_MAX_QUERY_PAYMENT !== "")) {
    client.setMaxQueryPayment(new Hbar(process.env.REACT_APP_MAX_QUERY_PAYMENT));
  }
  
  return client;
}














// export function getUserAccounts() {
//   let accounts = [];
//   if (state.getters.numberOfAccounts !== 0) {
//     for (const key in state.getters.getAccounts) {
//       if (state.getters.getAccounts[key].account.wallet !== "Issuer") {
//         accounts.push(key);
//       }
//     }
//   }

//   return accounts;
// }

// export function getUserAccountsWithNames(exclude) {
//   let accounts = [];
//   const account = {
//     accountId: "0.0.306412",
//     name: "Issuer"
//   };
//   accounts.push(account);
//   accounts.map((account) => {
//     return {
//         accountId: key,
//         name: ''
//     };
//   })
//     const account = {
//     accountId: key,
//     name: state.getters.getAccounts[key].account.wallet
//     };
//   }

//   return accounts;
// }

// export function amountWithDecimals(amount, decimals) {
//   return (amount / parseFloat(Math.pow(10, decimals))).toFixed(decimals);
// }

// export function getPrivateKeyForAccount(accountId) {
//   return state.getters.getAccounts[accountId].account.privateKey;
// }

// export function getAccountDetails(account) {
//   return {
//     accountId: process.env.REACT_APP_MY_ACCOUNT_ID,
//     privateKey: process.env.REACT_APP_MY_PRIVATE_KEY
//   };
// }

// export function secondsToParts(seconds) {
//   const secondsInMonth = 30 * 24 * 60 * 60;
//   const secondsInDay = 24 * 60 * 60;
//   const secondsInHour = 60 * 60;

//   const months = seconds / secondsInMonth;
//   seconds = seconds % secondsInMonth;
//   const days = seconds / secondsInDay;
//   seconds = seconds % secondsInDay;
//   const hours = seconds / secondsInHour;
//   seconds = seconds % secondsInHour;
//   const minutes = seconds / 60;
//   seconds = seconds % 60;

//   let result = months + " months ";
//   if (days + hours + minutes + seconds != 0) {
//     result += days + " days ";
//     if (hours + minutes + seconds != 0) {
//       result += hours + " hours ";
//       if (minutes + seconds != 0) {
//         result += minutes + " minutes ";
//         if (seconds != 0) {
//           result += seconds + " seconds ";
//         }
//       }
//     }
//   }
//   return result;
// }
