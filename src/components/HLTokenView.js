import {useState} from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Link,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { BrowserWindow } from 'electron';


export const HLTokenView = () => {
  let hashlipsMintLocalData = []
  for (var a in localStorage) {
    if (a.indexOf('hashlipsMintData') !== -1) {
      hashlipsMintLocalData.push(JSON.parse(localStorage[a]));
    }
  }
  const logs = hashlipsMintLocalData;
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const openBlank = (link) => {
    window.open(link, '_blank', 'top=500,left=200,frame=true,nodeIntegration=no')
  }

  return( 
    <>
    <Typography variant="h5" style={{padding: '5px'}} component="h5">
      Minted Token Logs
    </Typography>
    <div style={{width: '100%', minHeight: '300px',background:'#000', color:'#fff'}}>
      {logs?.reverse()?.map((log, index) => {
        return <Accordion key={index} expanded={expanded === 'panel'+index} onChange={handleChange('panel'+index)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {log?.tokenId}
            </Typography>
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {log?.mainnet ? "MAINNET" : "TESTNET"}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}> Quantity: {log?.nftIds?.length}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}> 
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metadata</TableCell>
                        <TableCell align="right">NFT Id</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {log.urls.map((url, urlIndex) => {
                        return <TableRow
                                key={index+'_'+urlIndex}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                            <TableCell component="th" scope="row">
                              <Link onClick={()=> {openBlank(url)}}>IPFS</Link>
                            </TableCell>
                            <TableCell align="right">
                              {log?.nftIds[urlIndex]}
                            </TableCell>
                          </TableRow>
                        })
                      }
                        
                    </TableBody>
                  </Table>
                </TableContainer>
                </ Grid>
              </ Grid>
              <Grid item xs={12} style={{padding: '30px'}}>
               <Grid item xs={6} style={{padding: '30px'}}>
                  <img style={{width: '90%', maxWidth: '400px'}} src={log?.imageURL?.photo} />
                  <br />
              </ Grid>
              </ Grid>
          </AccordionDetails>
        </Accordion>
      })}
    </div>
    </>
  );
}