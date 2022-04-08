import * as React from 'react';
import {useEffect} from 'react'
import Container from '@mui/material/Container';
import {Button, Box, TextField, Typography, Modal, StepConnector} from '@mui/material';
import Link from '@mui/material/Link';
import AppBar from '@mui/material/AppBar';
import {Toolbar, FormGroup, FormControlLabel, Switch} from '@mui/material';
import {Dashboard} from './components/Dashboard';
import {Loading} from './components/Loading';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {donation} from './scripts/donationService';
import {generateLogin} from './scripts/walletConnectService';
import {TMTProvider} from './context/tmt-context';
import {Client} from '@xact-wallet-sdk/client'
import logo from './assets/TMT_Logo.png';

function Copyright() {
  return (
    <>
      <Typography variant="body2" color="text.secondary" align="center">
        <br />
        <br />
        {'Built by '}
        <Link color="inherit" href="https://turtlemoon.io/">
          Turtle Moon
        </Link>{' '}
        {new Date().getFullYear()}. {' '}
        <br/>
      </Typography>
      <br />
      <br />
    </>
  );
}

export default function App() {
  const [hederaMainnetEnv, setEnv] = React.useState(false);
  const [amount, setDonationAmount] = React.useState(50);
  const [donationOpen, setDonationOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [xactClient, setXactClient] = React.useState({});
  const [qrData, setQrData] = React.useState('');
  const [user, setUser] = React.useState({
    accountId: '',
    pk: '',
    nftStorageAPI: '',
  });

  /* Init Hashlips Token  State */
  const [hashlipsToken, setHashlipsToken] = React.useState(
    {
      name: '',
      symbol: '',
      maxSupply: '',
      numOfRoyaltyFees: 1,
      royalty0: '',
      royaltyAccountId0: '',
      treasuryAccountId: '',
      renewAccountId: '',
      fallbackFee: 5,
      previousTokenId: ''
    }
  );

  /* Init Tokeen State */
  const [token, setToken] = React.useState(
    {
      name: '',
      tokenId: '',
      description: '',
      creator: '',
      supply: '',
      category: 'Collectible',
      royalty: '',
      numOfRoyaltyFees: 0,
      numOfAttributes: 0,
      imageUrl: '',
      imageData: undefined,
      imageType: 'image/jpg',
      photoSize: 1,
      treasuryAccountId: '',
      renewAccountId: '',
    }
  );


  const changeEnv = (event) => {
    setEnv(event.target.checked);
    const savedUser = localStorage.getItem('tmt_user_mainnet-'+event.target.checked) || JSON.stringify({
      accountId: '',
      pk: '',
      nftStorageAPI: '',
    })
    setUser(JSON.parse(savedUser));
  };

  const disconnectUser = () => {
    setUser({})
    setLoginOpen(true)
  };

  const tmtConnect = () => {
    setLoginOpen(false)
    localStorage.setItem('tmt_user_mainnet-'+hederaMainnetEnv, JSON.stringify(user));
  };

  /* When ENV Toggle is hit, Update application */
  useEffect(async () => {
    // setUser({...user,
    //   accountId: hederaMainnetEnv ? process.env.REACT_APP_MY_ACCOUNT_ID_MAINNET : process.env.REACT_APP_MY_ACCOUNT_ID_TESTNET  
    // })
    // Clear QR code data to display loading icon
    setQrData('')
    // set env to testnet by default
    const savedUser = localStorage.getItem('tmt_user_mainnet-'+hederaMainnetEnv) || JSON.stringify(user)
    setUser(JSON.parse(savedUser));
    setLoginOpen(true)
    // setHashlipsToken({...hashlipsToken,
    //   treasuryAccountId: hederaMainnetEnv ? process.env.REACT_APP_MY_ACCOUNT_ID_MAINNET : process.env.REACT_APP_MY_ACCOUNT_ID_TESTNET,
    //   renewAccountId: hederaMainnetEnv ? process.env.REACT_APP_MY_ACCOUNT_ID_MAINNET : process.env.REACT_APP_MY_ACCOUNT_ID_TESTNET,
    // })

  },[hederaMainnetEnv])

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    outline: 'none',
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        light: '#757ce8',
        main: '#8159EF',
        dark: '#412C77',
        contrastText: '#efefef',
      },
    },
    TextField: {
      width: '100%'
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <TMTProvider value={{hederaMainnetEnv:hederaMainnetEnv, user:user, token:token, setToken:setToken, setLoading: setLoading, hashlipsToken:hashlipsToken, setHashlipsToken:setHashlipsToken }}>
      <AppBar position='static' style={{margin: '0 auto'}}>
        <Toolbar style={{position:'relative', width: '100vw', margin: '0 auto', maxWidth: '1200px'}} > 
          <img src={logo} style={{width:'50px', height:'50px'}} />
          &nbsp;
          &nbsp;
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{color: 'grey'}}>
            Beta (v0.9.3) &nbsp;<span style={{color:"#efefef"}}>{hederaMainnetEnv ? "Mainnet" : "Testnet"}</span>
          </Typography> 
          &nbsp;
          &nbsp;
          &nbsp;
          &nbsp;
          {/*  */}
          {user?.accountId ? <Button variant="contained" onClick={disconnectUser}>
            Disconect {user.accountId}
          </Button>: <></>}
          <Modal
              open={loginOpen}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography style={{textAlign:'center'}} id="modal-modal-title" variant="h6" component="h2">
                  Account ID and Private Key
                </Typography>
                <br />
                <br />
                <TextField          
                    style={{width:'100%'}}
                    type="text"
                    placeholder={"Account ID"}
                    label={"Minting Account ID"}
                    value={user.accountId}
                    onInput={ e=>setUser({...user, accountId: e.target.value})}
                /> 
                <br />
                <br />
                <TextField          
                    style={{width:'100%'}}
                    type="text"
                    placeholder={"Minting Private Key"}
                    label={"Minting Wallet Private Key"}
                    value={user.pk}
                    onInput={ e=>setUser({...user, pk: e.target.value})}
                /> 
                <br />
                <br />
                <TextField          
                    style={{width:'100%'}}
                    type="text"
                    placeholder={"NFT Storage API Key"}
                    label={"NFT Storage API Key"}
                    value={user.nftStorageAPI}
                    onInput={ e=>setUser({...user, nftStorageAPI: e.target.value})}
                /> 
                <br />
                <br />
                <div style={{display:'flex', maringBottom: '25px', alignItems: 'center', justifyContent: 'center'}}>
                  <FormGroup>
                    <FormControlLabel
                        label={hederaMainnetEnv ? 'Mainnet' : 'Testnet'}
                        control={
                          <Switch
                            checked={hederaMainnetEnv}
                            onChange={changeEnv}
                            aria-label="env switch"
                          />
                        }
                      />
                  </FormGroup>
                </div>
                <Button
                    style={{width:'100%', margin: '20px auto'}}
                    variant="contained"
                    component="label"
                    onClick={() => {tmtConnect()}}
                >
                  Connect
                </Button>
                <br />
                <div style={{color: '#8159EF',textAlign:'center'}}>
                  Any use of this BETA application is done at your own risk.
                </div>
                <br />
                <div style={{color: '#8159EF', textAlign:'center'}}>
                  Share your creations on twitter with the hashtag #TMTNFT @TurtleMoonCC
                </div>
                <br />
                <div style={{color: '#8159EF', display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                    We appreciate your support!
                </div>
                <div><center><div style={{color: '#8159EF', fontSize:'16pt'}}>Donation Wallet:</div><span style={{fontSize:'16pt'}}><b>0.0.591814</b></span></center></div><br />
              </Box>
          </Modal>
          <Modal
              open={loading}
              aria-describedby="modal-modal-description" 
            >
            <Box sx={style}>
             
              <div style={{margin: '0 auto', height: '256px', display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                  
                  <Loading />
              </div>    
              <Typography style={{textAlign:'center'}} id="modal-modal-title" variant="h6" component="h2">
                Minting...  
              </Typography>   
            </Box>
          </Modal>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">    
        <CssBaseline />
        <Dashboard /> 
        <Copyright />
      </Container>
      </TMTProvider>
    </ThemeProvider>
  );
}
