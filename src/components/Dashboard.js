import {useEffect, useState, useContext} from 'react'

import {
  Paper,
  TextField, 
  Button,
  Box,
  Tab,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  Typography,
  Checkbox
} from '@mui/material'

import {
  TabContext,
  TabList,
  TabPanel,
} from '@mui/lab'

import {
  HederaEnviroment,
  ClientNFT,
  DebugLevel,
  CategoryNFT
} from '@xact-wallet-sdk/nft'

import {
  singleImageMint,
  tokenGetInfo,
  associateToken,
  sellNFT,
  getNFTQRCode,
  removeNFTFromSale,
  createNFTs,
  mintHashlips,
  readJson,
} from '../scripts/tokenService'

import {TokenView} from './TokenView'        
import {HLTokenView} from './HLTokenView'        
import {uploadFile} from '../scripts/fileService'
import TMTContext from '../context/tmt-context'

export const Dashboard = () => {
    /* Create State for Tabs */
    const [tab, setTab] = useState('1');
     
    // Read context of signed in Xact wallet creds
    const context = useContext(TMTContext)
    const user = context?.user
    const accountId = user?.accountId
    const hederaMainnetEnv = context?.hederaMainnetEnv
    const setLoading = context?.setLoading
    const hashlipsToken = context?.hashlipsToken
    const setHashlipsToken = context?.setHashlipsToken
    const token = context?.token
    const setToken = context?.setToken

    const [alreadyMintedToken, setAlreadyMintedToken] = useState(false);
    const [alreadyCreatedCIDs, setAlreadyCreatedCIDs] = useState(false);
    const handleAMTChange = (event) => {
      setAlreadyMintedToken(event.target.checked);
    };
    const handleCIDChange = (event) => {
      setAlreadyCreatedCIDs(event.target.checked);
    };

    const handleTabSelection = (event, newValue) => {
      setTab(newValue);
    };

    const clearLogs = () => {
      /* TODO: refactor to make DRY */
      if (tab==="1") {
        const r = confirm("All HASHLIPS TOKEN DATA will be cleaered from logs, do you want to proceed?");
        if (r !== true) {
          return alert('Canceled Logs Clear')
        }
        localStorage.setItem('hashlipsMintData', []);
      } else {
        const r = confirm("All Tokens will be cleaered from logs, do you want to proceed?");
        if (r !== true) {
          return alert('Canceled Logs Clear')
        }
        localStorage.setItem('tmt_tokens', []);
      }
    }

    const downloadLogs = () => {
      const tokens = tab === "7" ? localStorage.getItem('hashlipsMintData') : localStorage.getItem('tmt_tokens');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(tokens);
      const dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      if (tab === "1") {
        dlAnchorElem.setAttribute("download", "hashlipsMintData_logs.json")
      } else {
        dlAnchorElem.setAttribute("download", "tmt_token_logs.json")
      }
      dlAnchorElem.click();
    }

    const [previousTokenId, setPreviousTokenId] = useState('');
    const [name, setName] = useState('');
    const [creator, setCreator] = useState('');
    const [description, setDescription] = useState('');
    const [maxSupply, setMaxSupply] = useState(0);
    const [symbol, setSymbol] = useState('');
    const [fallbackFee, setFallbackFee] = useState('');
    const [numOfRoyaltyFees, setNumOfRoyaltyFees] = useState('');
    const [numOfAttributes, setNumOfAttributes] = useState('');
    const [treasuryAccountId, setTreasuryAccountId] = useState('');
    const [renewAccountId, setRenewAccountId] = useState('');

    const initMintingHashlips = () => {
      setLoading(true)
      mintHashlips({...hashlipsToken, 
        name: name,
        symbol: symbol,
        maxSupply: maxSupply,
        numOfRoyaltyFees: numOfRoyaltyFees,
        treasuryAccountId: treasuryAccountId,
        renewAccountId: renewAccountId,
        fallbackFee: fallbackFee,
        previousTokenId: previousTokenId,
        alreadyCreatedCIDs: alreadyCreatedCIDs
      }, user, hederaMainnetEnv, setLoading)
    }

    const royaltyFields = []
    for (let index = 0; index < numOfRoyaltyFees; index++) {
      royaltyFields.push(
      <>
        <TextField          
            style={{width:'100%'}}
            type="number"
            placeholder={"Royalty % "+index}
            label={"Royalty % "+index}
            value={hashlipsToken['royalty'+index] }
            disabled={alreadyMintedToken}
            onInput={ e=>setHashlipsToken({...hashlipsToken, ['royalty'+index]: e.target.value})}
        /> 
        <br />
        <br />
        <TextField          
            style={{width:'100%'}}
            type="text"
            placeholder={"Royalty Account ID"+index}
            label={"Royalty Account ID"+index}
            value={hashlipsToken['royaltyAccountId'+index]}
            disabled={alreadyMintedToken}
            onInput={ e=>setHashlipsToken({...hashlipsToken, ['royaltyAccountId'+index]: e.target.value})}
        /> 
        <br />
        <br />
      </>)
    }

    const attributeFields = []
    for (let index = 0; index < numOfAttributes; index++) {
      attributeFields.push(
      <>
        <TextField          
            style={{width:'100%'}}
            type="text"
            placeholder={"trait_type "+index}
            label={"trait_type "+index}
            value={token['trait_type'+index] }
            disabled={alreadyMintedToken}
            onInput={ e=>setToken({...token, ['trait_type'+index]: e.target.value})}
        /> 
        <br />
        <br />
        <TextField          
            style={{width:'100%'}}
            type="text"
            placeholder={"value "+index}
            label={"value "+index}
            value={token['value'+index]}
            onInput={ e=>setToken({...token, ['value'+index]: e.target.value})}
        />
        <br />
        <br />
      </>)
    }
    
    const singleMintRoyaltyFields = []
    for (let index = 0; index < numOfRoyaltyFees; index++) {
      singleMintRoyaltyFields.push(
      <>
        <TextField          
            style={{width:'100%'}}
            type="number"
            placeholder={"Royalty % "+index}
            label={"Royalty % "+index}
            value={token['royalty'+index] }
            disabled={alreadyMintedToken}
            onInput={ e=>setToken({...token, ['royalty'+index]: e.target.value})}
        /> 
        <br />
        <br />
        <TextField          
            style={{width:'100%'}}
            type="text"
            placeholder={"Royalty Account ID"+index}
            label={"Royalty Account ID"+index}
            value={token['royaltyAccountId'+index]}
            disabled={alreadyMintedToken}
            onInput={ e=>setToken({...token, ['royaltyAccountId'+index]: e.target.value})}
        /> 
        <br />
        <br />
      </>)
  }
    return( 
      <div>
        <Box md={{ width: '100%', typography: 'body1' }}>
          <TabContext value={tab}>
            <Box lg={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList variant="fullWidth" onChange={handleTabSelection} aria-label="lab API tabs example">
                <Tab label="Hashlips Minting" value="1" />
                <Tab label="Single Minting" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 3 }}>
                <Grid item md={6}>
                  <Grid item xs={12}>
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Previous Token Id"}
                        label={"Previous Token Id"}
                        value={previousTokenId}
                        disabled={!alreadyMintedToken}
                        onInput={ e=>setPreviousTokenId(e.target.value)}
                    /> 

                    <Checkbox
                      checked={alreadyMintedToken}
                      onChange={handleAMTChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    /> I am minting more on a tokenID already created
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Token Name"}
                        label={"Token Name"}
                        value={name}
                        disabled={alreadyMintedToken}
                        onInput={ e=>setName(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Token Symbol"}
                        label={"Token Symbol"}
                        value={symbol}
                        disabled={alreadyMintedToken}
                        onInput={ e=>setSymbol(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Max Supply"}
                        label={"Max Supply"}
                        type="number"
                        value={maxSupply}
                        disabled={alreadyMintedToken}
                        onInput={ e=>setMaxSupply(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        type="number"
                        placeholder={"Number of Royalty Accounts"}
                        label={"Number of Royalty Accounts"}
                        value={numOfRoyaltyFees}
                        disabled={alreadyMintedToken}
                        onInput={ e=>setNumOfRoyaltyFees(e.target.value)}
                    /> 
                    <br />
                    <br />
                    {royaltyFields}
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Treasury Account ID"}
                        label={"Treasury Account ID"}
                        value={treasuryAccountId}
                        onInput={ e=>setTreasuryAccountId(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Auto Renew"}
                        label={"Auto Renew Account ID"}
                        value={renewAccountId}
                        onInput={ e=>setRenewAccountId(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <TextField          
                        style={{width:'100%'}}
                        placeholder={"Fallback Fee"}
                        label={"Fallback Fee"}
                        value={fallbackFee}
                        onInput={ e=>setFallbackFee(e.target.value)}
                    /> 
                    <br />
                    <br />
                    <span>
                      Select the directory that has all of your hashlips images generated by Hashlips:
                    </span>
                    <br />
                    {/* <input type="file" id="hl-images" webkitdirectory="true"  multiple/>
                    IF USING LINUX OR WINDOWS, 
                    UNCOMMENT Line 553 AND COMMENT OUT LINE 550 */}
                    <input disabled={alreadyCreatedCIDs} type="file" id="hl-images" webkitdirectory  multiple/> 
                    <br />
                    <br />
                    <span>
                      Select the _metadata.json file that has all of your file metadata generated by Hashlips:
                    </span>
                    <br />
                    <input disabled={alreadyCreatedCIDs} type="file" id="hl-json" />
                    <br />
                    <br />
                    <Checkbox
                      checked={alreadyCreatedCIDs}
                      onChange={handleCIDChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    /> I already uploaded my metadata and images to IPFS
                    <br />
                    <br />
                    <span>
                      Select the JSON file with already created CIDs (ordered highest to lowest #, top to bottom):
                    </span>
                    <br />
                    <input disabled={!alreadyCreatedCIDs} type="file" id="cid-json" />
                    <br />
                  </Grid>
                </Grid>
                <br/>
                <Grid item xs={12}>
                  <br/>
                  <br/>
                  <Button
                      style={{width:'50%'}}
                      variant="contained"
                      component="label"
                      onClick={() => {
                        initMintingHashlips(hashlipsToken, user, hederaMainnetEnv)
                      }}
                  >
                      Mint Collection
                  </Button>
                </Grid>
                </Grid>
            </TabPanel>
            <TabPanel value="2">
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 3 }}>
                <Grid item md={6}>
                  <Grid item xs={12}>
                    { 
                      token.imageData ? 
                        <img style={{width:'300px'}} src={token.imageData} /> : 
                        <div style={{width: '300px', height: '300px', background: '#1C1C1C'}}> 
                        </div>
                    }
                  </Grid>
                  <Grid item xs={12}>
                      <Button
                        style={{float:"left", width:"300px", margin: "15px 0"}}
                        variant="contained"
                        component="label"
                        >
                          Upload File
                        <input
                          type="file"
                          id="single-image"
                          onChange={(e) => uploadFile(e, token, setToken)}
                          hidden
                        />
                      </Button>
                  </Grid>
                </Grid>
                <Grid item md={6}>
                  <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12}>
                      <TextField         
                          label="Name" 
                          style={{width:'100%'}} 
                          placeholder={"Name"}
                          value={name}
                          onInput={ e=>setName(e.target.value)}
                      />
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField    
                          label="Description" 
                          style={{width:'100%'}}      
                          placeholder={"Description"}
                          value={description}
                          onInput={ e=>setDescription(e.target.value)}
                      />
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                          label="Creator" 
                          style={{width:'100%'}}         
                          placeholder={"Creator"}
                          value={creator}
                          onInput={ e=>setCreator( e.target.value)}
                      />
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                          label="Quantity" 
                          style={{width:'100%'}}
                          placeholder={"Quantity"}
                          type="number"
                          value={maxSupply}
                          onInput={ e=>setMaxSupply(e.target.value)}
                      />
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField          
                          style={{width:'100%'}}
                          placeholder={"Token Symbol"}
                          label={"Token Symbol"}
                          value={symbol}
                          onInput={ e=>setSymbol(e.target.value)}
                      /> 
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField          
                          style={{width:'100%'}}
                          placeholder={"Fallback Fee"}
                          label={"Fallback Fee"}
                          value={fallbackFee}
                          onInput={ e=>setFallbackFee(e.target.value)}
                      /> 
                      <br />
                      <br />
                    </Grid>
                    <Grid item xs={12}>
                    <TextField          
                        style={{width:'100%'}}
                        type="number"
                        placeholder={"Number of Royalty Accounts"}
                        label={"Number of Royalty Accounts"}
                        value={numOfRoyaltyFees}
                        onInput={ e=>setNumOfRoyaltyFees(e.target.value)}
                    /> 
                    <br />
                    <br />
                    {singleMintRoyaltyFields}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField          
                        style={{width:'100%'}}
                        type="number"
                        placeholder={"Number of Attributes"}
                        label={"Number of Attributes"}
                        value={numOfAttributes}
                        onInput={ e=>setNumOfAttributes(e.target.value)}
                    /> 
                    <br />
                    <br />
                    {attributeFields}
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        style={{width:'100%'}}
                        variant="contained"
                        component="label"
                        onClick={() => {
                          setLoading(true)
                          singleImageMint(hederaMainnetEnv, {
                          ...token,
                          imageData: token?.imageData,
                          name: name,
                          creator: creator,
                          description: description,
                          maxSupply: maxSupply,
                          numOfAttributes:numOfAttributes,
                          symbol: symbol,
                          numOfRoyaltyFees: numOfRoyaltyFees,
                          fallbackFee: fallbackFee
                        }, user, setLoading)}}
                        // onClick={() => {xactCreateToken(client,hederaMainnetEnv, token, setLoading)}}
                        disabled={
                          !token?.imageData || 
                          !name || 
                          !creator || 
                          !description || 
                          !maxSupply ||
                          !symbol ||
                          !fallbackFee
                        }
                      >
                        Create & Mint
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
                
            </TabPanel>
          </TabContext>
        </Box>
        <br />
        <Box>
          <a id="downloadAnchorElem" style={{display:"none"}}></a>
            <>
              {/* <Button
                style={{float: 'right', background:'#0f0f0f'}}
                variant="contained"
                component="label"
                onClick={clearLogs}
              >
                Clear Logs
              </Button> */}
              <Button
                style={{float: 'right', background:'#0f0f0f'}}
                variant="contained"
                component="label"
                onClick={downloadLogs}
              >
                Download Logs
              </Button>
              <HLTokenView /> 
            </>
        </Box>
      </div>
    );
}