import {Client, 
  DebugLevel,} from '@xact-wallet-sdk/client'

export const generateLogin = async (hederaMainnetEnv, setQrData, setUser, setLoginOpen) => {
  //get your api key from your .env file
  const apiKey = hederaMainnetEnv ? process.env.REACT_APP_XACT_PRIVATE_KEY_MAINNET : process.env.REACT_APP_XACT_PRIVATE_KEY_TESTNET;
  // If we weren't able to find it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }
  /* Create a new instance of Client */
  // testnet beta creds, remove options for prod
  const client = new Client({apiKey: apiKey})
  
  /* Init the connection */
  await client.initConnexion();
  
  /* Generate a QR Code */
  const qrCode = await client.generateQRCode();
  /* Subscribe to new Connections */
  client.connect().subscribe(user => {
    console.log('new connexion', JSON.stringify(user));
    localStorage.setItem('tmt-user', JSON.stringify(user))
    setUser(user)
    setLoginOpen(false);
  });

  setQrData(qrCode)

  return client
}
