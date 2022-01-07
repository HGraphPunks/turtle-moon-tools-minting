import * as React from 'react';
import {useEffect} from 'react'
import Container from '@mui/material/Container';
import {Button, Box, TextField, Typography, Modal} from '@mui/material';
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
        <Link color="inherit" href="https://docs.xact.ac/sdk/javascript">
          Powered by Xact 
        </Link>{' '}
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
  const [user, setUser] = React.useState(true);
  const handleDonationOpen = () => setDonationOpen(true);
  const handleDonationClose = () => setDonationOpen(false);

  const changeEnv = (event) => {
    setEnv(event.target.checked);
  };

  /* When ENV Toggle is hit, Update application */
  useEffect(async () => {
    setUser(false)
    // Clear QR code data to display loading icon
    setQrData('')
    // set env to testnet by default
  
    const client = {};
    setXactClient(client)
    setLoginOpen(false)

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
      <TMTProvider value={{hederaMainnetEnv:hederaMainnetEnv, user:user, xactClient: xactClient, setLoading: setLoading}}>
      <AppBar position='static' style={{margin: '0 auto'}}>
        <Toolbar style={{position:'relative', width: '96vw', margin: '0 auto', maxWidth: '1200px'}} > 
          <img src={logo} style={{width:'50px', height:'50px'}} />
          &nbsp;
          &nbsp;
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{color: 'grey'}}>
            Alpha (v0.0.8) &nbsp;<span style={{color:"#efefef"}}>{hederaMainnetEnv ? "Mainnet" : "Testnet"}</span>
          </Typography> 
          <Button onClick={handleDonationOpen}>
            Donate
          </Button>
          &nbsp;
          &nbsp;
          &nbsp;
          &nbsp;
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
          {/* <Button variant="contained" onClick={disconnectUser}>
            Disconect {user.accountId}
          </Button> */}
          <Modal
              open={donationOpen}
              onClose={handleDonationClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography style={{textAlign:'center'}} id="modal-modal-title" variant="h6" component="h2">
                  Donate to 🐢🌕🛠️
                </Typography>
                { true ?
                  <Typography style={{textAlign:'center'}} sx={{ mt: 2 }}>
                    We appreicate your support!<br /><br />You can send HBAR to this address<br /> <span style={{fontSize:"25px"}}>0.0.591814</span><br />
                  <br />   
            
                  </Typography>
                  :
                  <>
                    <Typography style={{textAlign:'center'}} sx={{ mt: 2 }}>   
                      We appreicate your support! <br />  <br /> 
                      Enter amount below and hit "donate".
                      Then accept the transaction with the wallet you are logged in with. 
                    </Typography>
                    <br />
                    <br />
                    <TextField 
                      label="Donation Amount"
                      style={{width:'100%'}}
                      value={amount}
                      type="number"
                      onInput={ e=>setDonationAmount(e.target.value)}
                      >
                    </TextField>
                    <br />
                    <br />
                    <Button variant="contained" style={{width:'100%'}} onClick={()=>{donation(xactClient, user.accountId, amount, setLoading)}} >
                      Donate
                    </Button>
                  </>
                }
              </Box>
          </Modal>
          <Modal
              open={loginOpen}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography style={{textAlign:'center'}} id="modal-modal-title" variant="h6" component="h2">
                  Login with XACT dApp Browser
                </Typography>
                <br />
                <br />
                <div style={{margin: '0 auto', height: '256px', display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                  
                  { qrData ? 
                    <img src={qrData} style={{margin: '0 auto'}} /> 
                   :<Loading />
                  }
                  </div>
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
                <br />
                <div style={{color: '#8159EF', display:'flex', alignItems: 'center', justifyContent: 'center'}}>
                    We appreicate your support!
                </div>
                <div><center><div style={{color: '#8159EF'}}>Donation Wallet:</div><b>0.0.591814</b></center></div><br />
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
                Loading... 
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
