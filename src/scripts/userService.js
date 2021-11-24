import {Client} from '@xact-wallet-sdk/client'

export const generateQrCode = async (hederaMainnetEnv, setQrData, setUser) => {
  //get your api key from your .env file
  const apiKey = hederaMainnetEnv ? process.env.REACT_APP_XACT_PRIVATE_KEY_MAINNET : process.env.REACT_APP_XACT_PRIVATE_KEY_TESTNET;
  // If we weren't able to find it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }
  /* Create a new instance of Client */
  const client = new Client({apiKey});
  
  /* Init the connection */
  await client.initConnexion();
  
  /* Generate a QR Code */
  const qrCode = await client.generateQRCode();

  /* Subscribe to new Connections */
  client.connect().subscribe(user => {
    console.log('new connexion', user);
    setUser(user)
  });

  setQrData(qrCode)
}
